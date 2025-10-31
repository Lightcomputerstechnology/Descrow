const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const userController = require('../controllers/user.controller');
const { uploadMultiple } = require('../middleware/upload.middleware');
const { body } = require('express-validator');

// Profile
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, userController.updateProfile);
router.put('/change-password', protect, userController.changePassword);

// KYC
router.post('/upload-kyc', protect, uploadMultiple('documents', 5), (req, res) => {
  req.body.documentUrls = req.fileUrls || [];
  userController.uploadKYC(req, res);
});

// Tier Management
router.post(
  '/upgrade-tier',
  protect,
  [
    body('tier').isIn(['basic', 'pro', 'enterprise']).withMessage('Invalid tier'),
    body('paymentReference').notEmpty().withMessage('Payment reference required')
  ],
  userController.upgradeTier
);

// Statistics
router.get('/statistics', protect, userController.getUserStatistics);

// 2FA
router.post('/2fa/enable', protect, userController.enable2FA);
router.post('/2fa/verify', protect, userController.verify2FA);
router.post('/2fa/disable', protect, userController.disable2FA);

module.exports = router;