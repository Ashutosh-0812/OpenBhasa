const express = require('express')
const {
  getTasks,
  getTaskById,
  updateTaskProgress
} = require('../controllers/taskController')
const authenticate = require('../middleware/auth')

const router = express.Router()

// All task routes require authentication
router.use(authenticate)

// Get all tasks for the authenticated user
router.get('/', getTasks)

// Get specific task by ID
router.get('/:taskId', getTaskById)

// Update task progress (for when recordings are completed)
router.put('/:taskId/progress', updateTaskProgress)

module.exports = router
