const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authenticate user via JWT token (required)
 */
exports.authenticate = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user and exclude sensitive fields
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email first'
      });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended'
      });
    }

    // Attach user to request
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    console.error('Authentication error:', error);
    res.status(500).json({ success: false, message: 'Authentication failed' });
  }
};

/**
 * Optional authentication (doesn't block request if no token)
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.verified) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignore errors in optional auth
    next();
  }
};