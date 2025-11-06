const express = require('express');
const {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats
} = require('../controllers/projectController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Create project (admin only)
router.post('/', authorize('admin'), createProject);

// Get all projects (all authenticated users)
router.get('/', getAllProjects);

// Get single project
router.get('/:id', getProject);

// Update project (admin only)
router.put('/:id', authorize('admin'), updateProject);

// Delete project (admin only)
router.delete('/:id', authorize('admin'), deleteProject);

// Get project statistics (admin, reviewer)
router.get('/:id/stats', authorize('admin', 'reviewer'), getProjectStats);

module.exports = router;
