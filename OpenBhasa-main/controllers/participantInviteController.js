const ParticipantInvite = require('../models/ParticipantInvite');
const User = require('../models/User');
const Validators = require('../utils/validators');
const { generateTokens } = require('../utils/generateToken');

// @desc    Create a participant invitation
// @route   POST /api/participant-invites/create
// @access  Private (Student only)
const createInvite = async (req, res) => {
  try {
    console.log('📋 Received participant invite data:', JSON.stringify(req.body, null, 2));
    
    // Validate participant invite data (no password required)
    const validation = Validators.validateParticipantInvite(req.body);
    
    console.log('🔍 Validation result:', {
      isValid: validation.isValid,
      errors: validation.errors,
      hasData: !!validation.validatedData
    });
    
    if (validation.errors && validation.errors.length > 0) {
      console.log('❌ Validation failed with errors:', validation.errors);
      return res.status(400).json({
        message: 'Validation failed',
        errors: validation.errors
      });
    }

    const { name, email, phone, institute, age, gender, native, language, dialects, accent } = req.body;

    // Check if participant email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this email already exists'
      });
    }

    // Check if there's already a pending invite for this email
    const existingInvite = await ParticipantInvite.findOne({
      'participantData.email': email.toLowerCase(),
      status: 'pending'
    });

    if (existingInvite && !existingInvite.isExpired()) {
      return res.status(400).json({
        message: 'An active invitation already exists for this email',
        invite: {
          inviteLink: existingInvite.getInviteLink(),
          expiresAt: existingInvite.expiresAt
        }
      });
    }

    // Create new invite
    const invite = new ParticipantInvite({
      studentId: req.user._id,
      studentName: req.user.name,
      studentCollege: req.user.college,
      participantData: {
        name,
        email: email.toLowerCase(),
        phone,
        institute,
        age,
        gender: gender.toLowerCase(),
        native,
        language,
        dialects: dialects || [],
        accent: accent || []
      }
    });

    // Generate token
    invite.generateToken();

    await invite.save();

    res.status(201).json({
      message: 'Participant invitation created successfully',
      invite: {
        _id: invite._id,
        participantName: invite.participantData.name,
        participantEmail: invite.participantData.email,
        inviteLink: invite.getInviteLink(),
        token: invite.token,
        expiresAt: invite.expiresAt,
        status: invite.status
      }
    });
  } catch (error) {
    console.error('Create invite error:', error);
    res.status(500).json({
      message: 'Failed to create invitation',
      error: error.message
    });
  }
};

// @desc    Get all invitations created by current student
// @route   GET /api/participant-invites/my-invites
// @access  Private (Student only)
const getMyInvites = async (req, res) => {
  try {
    const invites = await ParticipantInvite.find({
      studentId: req.user._id
    })
      .sort({ createdAt: -1 })
      .populate('participantId', 'name email');

    // Update expired invites
    const now = new Date();
    for (let invite of invites) {
      if (invite.status === 'pending' && invite.expiresAt < now) {
        invite.status = 'expired';
        await invite.save();
      }
    }

    res.status(200).json({
      count: invites.length,
      invites: invites.map(invite => ({
        _id: invite._id,
        participantName: invite.participantData.name,
        participantEmail: invite.participantData.email,
        participantPhone: invite.participantData.phone,
        institute: invite.participantData.institute,
        status: invite.status,
        inviteLink: invite.getInviteLink(),
        token: invite.token,
        createdAt: invite.createdAt,
        expiresAt: invite.expiresAt,
        acceptedAt: invite.acceptedAt,
        participantId: invite.participantId
      }))
    });
  } catch (error) {
    console.error('Get my invites error:', error);
    res.status(500).json({
      message: 'Failed to fetch invitations',
      error: error.message
    });
  }
};

// @desc    Get invitation details by token (public access for participant to view)
// @route   GET /api/participant-invites/:token
// @access  Public
const getInviteByToken = async (req, res) => {
  try {
    const { token } = req.params;
    console.log('🔍 Getting invite by token:', token);

    const invite = await ParticipantInvite.findOne({ token });

    if (!invite) {
      console.log('❌ Invitation not found for token:', token);
      return res.status(404).json({
        message: 'Invitation not found or invalid token'
      });
    }

    console.log('✅ Found invite, status:', invite.status);

    // Invitations never expire - removed expiration check

    // Return invitation data regardless of status, let frontend handle the logic
    console.log('📤 Returning invite data with status:', invite.status);
    res.status(200).json({
      invite: {
        _id: invite._id,
        studentName: invite.studentName,
        studentCollege: invite.studentCollege,
        participantData: invite.participantData,
        expiresAt: invite.expiresAt,
        status: invite.status
      }
    });
  } catch (error) {
    console.error('Get invite by token error:', error);
    res.status(500).json({
      message: 'Failed to fetch invitation',
      error: error.message
    });
  }
};

