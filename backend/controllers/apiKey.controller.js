const User = require('../models/User.model');
const APIKey = require('../models/APIKey.model');
const crypto = require('crypto');

// Generate API credentials
const generateApiCredentials = () => {
  const apiKey = `dk_live_${crypto.randomBytes(24).toString('hex')}`;
  const apiSecret = crypto.randomBytes(32).toString('hex');
  const hashedSecret = crypto.createHash('sha256').update(apiSecret).digest('hex');
  
  return { apiKey, apiSecret, hashedSecret };
};

// ✅ Generate API Keys (User-based approach - stored in User model)
exports.generateApiKeys = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is on API tier
    if (user.tier !== 'api') {
      return res.status(403).json({
        success: false,
        message: 'API access requires API tier subscription. Please upgrade.',
        upgradeRequired: true,
        currentTier: user.tier
      });
    }

    // Check if keys already exist
    if (user.apiAccess?.apiKey) {
      return res.status(400).json({
        success: false,
        message: 'API keys already exist. Please regenerate if needed.'
      });
    }

    // Generate new credentials
    const { apiKey, apiSecret, hashedSecret } = generateApiCredentials();

    // Save to user
    user.apiAccess = {
      enabled: true,
      apiKey,
      apiSecret: hashedSecret,
      createdAt: new Date(),
      lastUsedAt: null,
      requestCount: 0
    };

    await user.save();

    res.status(200).json({
      success: true,
      message: 'API keys generated successfully',
      data: {
        apiKey,
        apiSecret, // ⚠️ ONLY SHOWN ONCE
        warning: '⚠️ IMPORTANT: Store your API secret securely. It will not be shown again!'
      }
    });

  } catch (error) {
    console.error('Generate API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate API keys',
      error: error.message
    });
  }
};

// ✅ Generate API Key (APIKey model approach - supports multiple keys)
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

// ✅ List User's API Keys
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

// ✅ Regenerate API Keys
exports.regenerateApiKeys = async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(confirmPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Check tier
    if (user.tier !== 'api') {
      return res.status(403).json({
        success: false,
        message: 'API tier required'
      });
    }

    // Generate new credentials
    const { apiKey, apiSecret, hashedSecret } = generateApiCredentials();

    // Save old keys to history (optional)
    if (!user.apiAccess.keyHistory) {
      user.apiAccess.keyHistory = [];
    }
    user.apiAccess.keyHistory.push({
      apiKey: user.apiAccess.apiKey,
      revokedAt: new Date()
    });

    // Update with new keys
    user.apiAccess.apiKey = apiKey;
    user.apiAccess.apiSecret = hashedSecret;
    user.apiAccess.regeneratedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'API keys regenerated successfully. Old keys are now invalid.',
      data: {
        apiKey,
        apiSecret,
        warning: '⚠️ Store securely. This is the last time you\'ll see the secret!'
      }
    });

  } catch (error) {
    console.error('Regenerate API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to regenerate API keys',
      error: error.message
    });
  }
};

// ✅ Get API Usage Statistics
exports.getApiUsage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user || user.tier !== 'api') {
      return res.status(403).json({
        success: false,
        message: 'API tier required'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        apiKey: user.apiAccess?.apiKey,
        enabled: user.apiAccess?.enabled,
        totalRequests: user.apiAccess?.requestCount || 0,
        lastUsedAt: user.apiAccess?.lastUsedAt,
        createdAt: user.apiAccess?.createdAt,
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerDay: 10000
        }
      }
    });

  } catch (error) {
    console.error('Get API usage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API usage',
      error: error.message
    });
  }
};

// ✅ Revoke API Key (APIKey model approach)
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

// ✅ Revoke API Access (User-based approach)
exports.revokeApiAccess = async (req, res) => {
  try {
    const { confirmPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(confirmPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Disable API access
    user.apiAccess.enabled = false;
    user.apiAccess.revokedAt = new Date();

    await user.save();

    res.status(200).json({
      success: true,
      message: 'API access revoked. All API keys are now invalid.'
    });

  } catch (error) {
    console.error('Revoke API access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke API access',
      error: error.message
    });
  }
};

module.exports = exports;