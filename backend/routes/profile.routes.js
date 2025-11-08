const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const profileController = require('../controllers/profile.controller');

// All routes require authentication
router.use(authenticate);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.post('/avatar', profileController.uploadAvatar);

// KYC
router.post('/kyc', profileController.submitKYC);
router.get('/kyc/status', profileController.getKYCStatus);

// Security
router.post('/change-password', profileController.changePassword);
router.post('/delete-account', profileController.deleteAccount);

module.exports = router;
