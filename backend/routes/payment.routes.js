const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const paymentController = require('../controllers/payment.controller');
const { body } = require('express-validator');

router.post(
  '/initialize',
  protect,
  [
    body('escrowId').notEmpty().withMessage('Escrow ID required'),
    body('paymentMethod').isIn(['paystack', 'flutterwave', 'crypto']).withMessage('Invalid payment method')
  ],
  paymentController.initializePayment
);

router.post(
  '/verify',
  protect,
  [
    body('reference').notEmpty().withMessage('Payment reference required'),
    body('paymentMethod').notEmpty().withMessage('Payment method required')
  ],
  paymentController.verifyPayment
);

// ✅ WEBHOOKS - All automatic, no manual confirmation
router.post('/webhook/paystack', express.raw({ type: 'application/json' }), paymentController.paystackWebhook);
router.post('/webhook/flutterwave', express.json(), paymentController.flutterwaveWebhook);
router.post('/webhook/nowpayments', express.json(), paymentController.nowpaymentsWebhook);

// Generic webhook (auto-detects provider)
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.paymentWebhook);

// Legacy route (kept for backwards compatibility)
router.post('/nowpayments/webhook', express.json(), paymentController.nowpaymentsWebhook);

module.exports = router;