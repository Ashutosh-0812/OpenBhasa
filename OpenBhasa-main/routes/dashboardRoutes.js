const express = require('express');
const authenticate = require('../middleware/auth');
const router = express.Router();

// Student Dashboard
router.get('/student', authenticate, async (req, res) => {
  try {
    // Enhanced dashboard data for student with realistic values
    const dashboardData = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      stats: {
        totalInvitesSent: Math.floor(Math.random() * 10) + 5, // 5-15 invites
        activeParticipants: Math.floor(Math.random() * 8) + 2, // 2-10 participants
        completedRecordings: Math.floor(Math.random() * 50) + 20, // 20-70 recordings
        pendingReviews: Math.floor(Math.random() * 15) + 1 // 1-15 pending
      },
      projects: [
        {
          id: 'project_1',
          name: 'Hindi Sentence Reading',
          description: 'Read Hindi sentences for speech recognition training',
          language: 'Hindi',
          status: 'active',
          totalTasks: 25,
          completedTasks: 18,
          progress: 72
        },
        {
          id: 'project_2', 
          name: 'English Conversation',
          description: 'Practice English conversation scenarios',
          language: 'English',
          status: 'active',
          totalTasks: 30,
          completedTasks: 12,
          progress: 40
        }
      ],
      myTasks: [
        {
          id: 'task_1',
          title: 'Daily Hindi Practice',
          language: 'Hindi',
          completed: 15,
          totalPrompts: 25,
          status: 'in_progress',
          coinsEarned: 150
        },
        {
          id: 'task_2',
          title: 'English Reading Exercise',
          language: 'English', 
          completed: 8,
          totalPrompts: 20,
          status: 'in_progress',
          coinsEarned: 80
        }
      ],
      recentActivities: [
        {
          id: 1,
          message: 'Completed Hindi reading task',
          timestamp: new Date().toISOString(),
          type: 'task_completion'
        },
        {
          id: 2,
          message: 'New participant joined your project',
          timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
          type: 'participant_joined'
        }
      ],
      notifications: [
        {
          id: 1,
          title: 'New Task Available',
          message: 'A new Bengali reading task has been assigned to you',
          type: 'info',
          timestamp: new Date().toISOString()
        }
      ]
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Participant Dashboard  
router.get('/participant', authenticate, async (req, res) => {
  try {
    // Enhanced dashboard data for participant
    const dashboardData = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      stats: {
        assignedTasks: Math.floor(Math.random() * 8) + 2, // 2-10 tasks
        completedTasks: Math.floor(Math.random() * 15) + 5, // 5-20 completed
        totalRecordings: Math.floor(Math.random() * 100) + 25, // 25-125 recordings
        rewardsEarned: Math.floor(Math.random() * 1000) + 500 // 500-1500 coins
      },
      availableTasks: [
        {
          id: 'available_task_1',
          title: 'Hindi Story Reading', 
          language: 'Hindi',
          description: 'Read traditional Hindi stories with expression',
          coinsPerRecording: 25,
          estimatedTime: '15 minutes',
          difficulty: 'Medium'
        },
        {
          id: 'available_task_2',
          title: 'Bengali Conversation',
          language: 'Bengali', 
          description: 'Practice everyday Bengali conversation scenarios',
          coinsPerRecording: 30,
          estimatedTime: '20 minutes', 
          difficulty: 'Easy'
        }
      ],
      recentRecordings: [
        {
          id: 'rec_1',
          taskName: 'Hindi Pronunciation',
          completedAt: new Date().toISOString(),
          status: 'approved',
          coinsEarned: 25
        },
        {
          id: 'rec_2', 
          taskName: 'English Reading',
          completedAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
          status: 'pending_review',
          coinsEarned: 0
        }
      ],
      notifications: [
        {
          id: 1,
          title: 'Recording Approved',
          message: 'Your Hindi story reading has been approved. You earned 25 coins!',
          type: 'success',
          timestamp: new Date().toISOString()
        }
      ]
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Dashboard
router.get('/admin', authenticate, async (req, res) => {
  try {
    const dashboardData = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      stats: {
        totalUsers: Math.floor(Math.random() * 1000) + 500,
        activeUsers: Math.floor(Math.random() * 200) + 100,
        totalProjects: Math.floor(Math.random() * 50) + 25,
        totalRecordings: Math.floor(Math.random() * 10000) + 5000,
        pendingReviews: Math.floor(Math.random() * 100) + 20
      },
      recentActivity: [
        {
          id: 1,
          type: 'user_registered',
          message: 'New student registered',
          timestamp: new Date().toISOString()
        },
        {
          id: 2,
          type: 'task_completed', 
          message: 'Task completed by participant',
          timestamp: new Date(Date.now() - 1800000).toISOString()
        }
      ]
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Reviewer Dashboard
router.get('/reviewer', authenticate, async (req, res) => {
  try {
    const dashboardData = {
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      },
      stats: {
        pendingReviews: Math.floor(Math.random() * 50) + 10,
        completedReviews: Math.floor(Math.random() * 200) + 100,
        totalRecordings: Math.floor(Math.random() * 1000) + 500,
        averageRating: (Math.random() * 2 + 3).toFixed(1) // 3.0 - 5.0
      },
      pendingTasks: [
        {
          id: 'review_1',
          recordingTitle: 'Hindi Story - Episode 1',
          submittedBy: 'Participant Name',
          language: 'Hindi',
          duration: '2:35',
          submittedAt: new Date().toISOString()
        }
      ]
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;