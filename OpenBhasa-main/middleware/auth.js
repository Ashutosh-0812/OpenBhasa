const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    // Get token from cookies
    const accessToken = req.cookies.accessToken;
    
    if (!accessToken) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
    
    // Get user from database
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid.' });
  }
};

module.exports = authenticate;