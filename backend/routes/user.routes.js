const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Placeholder routes - will implement controller next
router.get('/profile', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'User routes working' });
});

router.put('/profile', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Update profile endpoint' });
});

router.post('/upgrade-tier', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Upgrade tier endpoint' });
});

router.post('/upload-kyc', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'KYC upload endpoint' });
});

module.exports = router;
