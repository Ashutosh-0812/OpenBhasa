const express = require('express');
const {
  createTaskRequest,
  getAllTaskRequests,
  getTaskRequest,
  reviewTaskRequest,
  updateTaskRequest,
  cancelTaskRequest,
  getMyTaskRequests
} = require('../controllers/taskRequestController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get my task requests (student, participant)
router.get('/my-requests', authorize('student', 'participant'), getMyTaskRequests);

// Create task request (student, participant)
router.post('/', authorize('student', 'participant'), createTaskRequest);

// Get all task requests (role-based filtering)
router.get('/', getAllTaskRequests);

// Get single task request
router.get('/:id', getTaskRequest);

// Review task request (admin, reviewer)
router.put('/:id/review', authorize('admin', 'reviewer'), reviewTaskRequest);

// Update task request (owner only, before review)
router.put('/:id', updateTaskRequest);

// Cancel task request (owner, admin)
router.delete('/:id', cancelTaskRequest);

module.exports = router;
