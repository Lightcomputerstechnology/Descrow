// backend/routes/payment.routes.js - DEBUG VERSION
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import middleware
const { authenticateUser } = require('../middleware/auth.middleware');

// ✅ DEBUG: Check what we're getting
console.log('🔍 Loading payment.routes.js...');
const paymentController = require('../controllers/payment.controller');
console.log('📦 paymentController loaded in routes:', typeof paymentController);
console.log('📦 paymentController keys:', Object.keys(paymentController || {}));
console.log('📦 initializePayment type:', typeof paymentController?.initializePayment);
console.log('📦 initializePayment value:', paymentController?.initializePayment);

// Initialize payment
router.post(
  '/initialize',
  authenticateUser,
  [
    body('escrowId').notEmpty().withMessage('Escrow ID is required'),
    body('paymentMethod').isIn(['paystack', 'flutterwave', 'crypto']).withMessage('Invalid payment method')
  ],
  paymentController.initializePayment  // ← Line 15 - This is where it fails
);

// Verify payment
router.post(
  '/verify',
  authenticateUser,
  [
    body('reference').notEmpty().withMessage('Payment reference is required')
  ],
  paymentController.verifyPayment
);

// Webhooks
router.post('/webhook/paystack', express.json(), paymentController.paystackWebhook);
router.post('/webhook/flutterwave', express.json(), paymentController.flutterwaveWebhook);
router.post('/webhook/nowpayments', express.json(), paymentController.nowpaymentsWebhook);
router.post('/webhook', express.json(), paymentController.paymentWebhook);

module.exports = router;