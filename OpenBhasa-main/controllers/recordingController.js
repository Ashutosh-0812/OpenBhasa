const Recording = require('../models/Recording');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Submit recording
// @route   POST /api/recordings
// @access  Student, Participant
const submitRecording = async (req, res) => {
  try {
    const {
      taskId,
      audioUrl,
      duration,
      fileSize,
      format,
      transcript,
      recordingEnvironment,
      deviceInfo
    } = req.body;

    // Verify task exists and is active
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.status !== 'active' || task.approvalStatus !== 'approved') {
      return res.status(400).json({
        message: 'This task is not available for recording'
      });
    }

    // Check if user already submitted for this task
    const existingRecording = await Recording.findOne({
      task: taskId,
      contributor: req.user._id,
      reviewStatus: { $ne: 'rejected' }
    });

    if (existingRecording) {
      return res.status(400).json({
        message: 'You have already submitted a recording for this task'
      });
    }

    // Get managed by student if user is participant
    let managedBy = null;
    if (req.user.role === 'participant') {
      managedBy = req.user.managedBy;
    }

    const recording = await Recording.create({
      task: taskId,
      project: task.project,
      contributor: req.user._id,
      managedBy,
      audioUrl,
      duration,
      fileSize,
      format,
      transcript,
      recordingEnvironment,
      deviceInfo,
      reviewStatus: 'pending'
    });

    // Update task completed recordings count
    await Task.findByIdAndUpdate(taskId, {
      $inc: { completedRecordings: 1 }
    });

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalRecordings': 1 }
    });

    // Update project metadata
    await Project.findByIdAndUpdate(task.project, {
      $inc: { 'metadata.completedRecordings': 1 }
    });

    const populatedRecording = await Recording.findById(recording._id)
      .populate('task', 'title script')
      .populate('project', 'title')
      .populate('contributor', 'name email role');

    res.status(201).json({
      message: 'Recording submitted successfully',
      recording: populatedRecording
    });
  } catch (error) {
    console.error('Submit recording error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get recordings (filtered by role)
// @route   GET /api/recordings
// @access  All authenticated users
const getRecordings = async (req, res) => {
  try {
    const {
      project,
      task,
      reviewStatus,
      contributor,
      page = 1,
      limit = 20
    } = req.query;

    const query = { isDeleted: false };

    if (project) query.project = project;
    if (task) query.task = task;
    if (reviewStatus) query.reviewStatus = reviewStatus;

    // Role-based filtering
    if (req.user.role === 'student') {
      // Students see their own recordings and their participants' recordings
      query.$or = [
        { contributor: req.user._id },
        { managedBy: req.user._id }
      ];
    } else if (req.user.role === 'participant') {
      // Participants only see their own recordings
      query.contributor = req.user._id;
    } else if (req.user.role === 'reviewer') {
      // Reviewers see recordings from their assigned projects
      const user = await User.findById(req.user._id);
      query.project = { $in: user.assignedProjects };
    }
    // Admins see all

    if (contributor && req.user.role === 'admin') {
      query.contributor = contributor;
    }

    const recordings = await Recording.find(query)
      .populate('task', 'title script language')
      .populate('project', 'title language')
      .populate('contributor', 'name email role')
      .populate('reviewedBy', 'name email')
      .populate('managedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Recording.countDocuments(query);

    res.json({
      recordings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get recordings error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single recording
// @route   GET /api/recordings/:id
// @access  All authenticated users
const getRecording = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id)
      .populate('task', 'title script language project')
      .populate('project', 'title language')
      .populate('contributor', 'name email role language dialects')
      .populate('reviewedBy', 'name email')
      .populate('managedBy', 'name email')
      .populate('flags.flaggedBy', 'name email');

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Check access permissions
    const canAccess =
      req.user.role === 'admin' ||
      recording.contributor._id.toString() === req.user._id.toString() ||
      (recording.managedBy && recording.managedBy._id.toString() === req.user._id.toString()) ||
      (req.user.role === 'reviewer' && req.user.assignedProjects.includes(recording.project._id));

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ recording });
  } catch (error) {
    console.error('Get recording error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Review recording
// @route   PUT /api/recordings/:id/review
// @access  Reviewer, Admin
const reviewRecording = async (req, res) => {
  try {
    const { reviewStatus, reviewNotes, qualityScore, flags } = req.body;

    const recording = await Recording.findById(req.params.id);
    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Check if reviewer is assigned to this project
    if (req.user.role === 'reviewer') {
      const user = await User.findById(req.user._id);
      if (!user.assignedProjects.includes(recording.project)) {
        return res.status(403).json({
          message: 'You are not assigned to this project'
        });
      }
    }

    recording.reviewStatus = reviewStatus;
    recording.reviewNotes = reviewNotes;
    recording.reviewedBy = req.user._id;
    recording.reviewedAt = new Date();

    if (qualityScore) {
      recording.qualityScore = qualityScore;
    }

    if (flags && flags.length > 0) {
      recording.flags.push(...flags.map(flag => ({
        ...flag,
        flaggedBy: req.user._id
      })));
    }

    await recording.save();

    // Update project metadata
    const updateField = {};
    if (reviewStatus === 'approved') {
      updateField['metadata.approvedRecordings'] = 1;
      // Update user stats
      await User.findByIdAndUpdate(recording.contributor, {
        $inc: { 'stats.approvedRecordings': 1 }
      });
    } else if (reviewStatus === 'rejected') {
      updateField['metadata.rejectedRecordings'] = 1;
      // Update user stats
      await User.findByIdAndUpdate(recording.contributor, {
        $inc: { 'stats.rejectedRecordings': 1 }
      });
    }

    if (Object.keys(updateField).length > 0) {
      await Project.findByIdAndUpdate(recording.project, {
        $inc: updateField
      });
    }

    // Update reviewer stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalReviews': 1 }
    });

    const updatedRecording = await Recording.findById(recording._id)
      .populate('task', 'title script')
      .populate('project', 'title')
      .populate('contributor', 'name email')
      .populate('reviewedBy', 'name email');

    res.json({
      message: 'Recording reviewed successfully',
      recording: updatedRecording
    });
  } catch (error) {
    console.error('Review recording error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete recording
// @route   DELETE /api/recordings/:id
// @access  Admin, Contributor (own recording only)
const deleteRecording = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Check permissions
    if (req.user.role !== 'admin' && recording.contributor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Soft delete
    recording.isDeleted = true;
    await recording.save();

    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Delete recording error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my recordings
// @route   GET /api/recordings/my-recordings
// @access  Student, Participant
const getMyRecordings = async (req, res) => {
  try {
    const { reviewStatus, page = 1, limit = 20 } = req.query;

    const query = {
      contributor: req.user._id,
      isDeleted: false
    };

    if (reviewStatus) {
      query.reviewStatus = reviewStatus;
    }

    const recordings = await Recording.find(query)
      .populate('task', 'title script')
      .populate('project', 'title language')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Recording.countDocuments(query);

    // Get stats
    const stats = await Recording.aggregate([
      { $match: { contributor: req.user._id, isDeleted: false } },
      {
        $group: {
          _id: '$reviewStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObj = {
      total: 0,
      pending: 0,
      approved: 0,
      rejected: 0,
      needs_revision: 0
    };

    stats.forEach(stat => {
      statsObj[stat._id] = stat.count;
      statsObj.total += stat.count;
    });

    res.json({
      recordings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
      stats: statsObj
    });
  } catch (error) {
    console.error('Get my recordings error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  submitRecording,
  getRecordings,
  getRecording,
  reviewRecording,
  deleteRecording,
  getMyRecordings
};
