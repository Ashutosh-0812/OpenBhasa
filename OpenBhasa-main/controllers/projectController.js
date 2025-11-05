const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create new project
// @route   POST /api/projects
// @access  Admin only
const createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      language,
      dialects,
      targetRecordings,
      guidelines,
      tags,
      assignedReviewers
    } = req.body;

    // Verify reviewers exist and have reviewer role
    if (assignedReviewers && assignedReviewers.length > 0) {
      const reviewers = await User.find({
        _id: { $in: assignedReviewers },
        role: 'reviewer'
      });
      
      if (reviewers.length !== assignedReviewers.length) {
        return res.status(400).json({
          message: 'One or more assigned users are not reviewers'
        });
      }
    }

    const project = await Project.create({
      title,
      description,
      language,
      dialects,
      targetRecordings,
      guidelines,
      tags,
      assignedReviewers,
      createdBy: req.user._id
    });

    // Update reviewers' assignedProjects
    if (assignedReviewers && assignedReviewers.length > 0) {
      await User.updateMany(
        { _id: { $in: assignedReviewers } },
        { $addToSet: { assignedProjects: project._id } }
      );
    }

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('assignedReviewers', 'name email');

    res.status(201).json({
      message: 'Project created successfully',
      project: populatedProject
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all projects
// @route   GET /api/projects
// @access  Admin, Reviewer, Student
const getAllProjects = async (req, res) => {
  try {
    const { status, language, page = 1, limit = 10 } = req.query;

    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by language
    if (language) {
      query.language = language;
    }

    // Reviewers only see their assigned projects
    if (req.user.role === 'reviewer') {
      query.assignedReviewers = req.user._id;
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedReviewers', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Project.countDocuments(query);

    res.json({
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Admin, Reviewer, Student
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedReviewers', 'name email');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Get project tasks count
    const tasksCount = await Task.countDocuments({ project: project._id });

    res.json({
      project: {
        ...project.toObject(),
        tasksCount
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Admin only
const updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const {
      title,
      description,
      language,
      dialects,
      targetRecordings,
      status,
      guidelines,
      tags,
      assignedReviewers
    } = req.body;

    // Verify reviewers if updating
    if (assignedReviewers && assignedReviewers.length > 0) {
      const reviewers = await User.find({
        _id: { $in: assignedReviewers },
        role: 'reviewer'
      });
      
      if (reviewers.length !== assignedReviewers.length) {
        return res.status(400).json({
          message: 'One or more assigned users are not reviewers'
        });
      }

      // Remove project from old reviewers
      const oldReviewers = project.assignedReviewers.filter(
        r => !assignedReviewers.includes(r.toString())
      );
      if (oldReviewers.length > 0) {
        await User.updateMany(
          { _id: { $in: oldReviewers } },
          { $pull: { assignedProjects: project._id } }
        );
      }

      // Add project to new reviewers
      const newReviewers = assignedReviewers.filter(
        r => !project.assignedReviewers.map(ar => ar.toString()).includes(r)
      );
      if (newReviewers.length > 0) {
        await User.updateMany(
          { _id: { $in: newReviewers } },
          { $addToSet: { assignedProjects: project._id } }
        );
      }
    }

    // Update fields
    if (title) project.title = title;
    if (description) project.description = description;
    if (language) project.language = language;
    if (dialects) project.dialects = dialects;
    if (targetRecordings) project.targetRecordings = targetRecordings;
    if (status) project.status = status;
    if (guidelines) project.guidelines = guidelines;
    if (tags) project.tags = tags;
    if (assignedReviewers) project.assignedReviewers = assignedReviewers;

    await project.save();

    const updatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('assignedReviewers', 'name email');

    res.json({
      message: 'Project updated successfully',
      project: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Admin only
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if project has tasks
    const tasksCount = await Task.countDocuments({ project: project._id });
    if (tasksCount > 0) {
      return res.status(400).json({
        message: 'Cannot delete project with existing tasks. Archive it instead.'
      });
    }

    // Remove from reviewers' assigned projects
    await User.updateMany(
      { _id: { $in: project.assignedReviewers } },
      { $pull: { assignedProjects: project._id } }
    );

    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get project statistics
// @route   GET /api/projects/:id/stats
// @access  Admin, Reviewer
const getProjectStats = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const Recording = require('../models/Recording');

    const stats = await Recording.aggregate([
      { $match: { project: project._id } },
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
      project: {
        id: project._id,
        title: project.title,
        status: project.status
      },
      recordings: statsObj,
      progress: {
        target: project.targetRecordings,
        completed: statsObj.total,
        percentage: (statsObj.total / project.targetRecordings * 100).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Get project stats error:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats
};
