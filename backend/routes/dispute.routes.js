const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const disputeController = require('../controllers/dispute.controller');
const { uploadMultiple } = require('../middleware/upload.middleware');
const { body } = require('express-validator');

// Create dispute
router.post(
  '/create',
  protect,
  uploadMultiple('evidence', 5),
  [
    body('escrowId').notEmpty().withMessage('Escrow ID required'),
    body('reason').notEmpty().withMessage('Reason required'),
    body('description').notEmpty().withMessage('Description required')
  ],
  (req, res) => {​​​​​​​​​​​​​​​​req.body.evidence = req.fileUrls || [];
    disputeController.createDispute(req, res);
  }
);

// Get dispute by escrow ID
router.get('/:escrowId', protect, disputeController.getDispute);

// Respond to dispute
router.post(
  '/:disputeId/respond',
  protect,
  uploadMultiple('evidence', 5),
  (req, res) => {
    req.body.evidence = req.fileUrls || [];
    disputeController.respondToDispute(req, res);
  }
);

// Get user disputes
router.get('/user/all', protect, disputeController.getUserDisputes);

module.exports = router;