const express = require('express');
const {
  submitRecording,
  getRecordings,
  getRecording,
  reviewRecording,
  deleteRecording,
  getMyRecordings
} = require('../controllers/recordingController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get my recordings (student, participant)
router.get('/my-recordings', authorize('student', 'participant'), getMyRecordings);

// Submit recording (student, participant)
router.post('/', authorize('student', 'participant'), submitRecording);

// Get all recordings (role-based filtering)
router.get('/', getRecordings);

// Get single recording
router.get('/:id', getRecording);

// Review recording (reviewer, admin)
router.put('/:id/review', authorize('admin', 'reviewer'), reviewRecording);

// Delete recording (admin, owner)
router.delete('/:id', deleteRecording);

module.exports = router;
