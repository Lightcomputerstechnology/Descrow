const express = require('express');
const router = express.Router();
const { protectAdmin } = require('../middleware/admin.middleware');
const platformSettingsController = require('../controllers/platformSettings.controller');

// Public endpoint for fee calculation
router.get('/calculate-fee', platformSettingsController.calculateTestFee);

// Get settings (public)
router.get('/settings', platformSettingsController.getSettings);

// Admin only routes
router.put(
  '/fees',
  adminAuth,
  checkPermission('manageFees'),
  platformSettingsController.updateFeeSettings
);

router.post(
  '/fees/preview',
  adminAuth,
  checkPermission('manageFees'),
  platformSettingsController.previewFeeImpact
);

router.get(
  '/fees/history',
  adminAuth,
  checkPermission('manageFees'),
  platformSettingsController.getFeeHistory
);

router.put(
  '/maintenance',
  adminAuth,
  checkPermission('manageSettings'),
  platformSettingsController.toggleMaintenance
);

module.exports = router;
