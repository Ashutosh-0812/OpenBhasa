const express = require('express');
const {
  addParticipant,
  getMyParticipants,
  getParticipant,
  updateParticipant,
  removeParticipant,
  getAllReviewers,
  addReviewer,
  getAllUsers
} = require('../controllers/userController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');
const { validateParticipant } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (admin, student)
router.get('/', authorize('admin', 'student'), getAllUsers);

// Participant routes
router.post('/participants', authorize('student'), validateParticipant, addParticipant);
router.get('/participants/my-participants', authorize('student'), getMyParticipants);
router.get('/participants/:id', authorize('student', 'admin'), getParticipant);
router.put('/participants/:id', authorize('student', 'admin'), updateParticipant);
router.delete('/participants/:id', authorize('student', 'admin'), removeParticipant);

// Reviewer routes (admin only)
router.get('/reviewers', authorize('admin'), getAllReviewers);
router.post('/reviewers', authorize('admin'), addReviewer);

module.exports = router;
