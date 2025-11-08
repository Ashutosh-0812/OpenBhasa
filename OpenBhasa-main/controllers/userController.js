const User = require('../models/User');
const Recording = require('../models/Recording');

// @desc    Add participant (by student)
// @route   POST /api/participants
// @access  Student only
const addParticipant = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      college,
      age,
      gender,
      native,
      language,
      dialects,
      accent
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      });
    }

    // Create participant with managedBy reference to student
    const participant = await User.create({
      name,
      email,
      phone,
      password,
      college,
      age,
      gender,
      native,
      language,
      dialects,
      accent,
      role: 'participant',
      managedBy: req.user._id,
      isVerified: true // Auto-verify participants added by students
    });

    // Add participant to student's participants array
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { participants: participant._id }
    });

    // Return participant without password
    const participantObj = participant.toObject();
    delete participantObj.password;

    res.status(201).json({
      message: 'Participant added successfully',
      participant: participantObj
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my participants
// @route   GET /api/participants/my-participants
// @access  Student only
const getMyParticipants = async (req, res) => {
  try {
    const participants = await User.find({
      managedBy: req.user._id,
      role: 'participant',
      isActive: true
    })
      .select('-password -refreshToken')
      .sort({ createdAt: -1 });

    // Get stats for each participant
    const participantsWithStats = await Promise.all(
      participants.map(async (participant) => {
        const recordingStats = await Recording.aggregate([
          { $match: { contributor: participant._id } },
          {
            $group: {
              _id: '$reviewStatus',
              count: { $sum: 1 }
            }
          }
        ]);

        const stats = {
          total: 0,
          pending: 0,
          approved: 0,
          rejected: 0,
          needs_revision: 0
        };

        recordingStats.forEach(stat => {
          stats[stat._id] = stat.count;
          stats.total += stat.count;
        });

        return {
          ...participant.toObject(),
          recordingStats: stats
        };
      })
    );

    res.json({
      participants: participantsWithStats,
      total: participantsWithStats.length
    });
  } catch (error) {
    console.error('Get my participants error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get participant details
// @route   GET /api/participants/:id
// @access  Student (own participant), Admin
const getParticipant = async (req, res) => {
  try {
    const participant = await User.findById(req.params.id)
      .select('-password -refreshToken')
      .populate('managedBy', 'name email');

    if (!participant || participant.role !== 'participant') {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check permissions
    if (req.user.role === 'student' && participant.managedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get detailed stats
    const recordingStats = await Recording.aggregate([
      { $match: { contributor: participant._id } },
      {
        $group: {
          _id: '$reviewStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      needs_revision: 0
    };

    recordingStats.forEach(stat => {
      stats[stat._id] = stat.count;
      stats.total += stat.count;
    });

    // Get recent recordings
    const recentRecordings = await Recording.find({
      contributor: participant._id
    })
      .populate('task', 'title')
      .populate('project', 'title')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('task project reviewStatus createdAt');

    res.json({
      participant: participant.toObject(),
      stats,
      recentRecordings
    });
  } catch (error) {
    console.error('Get participant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update participant
// @route   PUT /api/participants/:id
// @access  Student (own participant), Admin
const updateParticipant = async (req, res) => {
  try {
    const participant = await User.findById(req.params.id);

    if (!participant || participant.role !== 'participant') {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check permissions
    if (req.user.role === 'student' && participant.managedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const {
      name,
      phone,
      college,
      age,
      gender,
      native,
      language,
      dialects,
      accent,
      isActive
    } = req.body;

    if (name) participant.name = name;
    if (phone) participant.phone = phone;
    if (college) participant.college = college;
    if (age) participant.age = age;
    if (gender) participant.gender = gender;
    if (native) participant.native = native;
    if (language) participant.language = language;
    if (dialects) participant.dialects = dialects;
    if (accent) participant.accent = accent;
    if (typeof isActive !== 'undefined') participant.isActive = isActive;

    await participant.save();

    const updatedParticipant = participant.toObject();
    delete updatedParticipant.password;

    res.json({
      message: 'Participant updated successfully',
      participant: updatedParticipant
    });
  } catch (error) {
    console.error('Update participant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Remove participant
// @route   DELETE /api/participants/:id
// @access  Student (own participant), Admin
const removeParticipant = async (req, res) => {
  try {
    const participant = await User.findById(req.params.id);

    if (!participant || participant.role !== 'participant') {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Check permissions
    if (req.user.role === 'student' && participant.managedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if participant has recordings
    const recordingsCount = await Recording.countDocuments({
      contributor: participant._id
    });

    if (recordingsCount > 0) {
      // Soft delete - deactivate instead
      participant.isActive = false;
      await participant.save();

      return res.json({
        message: 'Participant deactivated (has existing recordings)'
      });
    }

    // Remove from student's participants array
    await User.findByIdAndUpdate(participant.managedBy, {
      $pull: { participants: participant._id }
    });

    // Hard delete if no recordings
    await participant.deleteOne();

    res.json({ message: 'Participant removed successfully' });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all reviewers (for admin to assign)
// @route   GET /api/reviewers
// @access  Admin only
const getAllReviewers = async (req, res) => {
  try {
    const reviewers = await User.find({
      role: 'reviewer',
      isActive: true
    })
      .select('-password -refreshToken')
      .populate('assignedProjects', 'title language status')
      .sort({ name: 1 });

    res.json({
      reviewers,
      total: reviewers.length
    });
  } catch (error) {
    console.error('Get reviewers error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Add reviewer (create reviewer account)
// @route   POST /api/reviewers
// @access  Admin only
const addReviewer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      college,
      age,
      gender,
      native,
      language,
      dialects,
      accent
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      });
    }

    const reviewer = await User.create({
      name,
      email,
      phone,
      password,
      college,
      age,
      gender,
      native,
      language,
      dialects,
      accent,
      role: 'reviewer',
      isVerified: true
    });

    const reviewerObj = reviewer.toObject();
    delete reviewerObj.password;

    res.status(201).json({
      message: 'Reviewer added successfully',
      reviewer: reviewerObj
    });
  } catch (error) {
    console.error('Add reviewer error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all users (admin, student)
// @route   GET /api/users
// @access  Admin, Student
const getAllUsers = async (req, res) => {
  try {
    console.log('🔍 GET ALL USERS REQUEST');
    console.log('👤 User Info:', { 
      id: req.user._id, 
      role: req.user.role, 
      email: req.user.email 
    });
    
    const { role, page = 1, limit = 50 } = req.query;
    
    const query = {};
    
    // Filter by role if specified
    if (role) {
      query.role = role;
    }
    
    // Students can only see their own participants for task assignment
    if (req.user.role === 'student') {
      query.role = 'participant';
      query.managedBy = req.user._id;
      console.log('👨‍🎓 Student accessing users - filtering to their participants only:', req.user.email);
    }
    
    console.log('📋 Query filter:', query);
    
    const users = await User.find(query)
      .select('-password -tokens') // Exclude sensitive fields
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const count = await User.countDocuments(query);
    
    console.log('✅ Users found:', users.length);
    
    res.json({
      users,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('❌ Get all users error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  addParticipant,
  getMyParticipants,
  getParticipant,
  updateParticipant,
  removeParticipant,
  getAllReviewers,
  addReviewer,
  getAllUsers
};
