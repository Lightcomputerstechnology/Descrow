// backend/middleware/apiAuth.js
const APIKey = require('../models/APIKey.model');
const rateLimit = require('express-rate-limit');

// API Key Authentication
exports.authenticateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];
    const apiSecret = req.headers['x-api-secret'];

    if (!apiKey || !apiSecret) {
      return res.status(401).json({
        success: false,
        error: 'API_KEY_REQUIRED',
        message: 'API key and secret are required. Include x-api-key and x-api-secret in headers.'
      });
    }

    // Find API key
    const keyDoc = await ApiKey.findOne({ key: apiKey }).populate('userId');

    if (!keyDoc) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_API_KEY',
        message: 'Invalid API key'
      });
    }

    // Verify status
    if (keyDoc.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'API_KEY_INACTIVE',
        message: 'API key is inactive or revoked'
      });
    }

    // Verify secret
    if (!keyDoc.verifySecret(apiSecret)) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_API_SECRET',
        message: 'Invalid API secret'
      });
    }

    // Check expiration
    if (keyDoc.expiresAt && keyDoc.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'API_KEY_EXPIRED',
        message: 'API key has expired'
      });
    }

    // Check IP whitelist
    if (keyDoc.ipWhitelist && keyDoc.ipWhitelist.length > 0) {
      const clientIp = req.ip || req.connection.remoteAddress;
      if (!keyDoc.ipWhitelist.includes(clientIp)) {
        return res.status(403).json({
          success: false,
          error: 'IP_NOT_WHITELISTED',
          message: 'Your IP address is not whitelisted for this API key'
        });
      }
    }

    // Increment usage
    await keyDoc.incrementUsage();

    // Attach to request
    req.apiKey = keyDoc;
    req.apiUser = keyDoc.userId;
    req.environment = keyDoc.environment;

    next();
  } catch (error) {
    console.error('API Auth Error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Authentication failed'
    });
  }
};

// Check specific permission
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.apiKey.permissions[permission]) {
      return res.status(403).json({
        success: false,
        error: 'PERMISSION_DENIED',
        message: `Your API key does not have ${permission} permission`
      });
    }
    next();
  };
};

// Rate limiter for API
exports.apiRateLimiter = (req, res, next) => {
  const keyDoc = req.apiKey;
  
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: keyDoc.rateLimit.requestsPerMinute,
    message: {
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: `Rate limit exceeded. Max ${keyDoc.rateLimit.requestsPerMinute} requests per minute.`
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  return limiter(req, res, next);
};
