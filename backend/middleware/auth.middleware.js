const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');

/**
 * Authenticate user via JWT token (required)
 */
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
    next(); // Ignore errors in optional auth
  }
};

/**
 * Authenticate admin via JWT
 */
exports.adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is not active'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Check admin permission
 */
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    const admin = req.admin;

    // Master admin has all permissions
    if (admin.role === 'master') {
      return next();
    }

    // Check specific permission
    if (!admin.permissions || !admin.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: ${permission} required`
      });
    }

    next();
  };
};
