const Recording = require('../models/Recording');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const { vadMiddleware } = require('../middleware/vadMiddleware');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload buffer to Cloudinary
 * @param {Buffer} buffer - Audio file buffer (trimmed by VAD)
 * @param {string} filename - Original filename
 * @returns {Promise<Object>} - Cloudinary upload result
 */
const uploadToCloudinary = (buffer, filename) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'video', // 'video' resource type for audio files
        folder: 'openbhasa/recordings',
        public_id: `recording_${Date.now()}_${filename.replace(/\.[^/.]+$/, '')}`,
        format: 'm4a', // Force M4A format
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    
    // Convert buffer to stream and pipe to Cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max (supports 15-min recordings at 256kbps)
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'audio/webm',
      'audio/wav', 
      'audio/mp3', 
      'audio/mpeg',
      'audio/ogg',
      'audio/m4a',           // M4A support
      'audio/mp4',           // M4A alternative MIME
      'audio/x-m4a'          // M4A alternative MIME
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files allowed (webm, wav, mp3, m4a, ogg).'));
    }
  }
});

// @desc    Upload audio file with VAD analysis and submit recording
// @route   POST /api/recordings/upload
// @access  Student, Participant
const uploadAndSubmitRecording = [
  upload.single('audio'),
  vadMiddleware, // VAD middleware processes the audio
  async (req, res) => {
    try {
      const { taskId, promptId, metadata } = req.body;
      const audioFile = req.file;

      if (!audioFile) {
        return res.status(400).json({ message: 'No audio file provided' });
      }

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

      let audioUrl;

      // Upload to S3 if configured, otherwise save locally (for development)
      if (s3Client && process.env.AWS_S3_BUCKET) {
        // Upload to AWS S3
        const fileName = `recordings/${req.user.id}/${taskId}/${Date.now()}_${audioFile.originalname}`;
        
        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET,
          Key: fileName,
          Body: audioFile.buffer,
          ContentType: audioFile.mimetype,
          ACL: 'public-read'
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        audioUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
      } else {
        // For development: save locally and return local path
        const fs = require('fs').promises;
        const path = require('path');
        const uploadsDir = path.join(__dirname, '../uploads/recordings');
        
        // Create directory if it doesn't exist
        await fs.mkdir(uploadsDir, { recursive: true });
        
        const fileName = `${req.user.id}_${taskId}_${Date.now()}_${audioFile.originalname}`;
        const filePath = path.join(uploadsDir, fileName);
        
        await fs.writeFile(filePath, audioFile.buffer);
        audioUrl = `/uploads/recordings/${fileName}`;
      }

      // Parse metadata
      const parsedMetadata = metadata ? JSON.parse(metadata) : {};

      // Get managed by student if user is participant
      let managedBy = null;
      if (req.user.role === 'participant') {
        managedBy = req.user.managedBy;
      }

      // Get VAD analysis from middleware
      const vadAnalysis = req.vadAnalysis || {};

      // Create recording with VAD analysis
      const recording = await Recording.create({
        task: taskId,
        project: task.project,
        contributor: req.user._id,
        managedBy,
        audioUrl,
        duration: vadAnalysis.actualSpeechDuration || parsedMetadata.duration || 0,
        fileSize: audioFile.size,
        format: audioFile.mimetype,
        transcript: parsedMetadata.notes || '',
        recordingEnvironment: parsedMetadata.environment || 'moderate',
        deviceInfo: {
          browser: req.headers['user-agent'],
          ...parsedMetadata.deviceInfo
        },
        vadAnalysis: vadAnalysis.error ? null : {
          totalDuration: vadAnalysis.totalDuration,
          actualSpeechDuration: vadAnalysis.actualSpeechDuration,
          totalSilence: vadAnalysis.totalSilence,
          speechPercentage: vadAnalysis.speechPercentage,
          silencePeriods: vadAnalysis.silencePeriods,
          trimStart: vadAnalysis.trimStart,
          trimEnd: vadAnalysis.trimEnd,
          trimmed: vadAnalysis.trimmed,
          formattedSpeechDuration: vadAnalysis.formattedSpeechDuration,
          summary: vadAnalysis.summary
        },
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
        message: 'Recording uploaded successfully',
        recording: populatedRecording,
        vadAnalysis: vadAnalysis.error ? null : {
          totalDuration: vadAnalysis.formattedDuration,
          actualSpeech: vadAnalysis.formattedSpeechDuration,
          silenceRemoved: vadAnalysis.formattedSilence,
          speechPercentage: `${vadAnalysis.speechPercentage}%`,
          trimmed: vadAnalysis.trimmed,
          summary: vadAnalysis.summary
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ 
        message: 'Failed to upload recording', 
        error: error.message 
      });
    }
  }
];

// @desc    Submit recording (with audioUrl - existing endpoint)
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
      deviceInfo,
      vadAnalysis
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
      vadAnalysis: vadAnalysis || null,
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

    const total = await Recording.countDocuments(query);

    res.json({
      recordings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
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
// @access  Admin, Reviewer, Owner, Manager
const getRecordingById = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id)
      .populate('task', 'title script language targetRecordings')
      .populate('project', 'title language')
      .populate('contributor', 'name email role')
      .populate('reviewedBy', 'name email')
      .populate('managedBy', 'name email');

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Check access permissions
    const isOwner = recording.contributor._id.toString() === req.user._id.toString();
    const isManager = recording.managedBy && 
                     recording.managedBy._id.toString() === req.user._id.toString();
    const isReviewer = req.user.role === 'reviewer';
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isManager && !isReviewer && !isAdmin) {
      return res.status(403).json({ 
        message: 'Not authorized to view this recording' 
      });
    }

    res.json({ recording });
  } catch (error) {
    console.error('Get recording by ID error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my recordings
// @route   GET /api/recordings/my
// @access  Student, Participant
const getMyRecordings = async (req, res) => {
  try {
    const { reviewStatus, page = 1, limit = 20 } = req.query;

    const query = { 
      contributor: req.user._id,
      isDeleted: false 
    };

    if (reviewStatus) query.reviewStatus = reviewStatus;

    const recordings = await Recording.find(query)
      .populate('task', 'title script')
      .populate('project', 'title')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Recording.countDocuments(query);

    res.json({
      recordings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get my recordings error:', error);
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
    const {
      reviewStatus,
      reviewNotes,
      qualityScore,
      flags
    } = req.body;

    const recording = await Recording.findById(req.params.id);

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Update recording review
    recording.reviewStatus = reviewStatus;
    recording.reviewNotes = reviewNotes;
    recording.qualityScore = qualityScore;
    recording.flags = flags || recording.flags;
    recording.reviewedBy = req.user._id;
    recording.reviewedAt = Date.now();

    await recording.save();

    // Update project stats if approved
    if (reviewStatus === 'approved') {
      await Project.findByIdAndUpdate(recording.project, {
        $inc: { 'metadata.approvedRecordings': 1 }
      });

      await User.findByIdAndUpdate(recording.contributor, {
        $inc: { 'stats.approvedRecordings': 1 }
      });
    }

    const populatedRecording = await Recording.findById(recording._id)
      .populate('task', 'title script')
      .populate('project', 'title')
      .populate('contributor', 'name email')
      .populate('reviewedBy', 'name email');

    res.json({
      message: 'Recording reviewed successfully',
      recording: populatedRecording
    });
  } catch (error) {
    console.error('Review recording error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete recording (soft delete)
// @route   DELETE /api/recordings/:id
// @access  Admin, Owner
const deleteRecording = async (req, res) => {
  try {
    const recording = await Recording.findById(req.params.id);

    if (!recording) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    // Check if user is owner or admin
    const isOwner = recording.contributor.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        message: 'Not authorized to delete this recording' 
      });
    }

    recording.isDeleted = true;
    await recording.save();

    // Update task count
    await Task.findByIdAndUpdate(recording.task, {
      $inc: { completedRecordings: -1 }
    });

    res.json({ message: 'Recording deleted successfully' });
  } catch (error) {
    console.error('Delete recording error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  uploadAndSubmitRecording,
  submitRecording,
  getRecordings,
  getRecordingById,
  getMyRecordings,
  reviewRecording,
  deleteRecording
};
