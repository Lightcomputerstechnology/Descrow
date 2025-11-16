const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware'); // ✅ Corrected import
const userController = require('../controllers/user.controller');
const { uploadMultiple } = require('../middleware/upload.middleware');
const { body } = require('express-validator');

// ======================================================
// ===================== PROTECTED ======================
// ======================================================

// Protect all routes
router.use(authenticate);

// ======================================================
// ===================== PROFILE ========================
// ======================================================

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.put('/change-password', userController.changePassword);

// ======================================================
// ======================= KYC ==========================
// ======================================================

router.post(
  '/upload-kyc',
  uploadMultiple('documents', 5),
  (req, res) => {
    req.body.documentUrls = req.fileUrls || [];
    userController.uploadKYC(req, res);
  }
);

// ======================================================
// ================== TIER UPGRADE ======================
// ======================================================

router.post(
  '/upgrade-tier',
  [
    body('tier')
      .isIn(['basic', 'pro', 'enterprise'])
      .withMessage('Invalid tier'),
    body('paymentReference')
      .notEmpty()
      .withMessage('Payment reference required')
  ],
  userController.upgradeTier
);

// ======================================================
// ==================== STATISTICS ======================
// ======================================================

router.get('/statistics', userController.getUserStatistics);

// ======================================================
// ======================== 2FA ==========================
// ======================================================

router.post('/2fa/enable', userController.enable2FA);
router.post('/2fa/verify', userController.verify2FA);
router.post('/2fa/disable', userController.disable2FA);

module.exports = router;