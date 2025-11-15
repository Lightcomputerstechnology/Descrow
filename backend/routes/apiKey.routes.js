// backend/routes/apiKey.routes.js - UPDATE WITH FULL FUNCTIONALITY
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const ApiKey = require('../models/ApiKey.model');

// Get all API keys for user
router.get('/', protect, async (req, res) => {
  try {
    const apiKeys = await ApiKey.find({ userId: req.user._id })
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
    const { key, secret } = ApiKey.generateKey();

    // Create API key
    const apiKey = await ApiKey.create({
      userId: req.user._id,
      name,
      key,
      secret, // Will be hashed by pre-save hook
      environment: environment || 'sandbox',
      webhookUrl,
      metadata
    });

    // Return key and secret (only time secret is shown)
    res.status(201).json({
      success: true,
      message: 'API key created successfully. Store the secret securely - it won\'t be shown again!',
      data: {
        id: apiKey._id,
        name: apiKey.name,
        key: apiKey.key,
        secret: secret, // Only shown once!
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
    const apiKey = await ApiKey.findOne({
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
