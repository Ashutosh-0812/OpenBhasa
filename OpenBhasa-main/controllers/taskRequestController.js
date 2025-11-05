const TaskRequest = require('../models/TaskRequest');
const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create task request
// @route   POST /api/task-requests
// @access  Student, Participant
const createTaskRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      script,
      language,
      dialect,
      project,
      justification,
      expectedRecordings,
      priority,
      estimatedDuration,
      tags
    } = req.body;

    // Verify project if provided
    if (project) {
      const projectDoc = await Project.findById(project);
      if (!projectDoc) {
        return res.status(404).json({ message: 'Project not found' });
      }
    }

    const taskRequest = await TaskRequest.create({
      title,
      description,
      script,
      language,
      dialect,
      project,
      requestedBy: req.user._id,
      requestType: req.user.role, // 'student' or 'participant'
      justification,
      expectedRecordings,
      priority,
      estimatedDuration,
      tags,
      status: 'pending'
    });

    const populatedRequest = await TaskRequest.findById(taskRequest._id)
      .populate('requestedBy', 'name email role')
      .populate('project', 'title language');

    res.status(201).json({
      message: 'Task request submitted successfully',
      taskRequest: populatedRequest
    });
  } catch (error) {
    console.error('Create task request error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all task requests
// @route   GET /api/task-requests
// @access  Admin, Reviewer (assigned projects), Student/Participant (own requests)
const getAllTaskRequests = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    // Role-based filtering
    if (req.user.role === 'reviewer') {
      // Reviewers see requests for their assigned projects
      const user = await User.findById(req.user._id);
      query.project = { $in: user.assignedProjects };
    } else if (['student', 'participant'].includes(req.user.role)) {
      // Students and participants see only their own requests
      query.requestedBy = req.user._id;
    }
    // Admins see all

    const taskRequests = await TaskRequest.find(query)
      .populate('requestedBy', 'name email role')
      .populate('project', 'title language')
      .populate('reviewedBy', 'name email')
      .populate('createdTask', 'title status')
      .sort({ isUrgent: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await TaskRequest.countDocuments(query);

    res.json({
      taskRequests,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get task requests error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single task request
// @route   GET /api/task-requests/:id
// @access  Admin, Reviewer, Request owner
const getTaskRequest = async (req, res) => {
  try {
    const taskRequest = await TaskRequest.findById(req.params.id)
      .populate('requestedBy', 'name email role college')
      .populate('project', 'title language status')
      .populate('reviewedBy', 'name email role')
      .populate('createdTask', 'title status script');

    if (!taskRequest) {
      return res.status(404).json({ message: 'Task request not found' });
    }

    // Check access permissions
    const canAccess =
      req.user.role === 'admin' ||
      taskRequest.requestedBy._id.toString() === req.user._id.toString() ||
      (req.user.role === 'reviewer' && req.user.assignedProjects.includes(taskRequest.project));

    if (!canAccess) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({ taskRequest });
  } catch (error) {
    console.error('Get task request error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Review task request (approve/reject)
// @route   PUT /api/task-requests/:id/review
// @access  Admin, Reviewer (for assigned projects)
const reviewTaskRequest = async (req, res) => {
  try {
    const { status, reviewNotes } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Status must be either approved or rejected'
      });
    }

    const taskRequest = await TaskRequest.findById(req.params.id);

    if (!taskRequest) {
      return res.status(404).json({ message: 'Task request not found' });
    }

    if (taskRequest.status !== 'pending' && taskRequest.status !== 'under_review') {
      return res.status(400).json({
        message: 'This request has already been reviewed'
      });
    }

    // Check reviewer permissions
    if (req.user.role === 'reviewer') {
      const user = await User.findById(req.user._id);
      if (taskRequest.project && !user.assignedProjects.includes(taskRequest.project)) {
        return res.status(403).json({
          message: 'You are not assigned to this project'
        });
      }
    }

    taskRequest.status = status;
    taskRequest.reviewNotes = reviewNotes;
    taskRequest.reviewedBy = req.user._id;
    taskRequest.reviewedAt = new Date();

    // If approved, create the task
    if (status === 'approved') {
      const newTask = await Task.create({
        project: taskRequest.project,
        title: taskRequest.title,
        description: taskRequest.description,
        script: taskRequest.script,
        language: taskRequest.language,
        dialect: taskRequest.dialect,
        type: 'custom',
        estimatedDuration: taskRequest.estimatedDuration,
        targetRecordings: taskRequest.expectedRecordings,
        tags: taskRequest.tags,
        requestedBy: taskRequest.requestedBy,
        approvedBy: req.user._id,
        approvalStatus: 'approved',
        status: 'active'
      });

      taskRequest.createdTask = newTask._id;

      // Update project task count if project exists
      if (taskRequest.project) {
        await Project.findByIdAndUpdate(taskRequest.project, {
          $inc: { 'metadata.totalTasks': 1 }
        });
      }
    }

    await taskRequest.save();

    const updatedRequest = await TaskRequest.findById(taskRequest._id)
      .populate('requestedBy', 'name email role')
      .populate('project', 'title language')
      .populate('reviewedBy', 'name email')
      .populate('createdTask', 'title status');

    res.json({
      message: `Task request ${status} successfully`,
      taskRequest: updatedRequest
    });
  } catch (error) {
    console.error('Review task request error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update task request (before review)
// @route   PUT /api/task-requests/:id
// @access  Request owner
const updateTaskRequest = async (req, res) => {
  try {
    const taskRequest = await TaskRequest.findById(req.params.id);

    if (!taskRequest) {
      return res.status(404).json({ message: 'Task request not found' });
    }

    // Only owner can update
    if (taskRequest.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only update if pending or under review
    if (!['pending', 'under_review'].includes(taskRequest.status)) {
      return res.status(400).json({
        message: 'Cannot update a reviewed request'
      });
    }

    const {
      title,
      description,
      script,
      language,
      dialect,
      justification,
      expectedRecordings,
      priority,
      estimatedDuration,
      tags
    } = req.body;

    if (title) taskRequest.title = title;
    if (description) taskRequest.description = description;
    if (script) taskRequest.script = script;
    if (language) taskRequest.language = language;
    if (dialect) taskRequest.dialect = dialect;
    if (justification) taskRequest.justification = justification;
    if (expectedRecordings) taskRequest.expectedRecordings = expectedRecordings;
    if (priority) taskRequest.priority = priority;
    if (estimatedDuration) taskRequest.estimatedDuration = estimatedDuration;
    if (tags) taskRequest.tags = tags;

    await taskRequest.save();

    const updatedRequest = await TaskRequest.findById(taskRequest._id)
      .populate('requestedBy', 'name email role')
      .populate('project', 'title language');

    res.json({
      message: 'Task request updated successfully',
      taskRequest: updatedRequest
    });
  } catch (error) {
    console.error('Update task request error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel task request
// @route   DELETE /api/task-requests/:id
// @access  Request owner, Admin
const cancelTaskRequest = async (req, res) => {
  try {
    const taskRequest = await TaskRequest.findById(req.params.id);

    if (!taskRequest) {
      return res.status(404).json({ message: 'Task request not found' });
    }

    // Only owner or admin can cancel
    if (req.user.role !== 'admin' && taskRequest.requestedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Can only cancel if not reviewed
    if (!['pending', 'under_review'].includes(taskRequest.status)) {
      return res.status(400).json({
        message: 'Cannot cancel a reviewed request'
      });
    }

    taskRequest.status = 'cancelled';
    await taskRequest.save();

    res.json({ message: 'Task request cancelled successfully' });
  } catch (error) {
    console.error('Cancel task request error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my task requests
// @route   GET /api/task-requests/my-requests
// @access  Student, Participant
const getMyTaskRequests = async (req, res) => {
  try {
    const { status } = req.query;

    const query = { requestedBy: req.user._id };

    if (status) {
      query.status = status;
    }

    const taskRequests = await TaskRequest.find(query)
      .populate('project', 'title language')
      .populate('reviewedBy', 'name email')
      .populate('createdTask', 'title status')
      .sort({ createdAt: -1 });

    // Get stats
    const stats = await TaskRequest.aggregate([
      { $match: { requestedBy: req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsObj = {
      total: 0,
      pending: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      statsObj[stat._id] = stat.count;
      statsObj.total += stat.count;
    });

    res.json({
      taskRequests,
      total: taskRequests.length,
      stats: statsObj
    });
  } catch (error) {
    console.error('Get my task requests error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createTaskRequest,
  getAllTaskRequests,
  getTaskRequest,
  reviewTaskRequest,
  updateTaskRequest,
  cancelTaskRequest,
  getMyTaskRequests
};
