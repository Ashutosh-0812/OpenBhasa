const mongoose = require('mongoose')

const participantInviteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    participantData: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
      },
      phone: {
        type: String,
        required: true
      },
      institute: {
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
      ]
    },
    inviteToken: {
      type: String,
      required: true,
      unique: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending'
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    },
    acceptedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

// Index for cleanup of expired invites
participantInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

module.exports = mongoose.model('ParticipantInvite', participantInviteSchema)
