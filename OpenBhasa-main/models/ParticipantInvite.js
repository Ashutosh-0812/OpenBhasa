const mongoose = require('mongoose');
const crypto = require('crypto');

const participantInviteSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    studentName: {
      type: String,
      required: true
    },
    studentCollege: {
      type: String,
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
        required: true,
        trim: true
      },
      institute: {
        type: String,
        required: true,
        trim: true
      },
      age: {
        type: Number,
        required: true,
        min: 13,
        max: 100
      },
      gender: {
        type: String,
        required: true,
        enum: ['male', 'female', 'other'],
        lowercase: true
      },
      native: {
        type: String,
        required: true,
        trim: true
      },
      language: {
        type: [String],
        required: true,
        validate: {
          validator: function(arr) {
            return arr && arr.length > 0;
          },
          message: 'At least one language is required'
        }
      },
      dialects: {
        type: [String],
        default: []
      },
      accent: {
        type: [String],
        default: []
      }
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending'
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    acceptedAt: {
      type: Date
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Generate unique invite token
participantInviteSchema.methods.generateToken = function() {
  this.token = crypto.randomBytes(32).toString('hex');
  this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  return this.token;
};

// Check if invite is expired (always false - invitations never expire)
participantInviteSchema.methods.isExpired = function() {
  return false; // Invitations never expire
};

// Generate invite link
participantInviteSchema.methods.getInviteLink = function() {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  return `${baseUrl}/participant/register/${this.token}`;
};

// Auto-expire old invites before save
participantInviteSchema.pre('save', function(next) {
  if (this.status === 'pending' && this.expiresAt < new Date()) {
    this.status = 'expired';
  }
  next();
});

// Create indexes for performance
participantInviteSchema.index({ studentId: 1, status: 1 });
participantInviteSchema.index({ 'participantData.email': 1 });
participantInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

const ParticipantInvite = mongoose.model('ParticipantInvite', participantInviteSchema);

module.exports = ParticipantInvite;
