const ParticipantInvite = require('../models/ParticipantInvite')
const User = require('../models/User')
const { generateTokens } = require('../utils/generateToken')
const crypto = require('crypto')

// Create participant invite
const createParticipantInvite = async (req, res) => {
  try {
    const studentId = req.user._id
    const participantData = req.body

    // Check if email already exists as a user
    const existingUser = await User.findOne({ email: participantData.email })
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      })
    }

    // Check if there's already a pending invite for this email
    const existingInvite = await ParticipantInvite.findOne({
      'participantData.email': participantData.email,
      status: 'pending'
    })
    if (existingInvite) {
      return res.status(400).json({
        message: 'An invite for this email is already pending'
      })
    }

    // Generate unique invite token
    const inviteToken = crypto.randomBytes(32).toString('hex')

    // Create participant invite
    const invite = new ParticipantInvite({
      studentId,
      participantData,
      inviteToken
    })

    await invite.save()

    // Generate invite link
    const inviteLink = `${process.env.CLIENT_URL}/register/participant/${inviteToken}`

    res.status(201).json({
      message: 'Participant invite created successfully',
      invite: {
        id: invite._id,
        participantName: participantData.name,
        participantEmail: participantData.email,
        inviteLink,
        status: invite.status,
        expiresAt: invite.expiresAt
      }
    })
  } catch (error) {
    console.error('Create participant invite error:', error)
    res.status(500).json({
      message: 'Server error during invite creation',
      error: error.message
    })
  }
}

// Get participant invite by token
const getParticipantInvite = async (req, res) => {
  try {
    const { token } = req.params

    const invite = await ParticipantInvite.findOne({
      inviteToken: token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('studentId', 'name email college')

    if (!invite) {
      return res.status(404).json({
        message: 'Invalid or expired invitation link'
      })
    }

    res.json({
      invite: {
        id: invite._id,
        studentName: invite.studentId.name,
        studentCollege: invite.studentId.college,
        participantData: invite.participantData,
        expiresAt: invite.expiresAt
      }
    })
  } catch (error) {
    console.error('Get participant invite error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
}

// Accept participant invite and register
const acceptParticipantInvite = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    // Find and validate invite
    const invite = await ParticipantInvite.findOne({
      inviteToken: token,
      status: 'pending',
      expiresAt: { $gt: new Date() }
    })

    if (!invite) {
      return res.status(404).json({
        message: 'Invalid or expired invitation link'
      })
    }

    // Create user account
    const userData = {
      ...invite.participantData,
      college: invite.participantData.institute, // Map institute to college field
      password,
      role: 'participant'
    }

    const user = new User(userData)
    await user.save()

    // Update invite status
    invite.status = 'accepted'
    invite.acceptedAt = new Date()
    await invite.save()

    // Generate tokens for auto-login
    const { accessToken, refreshToken } = await generateTokens(user._id)

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college,
        phone: user.phone,
        age: user.age,
        gender: user.gender,
        native: user.native,
        language: user.language,
        dialects: user.dialects,
        accent: user.accent
      },
      redirectTo: '/participant/dashboard'
    })
  } catch (error) {
    console.error('Accept participant invite error:', error)
    res.status(500).json({
      message: 'Server error during registration',
      error: error.message
    })
  }
}

// Get student's participant invites
const getStudentParticipantInvites = async (req, res) => {
  try {
    const studentId = req.user._id

    const invites = await ParticipantInvite.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(50)

    const formattedInvites = invites.map(invite => ({
      id: invite._id,
      participantName: invite.participantData.name,
      participantEmail: invite.participantData.email,
      participantPhone: invite.participantData.phone,
      institute: invite.participantData.institute,
      languageToRecord: invite.participantData.language,
      dialects: invite.participantData.dialects,
      accent: invite.participantData.accent,
      age: invite.participantData.age,
      gender: invite.participantData.gender,
      native: invite.participantData.native,
      status: invite.status,
      inviteToken: invite.inviteToken,
      inviteLink:
        invite.status === 'pending'
          ? `${process.env.CLIENT_URL}/register/participant/${invite.inviteToken}`
          : null,
      createdAt: invite.createdAt,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.acceptedAt
    }))

    res.json({
      invites: formattedInvites
    })
  } catch (error) {
    console.error('Get student invites error:', error)
    res.status(500).json({
      message: 'Server error',
      error: error.message
    })
  }
}

module.exports = {
  createParticipantInvite,
  getParticipantInvite,
  acceptParticipantInvite,
  getStudentParticipantInvites
}
