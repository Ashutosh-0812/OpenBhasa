const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Create new project
// @route   POST /api/projects
// @access  Admin and Student
const createProject = async (req, res) => {
  try {
    console.log('🚀 CREATE PROJECT REQUEST RECEIVED');
    console.log('📋 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User Info:', { 
      id: req.user._id, 
      role: req.user.role, 
      email: req.user.email 
    });

    const {
      title,
      description,
      language,
      dialects,
      targetRecordings,
      guidelines,
      tags,
      assignedReviewers,
      assignedUsers
    } = req.body;

    console.log('📝 Extracted Data:', {
      title,
      description,
      language,
      dialects,
      targetRecordings,
      hasGuidelines: !!guidelines,
      tagsCount: tags?.length || 0,
      reviewersCount: assignedReviewers?.length || 0,
      usersCount: assignedUsers?.length || 0
    });

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

    // Validate assigned users if provided
    if (assignedUsers && assignedUsers.length > 0) {
      const users = await User.find({
        _id: { $in: assignedUsers },
        role: { $in: ['student', 'participant'] }
      });
      if (users.length !== assignedUsers.length) {
        return res.status(400).json({
          message: 'One or more assigned users not found or invalid role'
        });
      }
      console.log('✅ Assigned users validated:', users.map(u => ({ id: u._id, name: u.name, role: u.role })));
    }

    console.log('💾 Creating project in database...');
    const project = await Project.create({
      title,
      description,
      language,
      dialects,
      targetRecordings,
      guidelines,
      tags,
      assignedReviewers,
      assignedUsers,
      createdBy: req.user._id
    });
    console.log('✅ Project created successfully:', { 
      id: project._id, 
      title: project.title 
    });

    // Update reviewers' assignedProjects
    if (assignedReviewers && assignedReviewers.length > 0) {
      await User.updateMany(
        { _id: { $in: assignedReviewers } },
        { $addToSet: { assignedProjects: project._id } }
      );
    }

    console.log('🔄 Populating project data...');
    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('assignedReviewers', 'name email');

    console.log('📤 Sending response with populated project');
    res.status(201).json({
      message: 'Project created successfully',
      project: populatedProject
    });
    console.log('✅ CREATE PROJECT COMPLETED SUCCESSFULLY');
  } catch (error) {
    console.error('❌ CREATE PROJECT ERROR:', error);
    console.error('Error Stack:', error.stack);
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
    console.log('🚀 GET ALL PROJECTS REQUEST RECEIVED');
    console.log('👤 User Info:', { 
      id: req.user._id, 
      role: req.user.role, 
      email: req.user.email 
    });
    
    const { status, language, page = 1, limit = 10 } = req.query;
    console.log('📋 Query Parameters:', { status, language, page, limit });

    const query = {};
    
    // Filter by status
    if (status) {
      query.status = status;
    }
    
    // Filter by language
    if (language) {
      query.language = language;
    }

    // Role-based filtering
    if (req.user.role === 'reviewer') {
      // Reviewers only see their assigned projects
      query.assignedReviewers = req.user._id;
    } else if (req.user.role === 'participant') {
      // Participants only see projects they're assigned to
      query.assignedUsers = req.user._id;
    }
    // Students and admins see all projects (no additional filter)

    console.log('🔍 Querying projects with filter:', query);
    const projects = await Project.find(query)
      .populate('createdBy', 'name email')
      .populate('assignedReviewers', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Project.countDocuments(query);
    
    console.log('📊 Projects query results:', {
      projectsCount: projects.length,
      totalCount: count,
      projectIds: projects.map(p => p._id)
    });

    const response = {
      projects,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    };
    
    console.log('📤 Sending projects response');
    res.json(response);
    console.log('✅ GET ALL PROJECTS COMPLETED SUCCESSFULLY');
  } catch (error) {
    console.error('❌ GET PROJECTS ERROR:', error);
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
    console.log('🔍 GET PROJECT REQUEST RECEIVED');
    console.log('👤 User Info:', { 
      id: req.user._id, 
      role: req.user.role, 
      email: req.user.email 
    });
    console.log('📋 Project ID:', req.params.id);

    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedReviewers', 'name email');

    if (!project) {
      console.log('❌ Project not found for ID:', req.params.id);
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('✅ Project found:', {
      id: project._id,
      title: project.title,
      createdBy: project.createdBy
    });

    // Get project tasks count
    console.log('📊 Getting tasks count for project...');
    const tasksCount = await Task.countDocuments({ project: project._id });
    console.log('📊 Tasks count:', tasksCount);

    const response = {
      project: {
        ...project.toObject(),
        tasksCount
      }
    };

    console.log('📤 Sending project response');
    res.json(response);
    console.log('✅ GET PROJECT COMPLETED SUCCESSFULLY');
  } catch (error) {
    console.error('❌ GET PROJECT ERROR:', error);
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
// @access  Admin and Student (own projects)
const deleteProject = async (req, res) => {
  try {
    console.log('🗑️ DELETE PROJECT REQUEST RECEIVED');
    console.log('👤 User Info:', { 
      id: req.user._id, 
      role: req.user.role, 
      email: req.user.email 
    });
    console.log('📋 Project ID to delete:', req.params.id);

    const project = await Project.findById(req.params.id);

    if (!project) {
      console.log('❌ Project not found');
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('📊 Project found:', {
      id: project._id,
      title: project.title,
      createdBy: project.createdBy
    });

    // Students can only delete their own projects
    if (req.user.role === 'student' && project.createdBy.toString() !== req.user._id.toString()) {
      console.log('❌ Student trying to delete project not created by them');
      return res.status(403).json({ 
        message: 'You can only delete projects you created' 
      });
    }

    // Check if project has tasks
    console.log('🔍 Checking for existing tasks...');
    const tasksCount = await Task.countDocuments({ project: project._id });
    console.log('📊 Tasks found:', tasksCount);
    
    if (tasksCount > 0) {
      console.log('❌ Cannot delete project with existing tasks');
      return res.status(400).json({
        message: 'Cannot delete project with existing tasks. Archive it instead.'
      });
    }

    // Remove from reviewers' assigned projects
    console.log('🔄 Removing project from reviewers...');
    if (project.assignedReviewers && project.assignedReviewers.length > 0) {
      await User.updateMany(
        { _id: { $in: project.assignedReviewers } },
        { $pull: { assignedProjects: project._id } }
      );
      console.log('✅ Removed from reviewers');
    }

    console.log('🗑️ Deleting project from database...');
    await project.deleteOne();
    console.log('✅ Project deleted successfully');

    res.json({ message: 'Project deleted successfully' });
    console.log('✅ DELETE PROJECT COMPLETED SUCCESSFULLY');
  } catch (error) {
    console.error('❌ DELETE PROJECT ERROR:', error);
    console.error('Error Stack:', error.stack);
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

// @desc    Assign users to project
// @route   PUT /api/projects/:id/assign-users
// @access  Admin and Student
const assignUsersToProject = async (req, res) => {
  try {
    console.log('👥 ASSIGN USERS TO PROJECT REQUEST');
    console.log('📋 Request Body:', JSON.stringify(req.body, null, 2));
    console.log('👤 User Info:', { 
      id: req.user._id, 
      role: req.user.role, 
      email: req.user.email 
    });

    const { assignedUsers } = req.body;
    const projectId = req.params.id;

    if (!assignedUsers || !Array.isArray(assignedUsers)) {
      return res.status(400).json({
        message: 'assignedUsers must be an array of user IDs'
      });
    }

    console.log('📋 Assigning users:', assignedUsers, 'to project:', projectId);

    // Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    console.log('✅ Project found:', project.title);

    // Verify users exist and get their details
    const users = await User.find({
      _id: { $in: assignedUsers },
      role: { $in: ['student', 'participant'] }
    });

    if (users.length !== assignedUsers.length) {
      return res.status(400).json({
        message: 'One or more users not found or invalid role'
      });
    }

    console.log('✅ Users verified:', users.map(u => ({ id: u._id, name: u.name, role: u.role })));

    // Update project with assigned users
    project.assignedUsers = [...new Set([...(project.assignedUsers || []), ...assignedUsers])];
    await project.save();

    console.log('✅ Project updated with assigned users');

    // Get project tasks for assignment
    const Task = require('../models/Task');
    const projectTasks = await Task.find({ 
      project: projectId, 
      status: 'active',
      approvalStatus: 'approved'
    });

    console.log('📋 Found project tasks:', projectTasks.length);

    // Assign users to each task in the project
    if (projectTasks.length > 0) {
      for (const task of projectTasks) {
        const existingAssignments = task.assignedTo.map(a => a.user.toString());
        const newAssignments = assignedUsers
          .filter(userId => !existingAssignments.includes(userId))
          .map(userId => ({ user: userId, assignedAt: new Date() }));
        
        if (newAssignments.length > 0) {
          task.assignedTo.push(...newAssignments);
          await task.save();
          console.log('✅ Task assigned:', task.title, 'to', newAssignments.length, 'new users');
        }
      }
    }

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('assignedReviewers', 'name email');

    console.log('✅ User assignment completed successfully');

    res.json({
      message: 'Users assigned successfully',
      project: populatedProject,
      assignedTasksCount: projectTasks.length
    });
  } catch (error) {
    console.error('❌ Assign users error:', error);
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
  getProjectStats,
  assignUsersToProject
};
