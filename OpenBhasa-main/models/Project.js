const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Project title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Project description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    language: {
      type: String,
      required: [true, 'Language is required'],
      trim: true
    },
    dialects: [{
      type: String,
      trim: true
    }],
    targetRecordings: {
      type: Number,
      default: 1000,
      min: [1, 'Target must be at least 1']
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed', 'archived'],
      default: 'draft'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignedReviewers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    guidelines: {
      type: String,
      maxlength: [5000, 'Guidelines cannot exceed 5000 characters']
    },
    tags: [{
      type: String,
      trim: true
    }],
    metadata: {
      totalTasks: { type: Number, default: 0 },
      completedRecordings: { type: Number, default: 0 },
      approvedRecordings: { type: Number, default: 0 },
      rejectedRecordings: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
projectSchema.index({ createdBy: 1, status: 1 });
projectSchema.index({ language: 1 });
projectSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Project', projectSchema);
