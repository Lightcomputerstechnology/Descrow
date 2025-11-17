// backend/routes/business.routes.js - NEW ROUTES

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const businessController = require('../controllers/business.controller');

// Register business
router.post('/register', authenticate, businessController.registerBusiness);

// Upload documents
router.post('/:businessId/documents', authenticate, businessController.uploadDocuments);

// Get business details
router.get('/details', authenticate, businessController.getBusinessDetails);

// Generate API keys (admin only - add admin middleware)
router.post('/:businessId/api-keys', authenticate, businessController.generateApiKeys);

module.exports = router;