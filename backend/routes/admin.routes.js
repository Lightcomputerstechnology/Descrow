const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin.model');

const protectAdmin = async (req, res, next) => {
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

const checkPermission = (permission) => {
  return (req, res, next) => {
    const admin = req.admin;

    if (admin.role === 'master') {
      return next();
    }

    if (!admin.permissions || !admin.permissions[permission]) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: ${permission} required`
      });
    }

    next();
  };
};

const masterOnly = (req, res, next) => {
  const admin = req.admin;

  if (admin.role !== 'master') {
    return res.status(403).json({
      success: false,
      message: 'Access denied: Master admin only'
    });
  }

  next();
};

module.exports = {
  protectAdmin,
  checkPermission,
  masterOnly
};