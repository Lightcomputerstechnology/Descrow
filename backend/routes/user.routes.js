const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');
const { uploadMultiple } = require('../middleware/upload.middleware');
const { body } = require('express-validator');

/**
 * Safe wrapper for controller methods
 * Logs a warning if the controller method is missing
 */
const safe = (fn, routeName) => {
  if (typeof fn !== 'function') {
    console.warn(`Warning: Controller function for route "${routeName}" is undefined!`);
    return (req, res) => res.status(500).json({
      success: false,
      message: `Handler for route "${routeName}" is missing`
    });
  }
  return fn;
};

// Profile
router.get('/profile', protect, safe(userController.getProfile, 'getProfile'));
router.put('/profile', protect, safe(userController.updateProfile, 'updateProfile'));
router.put('/change-password', protect, safe(userController.changePassword, 'changePassword'));

// KYC
router.post(
  '/upload-kyc',
  protect,
  uploadMultiple('documents', 5),
  (req, res) => {
    req.body.documentUrls = req.fileUrls || [];
    safe(userController.uploadKYC, 'uploadKYC')(req, res);
  }
);

// Tier Management
router.post(
  '/upgrade-tier',
  protect,
  [
    body('tier').isIn(['basic', 'pro', 'enterprise']).withMessage('Invalid tier'),
    body('paymentReference').notEmpty().withMessage('Payment reference required')
  ],
  safe(userController.upgradeTier, 'upgradeTier')
);

// Statistics
router.get('/statistics', protect, safe(userController.getUserStatistics, 'getUserStatistics'));

// 2FA
router.post('/2fa/enable', protect, safe(userController.enable2FA, 'enable2FA'));
router.post('/2fa/verify', protect, safe(userController.verify2FA, 'verify2FA'));
router.post('/2fa/disable', protect, safe(userController.disable2FA, 'disable2FA'));

module.exports = router;