const APIKey = require('../models/APIKey.model');
const crypto = require('crypto');

// Generate API Key
exports.generateAPIKey = async (req, res) => {
  try {
    const { name, permissions } = req.body;

    // Check user tier for API access
    const user = req.user;
    if (user.tier === 'free' || user.tier === 'basic') {
      return res.status(403).json({
        success: false,
        message: 'API access requires Pro or Enterprise tier'
      });
    }

    // Generate random API key
    const key = 'sk_live_' + crypto.randomBytes(32).toString('hex');
    const hashedKey = crypto.createHash('sha256').update(key).digest('hex');

    // Create API key record
    const apiKey = await APIKey.create({
      user: user._id,
      name: name || 'API Key',
      key: hashedKey,
      permissions: permissions || {
        createEscrow: true,
        viewEscrow: true,
        releasePayment: false
      }
    });

    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      apiKey: {
        id: apiKey._id,
        name: apiKey.name,
        key: key, // Only show once
        permissions: apiKey.permissions,
        createdAt: apiKey.createdAt
      },
      warning: 'Save this key securely. You will not be able to see it again.'
    });

  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate API key',
      error: error.message
    });
  }
};

// List User's API Keys
exports.listAPIKeys = async (req, res) => {
  try {
    const apiKeys = await APIKey.find({ user: req.user._id, status: 'active' })
      .select('-key')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: apiKeys.length,
      apiKeys
    });

  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list API keys',
      error: error.message
    });
  }
};

// Revoke API Key
exports.revokeAPIKey = async (req, res) => {
  try {
    const { keyId } = req.params;

    const apiKey = await APIKey.findOne({ _id: keyId, user: req.user._id });
    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    apiKey.status = 'revoked';
    await apiKey.save();

    res.status(200).json({
      success: true,
      message: 'API key revoked successfully'
    });

  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke API key',
      error: error.message
    });
  }
};