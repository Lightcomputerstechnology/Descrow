// backend/routes/payment.routes.js - FIXED
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import middleware - use 'authenticate' not 'authenticateUser'
const { authenticate } = require('../middleware/auth.middleware');

const paymentController = require('../controllers/payment.controller');

// Initialize payment
router.post(
  '/initialize',
  authenticate,
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