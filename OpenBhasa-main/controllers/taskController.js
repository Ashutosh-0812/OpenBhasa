const mongoose = require('mongoose')

// Mock tasks data - replace with actual database operations later
const mockTasks = [
  {
    id: '1',
    title: 'Bengali Story Narration',
    language: 'Bengali',
    completed: 10,
    totalPrompts: 20,
    status: 'in_progress',
    description: 'Narrate traditional Bengali stories with expression',
    assignedParticipants: 3,
    coinsPerRecording: 25,
    bonusCoins: 50,
    totalEarned: 250,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: '2',
    title: 'Hindi Conversation Practice',
    language: 'Hindi',
    completed: 0,
    totalPrompts: 25,
    status: 'pending',
    description: 'Practice daily conversation scenarios in Hindi',
    assignedParticipants: 5,
    coinsPerRecording: 20,
    bonusCoins: 100,
    totalEarned: 0,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Marathi Poetry Reading',
    language: 'Marathi',
    completed: 15,
    totalPrompts: 15,
    status: 'completed',
    description: 'Read classic Marathi poems with proper pronunciation',
    assignedParticipants: 2,
    coinsPerRecording: 30,
    bonusCoins: 200,
    totalEarned: 650,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-14')
  }
]

// Get all tasks for a user
const getTasks = async (req, res) => {
  try {
    const userId = req.user._id

    // For now, return mock data
    // In the future, filter tasks by user role and assignments
    const userTasks = mockTasks.filter(task => {
      // Add logic to filter tasks based on user role and assignments
      return true // Return all for now
    })

    res.json({
      message: 'Tasks retrieved successfully',
      tasks: userTasks,
      count: userTasks.length
    })
  } catch (error) {
    console.error('Get tasks error:', error)
    res.status(500).json({
      message: 'Server error while fetching tasks',
      error: error.message
    })
  }
}

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const { taskId } = req.params

    const task = mockTasks.find(t => t.id === taskId)

    if (!task) {
      return res.status(404).json({ message: 'Task not found' })
    }

    res.json({
      message: 'Task retrieved successfully',
      task
    })
  } catch (error) {
    console.error('Get task by ID error:', error)
    res.status(500).json({
      message: 'Server error while fetching task',
      error: error.message
    })
  }
}

// Update task progress (for recording completion)
const updateTaskProgress = async (req, res) => {
  try {
    const { taskId } = req.params
    const { completed } = req.body

    const taskIndex = mockTasks.findIndex(t => t.id === taskId)

    if (taskIndex === -1) {
      return res.status(404).json({ message: 'Task not found' })
    }

    // Update task progress
    mockTasks[taskIndex].completed = completed
    mockTasks[taskIndex].updatedAt = new Date()

    // Update status based on completion
    if (completed >= mockTasks[taskIndex].totalPrompts) {
      mockTasks[taskIndex].status = 'completed'
    } else if (completed > 0) {
      mockTasks[taskIndex].status = 'in_progress'
    }

    res.json({
      message: 'Task progress updated successfully',
      task: mockTasks[taskIndex]
    })
  } catch (error) {
    console.error('Update task progress error:', error)
    res.status(500).json({
      message: 'Server error while updating task',
      error: error.message
    })
  }
}

module.exports = {
  getTasks,
  getTaskById,
  updateTaskProgress
}
