const Task = require('../models/Task');
const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Admin only
const createTask = async (req, res) => {
  try {
    const {
      project,
      title,
      description,
      script,
      language,
      dialect,
      difficulty,
      estimatedDuration,
      targetRecordings,
      tags,
      priority
    } = req.body;

    // Verify project exists
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      project,
      title,
      description,
      script,
      language,
      dialect,
      type: 'standard',
      difficulty,
      estimatedDuration,
      targetRecordings,
      tags,
      priority,
      status: 'active'
    });

    // Update project task count
    await Project.findByIdAndUpdate(project, {
      $inc: { 'metadata.totalTasks': 1 }
    });

    const populatedTask = await Task.findById(task._id).populate('project', 'title language');

    res.status(201).json({
      message: 'Task created successfully',
      task: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  All authenticated users
const getAllTasks = async (req, res) => {
  try {
    const {
      project,
      status,
      type,
      language,
      approvalStatus,
      page = 1,
      limit = 20
    } = req.query;

    const query = {};

    if (project) query.project = project;
    if (status) query.status = status;
    if (type) query.type = type;
    if (language) query.language = language;
    if (approvalStatus) query.approvalStatus = approvalStatus;

    // Students and participants see only active approved tasks
    if (['student', 'participant'].includes(req.user.role)) {
      query.status = 'active';
      query.approvalStatus = 'approved';
    }

    const tasks = await Task.find(query)
      .populate('project', 'title language status')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Task.countDocuments(query);

    res.json({
      tasks,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  All authenticated users
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'title language status guidelines')
      .populate('requestedBy', 'name email role')
      .populate('approvedBy', 'name email role');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if user has already completed this task
    const Recording = require('../models/Recording');
    let userRecording = null;
    
    if (['student', 'participant'].includes(req.user.role)) {
      userRecording = await Recording.findOne({
        task: task._id,
        contributor: req.user._id
      });
    }

    res.json({
      task,
      userRecording: userRecording ? {
        id: userRecording._id,
        reviewStatus: userRecording.reviewStatus,
        submittedAt: userRecording.createdAt
      } : null
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Admin only
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const {
      title,
      description,
      script,
      language,
      dialect,
      difficulty,
      estimatedDuration,
      status,
      targetRecordings,
      tags,
      priority
    } = req.body;

    if (title) task.title = title;
    if (description) task.description = description;
    if (script) task.script = script;
    if (language) task.language = language;
    if (dialect) task.dialect = dialect;
    if (difficulty) task.difficulty = difficulty;
    if (estimatedDuration) task.estimatedDuration = estimatedDuration;
    if (status) task.status = status;
    if (targetRecordings) task.targetRecordings = targetRecordings;
    if (tags) task.tags = tags;
    if (priority) task.priority = priority;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('project', 'title language');

    res.json({
      message: 'Task updated successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Admin only
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Check if task has recordings
    const Recording = require('../models/Recording');
    const recordingsCount = await Recording.countDocuments({ task: task._id });
    
    if (recordingsCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete task with existing recordings. Change status to completed instead.'
      });
    }

    await task.deleteOne();

    // Update project task count
    await Project.findByIdAndUpdate(task.project, {
      $inc: { 'metadata.totalTasks': -1 }
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Assign task to users
// @route   POST /api/tasks/:id/assign
// @access  Admin, Student (for their participants)
const assignTask = async (req, res) => {
  try {
    const { userIds } = req.body; // Array of user IDs

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify users exist and are students or participants
    const users = await User.find({
      _id: { $in: userIds },
      role: { $in: ['student', 'participant'] }
    });

    if (users.length !== userIds.length) {
      return res.status(400).json({
        message: 'One or more users not found or invalid role'
      });
    }

    // If requester is student, verify they manage these participants
    if (req.user.role === 'student') {
      const managedUsers = users.every(user =>
        user.managedBy && user.managedBy.toString() === req.user._id.toString()
      );
      
      if (!managedUsers) {
        return res.status(403).json({
          message: 'You can only assign tasks to your own participants'
        });
      }
    }

    // Add assignments (avoid duplicates)
    const existingAssignments = task.assignedTo.map(a => a.user.toString());
    const newAssignments = userIds
      .filter(id => !existingAssignments.includes(id))
      .map(id => ({ user: id }));

    task.assignedTo.push(...newAssignments);
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo.user', 'name email role');

    res.json({
      message: 'Task assigned successfully',
      task: updatedTask
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my assigned tasks
// @route   GET /api/tasks/my-tasks
// @access  Student, Participant
const getMyTasks = async (req, res) => {
  try {
    const { status, completed } = req.query;

    const query = {
      'assignedTo.user': req.user._id,
      approvalStatus: 'approved'
    };

    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    const tasks = await Task.find(query)
      .populate('project', 'title language guidelines')
      .sort({ priority: -1, createdAt: -1 });

    // Check completion status
    const Recording = require('../models/Recording');
    const tasksWithCompletion = await Promise.all(
      tasks.map(async (task) => {
        const recording = await Recording.findOne({
          task: task._id,
          contributor: req.user._id
        });

        return {
          ...task.toObject(),
          isCompleted: !!recording,
          recordingStatus: recording ? recording.reviewStatus : null
        };
      })
    );

    // Filter by completion if requested
    let filteredTasks = tasksWithCompletion;
    if (completed === 'true') {
      filteredTasks = tasksWithCompletion.filter(t => t.isCompleted);
    } else if (completed === 'false') {
      filteredTasks = tasksWithCompletion.filter(t => !t.isCompleted);
    }

    res.json({
      tasks: filteredTasks,
      total: filteredTasks.length
    });
  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
  getMyTasks
};
