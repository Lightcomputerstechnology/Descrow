const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');

/**
 * Authenticate admin via JWT token
 */
exports.authenticateAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Admin authentication required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Optional: enforce token type
    if (decoded.type && decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Find admin
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Admin not found' });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Admin account is suspended' });
    }

    req.admin = admin;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired' });
    }
    console.error('Admin auth error:', error);
    res.status(500).json({ success: false, message: 'Admin authentication failed' });
  }
};

/**
 * Check admin permission
 */
exports.checkPermission = (permission) => (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ success: false, message: 'Admin not authenticated' });
  }

  // Master admins have full access
  if (req.admin.role === 'master' || req.admin.permissions?.[permission]) {
    return next();
  }

  res.status(403).json({
    success: false,
    message: `Permission denied. Required: ${permission}`
  });
};

/**
 * Master-only access
 */
exports.masterOnly = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'master') {
    return res.status(403).json({
      success: false,
      message: 'Master admin access required'
    });
  }
  next();
};
