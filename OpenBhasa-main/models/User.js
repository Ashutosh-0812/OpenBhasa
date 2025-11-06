const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    college: {
      type: String,
      required: true
    },
    age: {
      type: Number,
      required: true
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true
    },
    native: {
      type: String,
      required: true
    },
    language: [
      {
        type: String
      }
    ],
    dialects: [
      {
        type: String
      }
    ],
    accent: [
      {
        type: String
      }
    ],
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ['student', 'admin', 'participant', 'reviewer'],
      default: 'student'
    },
    refreshToken: {
      type: String
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    // Student-specific fields
    managedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // References the student who added this participant
    },
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' // Students can have multiple participants
    }],
    // Reviewer-specific fields
    assignedProjects: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project'
    }],
    // Statistics
    stats: {
      totalRecordings: { type: Number, default: 0 },
      approvedRecordings: { type: Number, default: 0 },
      rejectedRecordings: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 }, // for reviewers
      tasksCompleted: { type: Number, default: 0 }
    },
    // Status
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

module.exports = mongoose.model('User', userSchema)
