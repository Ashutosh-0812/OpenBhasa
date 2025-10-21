const User = require('../models/User')
const Token = require('../models/Token')
const { generateTokens, generateResetToken } = require('../utils/generateToken')
const sendEmail = require('../utils/sendEmail')
const jwt = require('jsonwebtoken')

// Register user
const register = async (req, res) => {
  try {
    const userData = req.body // validated by middleware

    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'User already exists with this email' })
    }

    const user = new User(userData)
    await user.save()

    const { accessToken, refreshToken } = await generateTokens(user._id)

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    const roleRedirects = {
      admin: '/admin/dashboard',
      student: '/student/dashboard',
      participant: '/participant/dashboard',
      reviewer: '/reviewer/dashboard'
    }

    res.status(201).json({
      message: 'User registered successfully',
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
      redirectTo: roleRedirects[user.role] || '/student/dashboard'
    })
  } catch (error) {
    console.error('Registration error:', error)
    res
      .status(500)
      .json({
        message: 'Server error during registration',
        error: error.message
      })
  }
}

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body // validated by middleware

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' })
    }

    const { accessToken, refreshToken } = await generateTokens(user._id)

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

    const roleRedirects = {
      admin: '/admin/dashboard',
      student: '/student/dashboard',
      participant: '/participant/dashboard',
      reviewer: '/reviewer/dashboard'
    }

    res.json({
      message: 'Login successful',
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
      redirectTo: roleRedirects[user.role] || '/student/dashboard'
    })
  } catch (error) {
    console.error('Login error:', error)
    res
      .status(500)
      .json({ message: 'Server error during login', error: error.message })
  }
}

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const currentRefreshToken = req.cookies.refreshToken

    if (!currentRefreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' })
    }

    const storedToken = await Token.findOne({
      token: currentRefreshToken,
      type: 'refresh'
    })
    if (!storedToken) {
      return res.status(401).json({ message: 'Invalid refresh token' })
    }

    const decoded = jwt.verify(
      currentRefreshToken,
      process.env.JWT_REFRESH_SECRET
    )

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      decoded.id
    )

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000
    })

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.json({ message: 'Token refreshed successfully' })
  } catch (error) {
    res.status(401).json({ message: 'Invalid refresh token' })
  }
}

// Logout
const logout = async (req, res) => {
  try {
    const currentRefreshToken = req.cookies.refreshToken

    if (currentRefreshToken) {
      await Token.findOneAndDelete({ token: currentRefreshToken })
    }

    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')

    res.json({ message: 'Logout successful' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const resetToken = await generateResetToken(user._id)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`

    const message = `\n      <h2>Password Reset Request</h2>\n      <p>You requested to reset your password. Click the link below to reset it:</p>\n      <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>\n      <p>This link will expire in 1 hour.</p>\n      <p>If you didn't request this, please ignore this email.</p>\n    `

    await sendEmail(user.email, 'Password Reset Request', message)

    res.json({ message: 'Password reset link sent to your email' })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const storedToken = await Token.findOne({ token, type: 'resetPassword' })
    if (!storedToken) {
      return res.status(400).json({ message: 'Invalid or expired reset token' })
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET)

    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    user.password = password
    await user.save()

    await Token.findOneAndDelete({ token, type: 'resetPassword' })

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired reset token' })
  }
}

// Get current user
const getMe = async (req, res) => {
  try {
    res.json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        college: req.user.college,
        phone: req.user.phone
      }
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// Verify token
const verifyToken = async (req, res) => {
  try {
    const user = req.user

    const roleRedirects = {
      admin: '/admin/dashboard',
      student: '/student/dashboard',
      participant: '/participant/dashboard',
      reviewer: '/reviewer/dashboard'
    }

    res.json({
      message: 'Token is valid',
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
      redirectTo: roleRedirects[user.role] || '/student/dashboard'
    })
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  verifyToken
}
