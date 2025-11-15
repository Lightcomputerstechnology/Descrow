// backend/routes/apiKey.routes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const APIKey = require('../models/APIKey.model');

// Get all API keys for user
router.get('/', protect, async (req, res) => {
  try {
    const apiKeys = await APIKey.find({ userId: req.user._id }) // Changed ApiKey to APIKey
      .select('-secret')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: apiKeys
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch API keys'
    });
  }
});

// Create new API key
router.post('/create', protect, async (req, res) => {
  try {
    const { name, environment, webhookUrl, metadata } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'API key name is required'
      });
    }

    // Generate key and secret
    const { key, secret } = APIKey.generateKey(); // Changed ApiKey to APIKey

    // Create API key
    const apiKey = await APIKey.create({ // Changed ApiKey to APIKey
      userId: req.user._id,
      name,
      key,
      secret,
      environment: environment || 'sandbox',
      webhookUrl,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'API key created successfully. Store the secret securely - it won\'t be shown again!',
      data: {
        id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key,
        secret: secret,
        environment: apiKey.environment,
        createdAt: apiKey.createdAt
      }
    });

  } catch (error) {
    console.error('Create API Key Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create API key'
    });
  }
});

// Revoke API key
router.delete('/:id', protect, async (req, res) => {
  try {
    const apiKey = await APIKey.findOne({ // Changed ApiKey to APIKey
      _id: req.params.id,
      userId: req.user._id
    });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found'
      });
    }

    apiKey.status = 'revoked';
    await apiKey.save();

    res.json({
      success: true,
      message: 'API key revoked successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to revoke API key'
    });
  }
});

module.exports = router;