const jwt = require('jsonwebtoken')
const User = require('../models/User')

const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies
    const accessToken = req.cookies.accessToken

    if (!accessToken) {
      return res
        .status(401)
        .json({ message: 'Access denied. No token provided.' })
    }

    // Verify token
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET)

    // Get user from database
    const user = await User.findById(decoded.id).select(
      '-password -refreshToken'
    )

    if (!user) {
      return res
        .status(401)
        .json({ message: 'User not found. Token is invalid.' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Authentication error:', error.message)
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired.' })
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token format.' })
    }
    res.status(401).json({ message: 'Token verification failed.' })
  }
}

module.exports = authenticate
