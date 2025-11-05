const { body, param, query } = require('express-validator');

// Auth validations
exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
];

exports.loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
];

// Escrow validations
exports.createEscrowValidation = [
  body('sellerEmail').isEmail().normalizeEmail().withMessage('Valid seller email required'),
  body('itemName').trim().notEmpty().withMessage('Item name required'),
  body('itemDescription').optional().trim(),
  body('location').optional().trim().notEmpty().withMessage('Location cannot be empty'),
  body('condition').optional().trim().notEmpty().withMessage('Condition cannot be empty'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isIn(['USD', 'EUR', 'GBP', 'NGN']).withMessage('Invalid currency'),
  body('paymentMethod').isIn(['paystack', 'flutterwave', 'crypto']).withMessage('Invalid payment method')
];

// Payment validations
exports.initializePaymentValidation = [
  body('escrowId').notEmpty().withMessage('Escrow ID required'),
  body('paymentMethod').isIn(['paystack', 'flutterwave', 'crypto']).withMessage('Invalid payment method')
];

// Dispute validations
exports.createDisputeValidation = [
  body('escrowId').notEmpty().withMessage('Escrow ID required'),
  body('reason').trim().notEmpty().withMessage('Reason required'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters')
];

// Chat validations
exports.sendMessageValidation = [
  body('escrowId').notEmpty().withMessage('Escrow ID required'),
  body('message').trim().notEmpty().withMessage('Message required')
];

// User validations
exports.updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number')
];

exports.changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
];

// Admin validations
exports.createSubAdminValidation = [
  body('name').trim().notEmpty().withMessage('Name required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('permissions').isObject().withMessage('Permissions object required')
];