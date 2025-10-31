const APIKey = require('../models/APIKey.model');
const User = require('../models/User.model');
const crypto = require('crypto');

exports.authenticateAPIKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        message: 'API key required'
      });
    }

    // Hash the provided key
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Find API key in database
    const keyRecord = await APIKey.findOne({ key: hashedKey, status: 'active' });
    if (!keyRecord) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or revoked API key'
      });
    }

    // Update last used
    keyRecord.lastUsed = new Date();
    await keyRecord.save();

    // Get user
    const user = await User.findById(keyRecord.user);
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account inactive'
      });
    }

    // Attach to request
    req.apiKey = keyRecord;
    req.user = user;

    next();

  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};