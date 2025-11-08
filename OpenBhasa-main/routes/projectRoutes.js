const express = require('express');
const {
  createProject,
  getAllProjects,
  getProject,
  updateProject,
  deleteProject,
  getProjectStats,
  assignUsersToProject
} = require('../controllers/projectController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`🛣️ PROJECT ROUTE: ${req.method} ${req.path}`, {
    body: req.body,
    user: req.user ? { id: req.user._id, role: req.user.role } : 'No user'
  });
  next();
});

// All routes require authentication
router.use(authenticate);

// Create project (admin and students)
router.post('/', authorize('admin', 'student'), createProject);

// Get all projects (all authenticated users)
router.get('/', getAllProjects);

// Get single project
router.get('/:id', getProject);

// Update project (admin only)
router.put('/:id', authorize('admin'), updateProject);

// Delete project (admin and students)
router.delete('/:id', authorize('admin', 'student'), deleteProject);

// Get project statistics (admin, reviewer)
router.get('/:id/stats', authorize('admin', 'reviewer'), getProjectStats);

// Assign users to project (admin and students)
router.put('/:id/assign-users', authorize('admin', 'student'), assignUsersToProject);

module.exports = router;
