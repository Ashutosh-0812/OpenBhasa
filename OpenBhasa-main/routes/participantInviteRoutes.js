const express = require('express')
const {
  createParticipantInvite,
  getParticipantInvite,
  acceptParticipantInvite,
  getStudentParticipantInvites
} = require('../controllers/participantInviteController')
const authenticate = require('../middleware/auth')
const authorize = require('../middleware/role')

const router = express.Router()

// Student routes - for creating and managing invites
router.post(
  '/create',
  authenticate,
  authorize('student'),
  createParticipantInvite
)
router.get(
  '/my-invites',
  authenticate,
  authorize('student'),
  getStudentParticipantInvites
)

// Public routes - for participants to access invites
router.get('/:token', getParticipantInvite)
router.post('/:token/accept', acceptParticipantInvite)

module.exports = router
