const express = require('express');
const router = express.Router();
const { authenticate, protect } = require('../middleware/auth.middleware');
const apiKeyController = require('../controllers/apiKey.controller');
const APIKey = require('../models/APIKey.model');
const { body } = require('express-validator');

// Protect all routes - use authenticate as primary
router.use(authenticate);

// ===== User-based API Key Management (stored in User model) =====

// Generate API keys (first time)
router.post('/generate', apiKeyController.generateApiKeys);

// Regenerate API keys
router.post(
  '/regenerate',
  [
    body('confirmPassword').notEmpty().withMessage('Password confirmation required')
  ],
  apiKeyController.regenerateApiKeys
);

// Get API usage statistics
router.get('/usage', apiKeyController.getApiUsage);

// Revoke API access
router.post(
  '/revoke',
  [
    body('confirmPassword').notEmpty().withMessage('Password confirmation required')
  ],
  apiKeyController.revokeApiAccess
);

// ===== APIKey Model Management (multiple keys per user) =====

// Get all API keys for user
router.get('/list', async (req, res) => {
  try {
    const apiKeys = await APIKey.find({ userId: req.user._id })
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
router.post('/create', async (req, res) => {
  try {
    const { name, environment, webhookUrl, metadata } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'API key name is required'
      });
    }

    // Generate key and secret
    const { key, secret } = APIKey.generateKey();

    // Create API key
    const apiKey = await APIKey.create({
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
router.delete('/:id', async (req, res) => {
  try {
    const apiKey = await APIKey.findOne({
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

// ===== Controller-based routes (using apiKey.controller.js) =====

// Generate API Key (controller version)
router.post('/key/generate', apiKeyController.generateAPIKey);

// List API Keys (controller version)
router.get('/keys', apiKeyController.listAPIKeys);

// Revoke specific API Key (controller version)
router.delete('/key/:keyId', apiKeyController.revokeAPIKey);

module.exports = router;