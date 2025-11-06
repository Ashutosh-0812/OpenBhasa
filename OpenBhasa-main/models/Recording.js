const mongoose = require('mongoose');

const recordingSchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    contributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // Student who manages this participant (if contributor is participant)
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    // Audio data
    audioUrl: {
      type: String,
      required: [true, 'Audio file URL is required']
    },
    duration: {
      type: Number, // in seconds
      required: true
    },
    fileSize: {
      type: Number, // in bytes
      required: true
    },
    format: {
      type: String,
      default: 'wav'
    },
    // Recording metadata
    transcript: {
      type: String, // What was actually said (for verification)
      maxlength: [5000, 'Transcript cannot exceed 5000 characters']
    },
    recordingEnvironment: {
      type: String,
      enum: ['quiet', 'moderate', 'noisy'],
      default: 'moderate'
    },
    deviceInfo: {
      browser: String,
      os: String,
      microphone: String
    },
    // Review and quality
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_revision'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    },
    reviewNotes: {
      type: String,
      maxlength: [1000, 'Review notes cannot exceed 1000 characters']
    },
    qualityScore: {
      clarity: { type: Number, min: 1, max: 5 },
      accuracy: { type: Number, min: 1, max: 5 },
      pronunciation: { type: Number, min: 1, max: 5 },
      overall: { type: Number, min: 1, max: 5 }
    },
    // Flags and issues
    flags: [{
      type: {
        type: String,
        enum: ['background_noise', 'low_volume', 'incorrect_text', 'accent_issue', 'quality_issue', 'other']
      },
      note: String,
      flaggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      flaggedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Contribution tracking
    attempts: {
      type: Number,
      default: 1
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
recordingSchema.index({ task: 1, contributor: 1 });
recordingSchema.index({ project: 1, reviewStatus: 1 });
recordingSchema.index({ reviewStatus: 1, createdAt: -1 });
recordingSchema.index({ contributor: 1, reviewStatus: 1 });
recordingSchema.index({ managedBy: 1 });

// Virtual for overall quality
recordingSchema.virtual('averageQuality').get(function() {
  if (!this.qualityScore) return null;
  const scores = Object.values(this.qualityScore).filter(s => s);
  return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
});

module.exports = mongoose.model('Recording', recordingSchema);
