const express = require('express');
const {
  createTask,
  getAllTasks,
  getTask,
  updateTask,
  deleteTask,
  assignTask,
  getMyTasks
} = require('../controllers/taskController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get my assigned tasks (student, participant)
router.get('/my-tasks', authorize('student', 'participant'), getMyTasks);

// Create task (admin and students)
router.post('/', authorize('admin', 'student'), createTask);

// Get all tasks
router.get('/', getAllTasks);

// Get single task
router.get('/:id', getTask);

// Update task (admin and students for their projects)
router.put('/:id', authorize('admin', 'student'), updateTask);

// Delete task (admin and students for their projects)
router.delete('/:id', authorize('admin', 'student'), deleteTask);

// Assign task (admin, student for their participants)
router.post('/:id/assign', authorize('admin', 'student'), assignTask);

module.exports = router;
