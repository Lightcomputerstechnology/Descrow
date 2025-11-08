const { body } = require('express-validator');

exports.createEscrowValidator = [
  body('itemName').trim().notEmpty().withMessage('Item name is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Valid amount is required'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'NGN', 'CNY', 'JPY', 'AUD', 'CAD', 'INR', 'ZAR'])
    .withMessage('Invalid currency'),
  body('paymentMethod')
    .isIn(['flutterwave', 'paystack', 'nowpayments', 'bank_transfer'])
    .withMessage('Valid payment method is required'),
  body('location').trim().notEmpty().withMessage('Location is required'),
  body('itemCondition').trim().notEmpty().withMessage('Item condition is required'),
];
