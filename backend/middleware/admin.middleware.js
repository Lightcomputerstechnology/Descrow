const Admin = require('../models/Admin.model');
const jwt = require('jsonwebtoken');

// Protect admin routes
exports.protectAdmin = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if admin token
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Get admin from database
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    // Check if admin is active
    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is suspended'
      });
    }

    // Attach admin to request
    req.admin = admin;
    next();

  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Check specific permission
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Master admin has all permissions
    if (req.admin.role === 'master') {
      return next();
    }

    // Check if sub-admin has required permission
    if (!req.admin.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required: ${permission}`
      });
    }

    next();
  };
};

// Master admin only
exports.masterOnly = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'master') {
    return res.status(403).json({
      success: false,
      message: 'Master admin access required'
    });
  }
  next();
};
