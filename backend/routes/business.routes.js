// backend/routes/business.routes.js - NEW ROUTES

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const businessController = require('../controllers/business.controller');

// Register business
router.post('/register', authMiddleware, businessController.registerBusiness);

// Upload documents
router.post('/:businessId/documents', authMiddleware, businessController.uploadDocuments);

// Get business details
router.get('/details', authMiddleware, businessController.getBusinessDetails);

// Generate API keys (admin only - add admin middleware)
router.post('/:businessId/api-keys', authMiddleware, businessController.generateApiKeys);

module.exports = router;
