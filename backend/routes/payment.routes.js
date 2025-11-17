// backend/routes/payment.routes.js - WITH VERIFICATION MIDDLEWARE
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import middleware
const { authenticate } = require('../middleware/auth.middleware');
const verificationMiddleware = require('../middleware/verification.middleware');

const paymentController = require('../controllers/payment.controller');

// Initialize payment (requires verification)
router.post(
  '/initialize',
  authenticate,
  verificationMiddleware,  // ✅ ADDED: Check verification before payment
  [
    body('escrowId').notEmpty().withMessage('Escrow ID is required'),
    body('paymentMethod').isIn(['paystack', 'flutterwave', 'crypto']).withMessage('Invalid payment method')
  ],
  paymentController.initializePayment
);

// Verify payment
router.post(
  '/verify',
  authenticate,
  [
    body('reference').notEmpty().withMessage('Payment reference is required')
  ],
  paymentController.verifyPayment
);

// Webhooks (no auth needed)
router.post('/webhook/paystack', express.json(), paymentController.paystackWebhook);
router.post('/webhook/flutterwave', express.json(), paymentController.flutterwaveWebhook);
router.post('/webhook/nowpayments', express.json(), paymentController.nowpaymentsWebhook);
router.post('/webhook', express.json(), paymentController.paymentWebhook);

module.exports = router;