// backend/routes/payment.routes.js - PRODUCTION READY
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { authenticateUser } = require('../middleware/auth.middleware');
const { body } = require('express-validator');

// ==================== USER ROUTES (Protected) ====================

// Initialize payment
router.post(
  '/initialize',
  authenticateUser,
  [
    body('escrowId').notEmpty().withMessage('Escrow ID is required'),
    body('paymentMethod')
      .isIn(['paystack', 'flutterwave', 'crypto'])
      .withMessage('Invalid payment method')
  ],
  paymentController.initializePayment
);

// Verify payment (called from frontend after redirect)
router.post(
  '/verify',
  authenticateUser,
  [
    body('reference').notEmpty().withMessage('Payment reference is required')
  ],
  paymentController.verifyPayment
);

// ==================== WEBHOOK ROUTES (Public - No Auth) ====================

// Generic webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.paymentWebhook);

// Specific webhook endpoints
router.post('/webhook/paystack', express.raw({ type: 'application/json' }), paymentController.paystackWebhook);
router.post('/webhook/flutterwave', express.raw({ type: 'application/json' }), paymentController.flutterwaveWebhook);
router.post('/webhook/nowpayments', express.raw({ type: 'application/json' }), paymentController.nowpaymentsWebhook);

module.exports = router;