// @desc    Accept invitation and create participant account
// @route   POST /api/participant-invites/:token/accept
// @access  Public
const acceptInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('🔄 Accept invite called with token:', token);

    if (!password) {
      console.log('❌ No password provided');
      return res.status(400).json({
        message: 'Password is required'
      });
    }

    // Validate password
    console.log('🔍 Validating password...');
    const passwordValidation = Validators.validatePassword(password);
    if (!passwordValidation.isValid) {
      console.log('❌ Password validation failed:', passwordValidation.message);
      return res.status(400).json({
        message: passwordValidation.message
      });
    }
    console.log('✅ Password validation passed');

    const invite = await ParticipantInvite.findOne({ token });

    if (!invite) {
      return res.status(404).json({
        message: 'Invitation not found or invalid token'
      });
    }

    // Invitations never expire - removed expiration check

    if (invite.status === 'accepted') {
      return res.status(400).json({
        message: 'This invitation has already been accepted'
      });
    }

    // Check if email is already registered
    const existingUser = await User.findOne({ email: invite.participantData.email });
    if (existingUser) {
      return res.status(400).json({
        message: 'An account with this email already exists'
      });
    }

    // Create participant user account (password will be hashed by pre-save hook)
    console.log('📝 Creating participant user account for:', invite.participantData.email);
    
    const userData = {
      name: invite.participantData.name,
      email: invite.participantData.email,
      password: password, // Don't hash here - let the pre-save hook handle it
      role: 'participant',
      phone: invite.participantData.phone,
      college: invite.participantData.institute, // Using institute as college field
      age: invite.participantData.age,
      gender: invite.participantData.gender,
      native: invite.participantData.native,
      language: invite.participantData.language,
      dialects: invite.participantData.dialects,
      accent: invite.participantData.accent,
      managedBy: invite.studentId, // Set the managing student
      isVerified: true // Auto-verify invited participants
    };
    
    console.log('📝 User data to create:', JSON.stringify(userData, null, 2));
    
    // Additional validation for required fields
    if (!userData.name || !userData.email || !userData.password || !userData.phone || !userData.college || !userData.age || !userData.gender || !userData.native) {
      console.log('❌ Missing required fields for user creation');
      return res.status(400).json({
        message: 'Missing required participant information'
      });
    }
    
    const participant = await User.create(userData);
    console.log('✅ Participant user created successfully:', participant._id);

    // Add participant to student's participants array
    await User.findByIdAndUpdate(invite.studentId, {
      $addToSet: { participants: participant._id }
    });
    console.log('✅ Participant added to student\'s participants list');

    // Update invite status
    invite.status = 'accepted';
    invite.acceptedAt = new Date();
    invite.participantId = participant._id;
    await invite.save();

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(participant._id);

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: {
        _id: participant._id,
        name: participant.name,
        email: participant.email,
        role: participant.role,
        phone: participant.phone,
        institute: invite.participantData.institute
      },
      redirectTo: '/participant/dashboard'
    });
  } catch (error) {
    console.error('❌ Accept invite error:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      message: 'Failed to accept invitation',
      error: error.message
    });
  }
};

// @desc    Login participant using invitation token
// @route   POST /api/participant-invites/:token/login
// @access  Public
const loginWithInvite = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    console.log('🔄 Participant login via invitation token:', token);

    if (!password) {
      return res.status(400).json({
        message: 'Password is required'
      });
    }

    // Find the invitation
    const invite = await ParticipantInvite.findOne({ token });
    if (!invite) {
      return res.status(404).json({
        message: 'Invalid invitation link'
      });
    }

    // Check if invitation was accepted (has associated participant)
    if (invite.status !== 'accepted') {
      return res.status(400).json({
        message: 'This invitation has not been accepted yet. Please complete registration first.'
      });
    }

    // Find the participant user
    const participant = await User.findOne({ 
      email: invite.participantData.email, 
      role: 'participant' 
    });

    if (!participant) {
      return res.status(400).json({
        message: 'Participant account not found. Please contact support.'
      });
    }

    console.log('🔍 Participant login attempt for:', participant.name);

    // Verify password
    const isMatch = await participant.comparePassword(password);
    if (!isMatch) {
      console.log('❌ Participant login failed: Invalid password');
      return res.status(400).json({
        message: 'Invalid password'
      });
    }

    console.log('✅ Participant login successful:', participant.name);

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(participant._id);

    // Set cookies
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: 'Login successful',
      user: {
        id: participant._id,
        name: participant.name,
        email: participant.email,
        role: participant.role,
        college: participant.college,
        phone: participant.phone,
        age: participant.age,
        gender: participant.gender,
        native: participant.native,
        language: participant.language,
        dialects: participant.dialects,
        accent: participant.accent
      },
      redirectTo: '/participant/dashboard'
    });

  } catch (error) {
    console.error('❌ Participant login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
};

module.exports = {
  createInvite,
  getMyInvites,
  getInviteByToken,
  acceptInvite,
  loginWithInvite
};
