const express = require('express');
const router = express.Router();
const { protectAdmin, checkPermission } = require('../middleware/admin.middleware');
const platformSettingsController = require('../controllers/platformSettings.controller');

// Public endpoint for fee calculation
router.get('/calculate-fee', platformSettingsController.calculateTestFee);

// Get settings (public)
router.get('/settings', platformSettingsController.getSettings);

// Admin only routes
router.put(
  '/fees',
  protectAdmin,
  checkPermission('manageFees'),
  platformSettingsController.updateFeeSettings
);

router.post(
  '/fees/preview',
  protectAdmin,
  checkPermission('manageFees'),
  platformSettingsController.previewFeeImpact
);

router.get(
  '/fees/history',
  protectAdmin,
  checkPermission('manageFees'),
  platformSettingsController.getFeeHistory
);

router.put(
  '/maintenance',
  protectAdmin,
  checkPermission('manageSettings'),
  platformSettingsController.toggleMaintenance
);
