const express = require('express');
const {
  uploadAndSubmitRecording,
  submitRecording,
  getRecordings,
  getRecordingById,
  reviewRecording,
  deleteRecording,
  getMyRecordings
} = require('../controllers/recordingControllerWithVAD');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get my recordings (student, participant)
router.get('/my-recordings', authorize('student', 'participant'), getMyRecordings);

// Upload audio file with VAD processing (student, participant)
router.post('/upload', authorize('student', 'participant'), uploadAndSubmitRecording);

// Submit recording with audioUrl (student, participant) - legacy endpoint
router.post('/', authorize('student', 'participant'), submitRecording);

// Get all recordings (role-based filtering)
router.get('/', getRecordings);

// Get single recording
router.get('/:id', getRecordingById);

// Review recording (reviewer, admin)
router.put('/:id/review', authorize('admin', 'reviewer'), reviewRecording);

// Delete recording (admin, owner)
router.delete('/:id', deleteRecording);

module.exports = router;
