const mongoose = require('mongoose');

const taskRequestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    script: {
      type: String,
      required: [true, 'Script/text is required'],
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
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    },
    // Requester info
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    requestType: {
      type: String,
      enum: ['student', 'participant'],
      required: true
    },
    // Justification
    justification: {
      type: String,
      required: [true, 'Justification is required'],
      maxlength: [1000, 'Justification cannot exceed 1000 characters']
    },
    expectedRecordings: {
      type: Number,
      default: 1,
      min: [1, 'Expected recordings must be at least 1']
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    },
    // Approval workflow
    status: {
      type: String,
      enum: ['pending', 'under_review', 'approved', 'rejected', 'cancelled'],
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
    // If approved, link to created task
    createdTask: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    },
    // Additional metadata
    tags: [{
      type: String,
      trim: true
    }],
    estimatedDuration: {
      type: Number, // in seconds
      default: 60
    },
    isUrgent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Indexes
taskRequestSchema.index({ requestedBy: 1, status: 1 });
taskRequestSchema.index({ status: 1, createdAt: -1 });
taskRequestSchema.index({ reviewedBy: 1 });
taskRequestSchema.index({ project: 1, status: 1 });

module.exports = mongoose.model('TaskRequest', taskRequestSchema);
