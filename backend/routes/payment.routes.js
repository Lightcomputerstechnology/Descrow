const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');
const { body } = require('express-validator');

// Initialize payment
router.post(
  '/initialize',
  protect,
  [
    body('escrowId').notEmpty().withMessage('Escrow ID is required'),
    body('paymentMethod').isIn(['paystack', 'flutterwave', 'crypto']).withMessage('Invalid payment method')
  ],
  paymentController.initializePayment
);

// Verify payment (Paystack/Flutterwave only)
router.post(
  '/verify',
  protect,
  [
    body('reference').notEmpty().withMessage('Payment reference is required'),
    body('paymentMethod').notEmpty().withMessage('Payment method is required')
  ],
  paymentController.verifyPayment
);

// Upload crypto payment proof
router.post(
  '/crypto/upload-proof',
  protect,
  [
    body('escrowId').notEmpty().withMessage('Escrow ID is required'),
    body('transactionHash').notEmpty().withMessage('Transaction hash is required')
  ],
  paymentController.uploadCryptoProof
);

// Payment webhook (No authentication - verified by signature)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.paymentWebhook);

// Admin: Confirm crypto payment (Will add admin middleware later)
router.post('/crypto/confirm', protect, paymentController.confirmCryptoPayment);

// Admin: Reject crypto payment
router.post('/crypto/reject', protect, paymentController.rejectCryptoPayment);

module.exports = router;
