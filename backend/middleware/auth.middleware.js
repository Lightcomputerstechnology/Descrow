const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const Admin = require('../models/Admin.model');

// Protect user routes
exports.protect = async (req, res, next) => {
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

    // Get user from token
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended'
      });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Protect admin routes
exports.protectAdmin = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - Admin access required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get admin from token
    const admin = await Admin.findById(decoded.id);
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Admin account is suspended'
      });
    }

    req.admin = admin;
    next();

  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Not authorized - Admin access required'
    });
  }
};

// Check specific admin permission
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (req.admin.role === 'master' || req.admin.permissions[permission]) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
  };
};

// Verify API key
exports.verifyAPIKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key is required'
      });
    }

    const APIKey = require('../models/APIKey.model');
    const keyData = await APIKey.findOne({ apiKey, status: 'active' });

    if (!keyData) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or revoked API key'
      });
    }

    // Check rate limit
    const now = new Date();
    const hourAgo = new Date(now.getTime() - (60 * 60 * 1000));
    
    // Simple rate limiting (can be improved with Redis)
    if (keyData.requestsToday >= keyData.rateLimit) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded'
      });
    }

    // Update usage stats
    keyData.requestsToday += 1;
    keyData.requestsThisMonth += 1;
    keyData.lastUsed = now;
    await keyData.save();

    req.apiKey = keyData;
    next();

  } catch (error) {
    console.error('API key verification error:', error);
    res.status(401).json({
      success: false,
      message: 'API key verification failed'
    });
  }
};
