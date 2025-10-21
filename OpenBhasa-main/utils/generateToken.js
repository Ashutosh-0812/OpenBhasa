const jwt = require('jsonwebtoken');
const Token = require('../models/Token');

const generateTokens = async (userId) => {
  try {
    // Generate access token (15 minutes)
    const accessToken = jwt.sign(
      { id: userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '15m' }
    );

    // Generate refresh token (7 days)
    const refreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Store refresh token in database
    await Token.findOneAndDelete({ userId, type: 'refresh' });
    
    await Token.create({
      userId,
      token: refreshToken,
      type: 'refresh',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new Error('Token generation failed');
  }
};

const generateResetToken = async (userId) => {
  try {
    const resetToken = jwt.sign(
      { id: userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token in database
    await Token.findOneAndDelete({ userId, type: 'resetPassword' });
    
    await Token.create({
      userId,
      token: resetToken,
      type: 'resetPassword',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
    });

    return resetToken;
  } catch (error) {
    throw new Error('Reset token generation failed');
  }
};

module.exports = { generateTokens, generateResetToken };