const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    script: {
      type: String,
      required: [true, 'Script/text to be recorded is required'],
      maxlength: [5000, 'Script cannot exceed 5000 characters']
    },
    language: {
      type: String,
      required: true,
      trim: true
    },
    dialect: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['standard', 'custom'],
      default: 'standard'
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    estimatedDuration: {
      type: Number, // in seconds
      default: 60
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'paused', 'completed'],
      default: 'active'
    },
    // For custom tasks
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved' // standard tasks are auto-approved
    },
    approvalNotes: {
      type: String,
      maxlength: [500, 'Approval notes cannot exceed 500 characters']
    },
    // Assignment
    assignedTo: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      assignedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // Metadata
    targetRecordings: {
      type: Number,
      default: 10,
      min: [1, 'Target must be at least 1']
    },
    completedRecordings: {
      type: Number,
      default: 0
    },
    tags: [{
      type: String,
      trim: true
    }],
    priority: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

// Indexes
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ type: 1, approvalStatus: 1 });
taskSchema.index({ language: 1 });
taskSchema.index({ 'assignedTo.user': 1 });

module.exports = mongoose.model('Task', taskSchema);
