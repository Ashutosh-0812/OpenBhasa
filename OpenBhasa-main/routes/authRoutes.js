const express = require('express')
const {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  verifyToken
} = require('../controllers/authController')
const authenticate = require('../middleware/auth')
const authorize = require('../middleware/role')
const {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation')

const router = express.Router()

// Public routes with validation
router.post('/register', validateRegistration, register)
router.post('/login', validateLogin, login)
router.post('/refresh-token', refreshToken)
router.post('/forgot-password', validateForgotPassword, forgotPassword)
router.post('/reset-password/:token', validateResetPassword, resetPassword)

// Protected routes
router.get('/verify', authenticate, verifyToken)
router.post('/logout', authenticate, logout)
router.get('/me', authenticate, getMe)

// Admin only route example
router.get('/admin/dashboard', authenticate, authorize('admin'), (req, res) => {
  res.json({
    message: 'Welcome to Admin Dashboard',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  })
})

// Role-specific dashboard routes
router.get(
  '/student/dashboard',
  authenticate,
  authorize('student'),
  (req, res) => {
    res.json({
      message: 'Welcome to Student Dashboard',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        college: req.user.college
      }
    })
  }
)

router.get(
  '/participant/dashboard',
  authenticate,
  authorize('participant'),
  (req, res) => {
    res.json({
      message: 'Welcome to Participant Dashboard',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        college: req.user.college
      }
    })
  }
)

router.get(
  '/reviewer/dashboard',
  authenticate,
  authorize('reviewer'),
  (req, res) => {
    res.json({
      message: 'Welcome to Reviewer Dashboard',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    })
  }
)

module.exports = router
