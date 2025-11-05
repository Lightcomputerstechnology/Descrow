const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const escrowController = require('../controllers/escrow.controller');
const { protect, verifyAPIKey } = require('../middleware/auth.middleware');

// Create new escrow (User or API)
router.post('/create',
  [
    body('sellerEmail').isEmail().withMessage('Valid seller email is required'),
    body('itemName').trim().notEmpty().withMessage('Item name is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required'),
    body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'NGN', 'CNY', 'JPY', 'AUD', 'CAD', 'INR', 'ZAR']).withMessage('Invalid currency'),
    body('paymentMethod').isIn(['flutterwave', 'paystack', 'nowpayments', 'bank_transfer']).withMessage('Valid payment method is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('itemCondition').trim().notEmpty().withMessage('Item condition is required')
  ],
  (req, res, next) => {
    // Check if request has API key or user token
    if (req.headers['x-api-key']) {
      return verifyAPIKey(req, res, next);
    } else {
      return protect(req, res, next);
    }
  },
  escrowController.createEscrow
);

// Get all escrows for a user
router.get('/user/:userId', protect, escrowController.getUserEscrows);

// Get single escrow by ID
router.get('/:escrowId', protect, escrowController.getEscrowById);

// Update escrow status
router.patch('/:escrowId/status', protect, escrowController.updateEscrowStatus);

// Release payment (buyer confirms delivery)
router.post('/:escrowId/release', protect, escrowController.releasePayment);

// Cancel escrow
router.post('/:escrowId/cancel', protect, escrowController.cancelEscrow);

// Get escrow statistics
router.get('/stats/user', protect, escrowController.getUserStats);

module.exports = router;