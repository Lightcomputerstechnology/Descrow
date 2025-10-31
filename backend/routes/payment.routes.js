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

// Webhooks
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.paymentWebhook);
router.post('/nowpayments/webhook', express.json(), paymentController.nowpaymentsWebhook);

module.exports = router;