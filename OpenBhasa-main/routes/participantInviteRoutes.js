const express = require('express');
const router = express.Router();
const {
  createInvite,
  getMyInvites,
  getInviteByToken,
  acceptInvite,
  loginWithInvite
} = require('../controllers/participantInviteController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Protected routes (Student only)
router.post('/create', authenticate, authorize('student'), createInvite);
router.get('/my-invites', authenticate, authorize('student'), getMyInvites);

// Public routes (for participants to access)
router.get('/:token', getInviteByToken);
router.post('/:token/accept', acceptInvite);
router.post('/:token/login', loginWithInvite);

module.exports = router;
