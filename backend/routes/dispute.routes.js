const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Placeholder routes
router.post('/create', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Create dispute endpoint' });
});

router.get('/:escrowId', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Get dispute endpoint' });
});

router.post('/:disputeId/respond', protect, (req, res) => {
  res.status(200).json({ success: true, message: 'Respond to dispute endpoint' });
});

module.exports = router;
