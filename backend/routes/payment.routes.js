// backend/routes/payment.routes.js - CLEAN VERSION
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// ✅ Import middleware first
const { authenticateUser } = require('../middleware/auth.middleware');

// ✅ Import controller AFTER middleware
const paymentController = require('../controllers/payment.controller');

// ==================== USER ROUTES (Protected) ====================

// Initialize payment
router.post(
  '/initialize',
  authenticateUser,
  [
    body('escrowId').notEmpty().withMessage('Escrow ID is required'),
    body('paymentMethod').isIn(['paystack', 'flutterwave', 'crypto']).withMessage('Invalid payment method')
  ],
  paymentController.initializePayment
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

// ==================== WEBHOOK ROUTES (Public - No Auth) ====================

// Specific webhook endpoints
router.post('/webhook/paystack', express.json(), paymentController.paystackWebhook);
router.post('/webhook/flutterwave', express.json(), paymentController.flutterwaveWebhook);
router.post('/webhook/nowpayments', express.json(), paymentController.nowpaymentsWebhook);

// Generic webhook handler (fallback)
router.post('/webhook', express.json(), paymentController.paymentWebhook);

module.exports = router;