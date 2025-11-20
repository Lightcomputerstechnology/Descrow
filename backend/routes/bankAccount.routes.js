// backend/routes/bankAccount.routes.js - ENHANCED MULTI-CURRENCY ROUTES

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');
const bankAccountController = require('../controllers/bankAccount.controller');

// Validation middleware
const validateAddBankAccount = [
  body('accountNumber')
    .notEmpty()
    .withMessage('Account number is required')
    .isLength({ min: 5, max: 20 })
    .withMessage('Account number must be between 5-20 characters'),
  
  body('bankCode')
    .notEmpty()
    .withMessage('Bank code is required'),
  
  body('bankName')
    .notEmpty()
    .withMessage('Bank name is required'),
  
  body('currency')
    .isIn(['NGN', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'KES', 'GHS', 'ZAR'])
    .withMessage('Invalid currency'),
  
  body('accountType')
    .optional()
    .isIn(['personal', 'business'])
    .withMessage('Invalid account type'),
  
  body('swiftCode')
    .optional()
    .isLength({ min: 8, max: 11 })
    .withMessage('SWIFT code must be 8-11 characters'),
  
  body('accountName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Account name must be between 2-100 characters')
];

const validatePayout = [
  body('escrowId')
    .notEmpty()
    .withMessage('Escrow ID is required')
    .isMongoId()
    .withMessage('Invalid Escrow ID'),
  
  body('accountId')
    .optional()
    .isMongoId()
    .withMessage('Invalid Account ID'),
  
  body('currency')
    .optional()
    .isIn(['NGN', 'USD', 'EUR', 'GBP'])
    .withMessage('Invalid currency')
];

// ==================== BANK MANAGEMENT ROUTES ====================

// Get list of banks with filtering
router.get('/banks', 
  authenticate,
  [
    query('currency')
      .optional()
      .isIn(['NGN', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'KES', 'GHS', 'ZAR'])
      .withMessage('Invalid currency'),
    
    query('country')
      .optional()
      .isLength({ min: 2, max: 2 })
      .withMessage('Country code must be 2 characters')
  ],
  bankAccountController.getBanks
);

// Get available payout methods for user
router.get('/payout-methods', 
  authenticate, 
  bankAccountController.getPayoutMethods
);

// Add bank account with validation
router.post('/add', 
  authenticate, 
  validateAddBankAccount,
  bankAccountController.addBankAccount
);

// Get user's bank accounts with filtering
router.get('/list', 
  authenticate,
  [
    query('currency')
      .optional()
      .isIn(['NGN', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'KES', 'GHS', 'ZAR'])
      .withMessage('Invalid currency'),
    
    query('verified')
      .optional()
      .isBoolean()
      .withMessage('Verified must be boolean'),
    
    query('primary')
      .optional()
      .isBoolean()
      .withMessage('Primary must be boolean')
  ],
  bankAccountController.getBankAccounts
);

// Get specific bank account details
router.get('/:accountId', 
  authenticate,
  [
    param('accountId')
      .isMongoId()
      .withMessage('Invalid account ID')
  ],
  bankAccountController.getBankAccount
);

// Set primary account
router.put('/primary/:accountId', 
  authenticate,
  [
    param('accountId')
      .isMongoId()
      .withMessage('Invalid account ID')
  ],
  bankAccountController.setPrimaryAccount
);

// Update bank account details
router.put('/:accountId', 
  authenticate,
  [
    param('accountId')
      .isMongoId()
      .withMessage('Invalid account ID'),
    
    body('accountName')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Account name must be between 2-100 characters'),
    
    body('accountType')
      .optional()
      .isIn(['personal', 'business'])
      .withMessage('Invalid account type')
  ],
  bankAccountController.updateBankAccount
);

// Verify bank account
router.post('/:accountId/verify', 
  authenticate,
  [
    param('accountId')
      .isMongoId()
      .withMessage('Invalid account ID')
  ],
  bankAccountController.verifyBankAccount
);

// Delete bank account
router.delete('/:accountId', 
  authenticate,
  [
    param('accountId')
      .isMongoId()
      .withMessage('Invalid account ID')
  ],
  bankAccountController.deleteBankAccount
);

// ==================== PAYOUT ROUTES ====================

// Initiate payout with validation
router.post('/payout', 
  authenticate, 
  validatePayout,
  bankAccountController.initiatePayout
);

// Get payout history
router.get('/payouts/history', 
  authenticate,
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1-50'),
    
    query('currency')
      .optional()
      .isIn(['NGN', 'USD', 'EUR', 'GBP'])
      .withMessage('Invalid currency'),
    
    query('status')
      .optional()
      .isIn(['pending', 'successful', 'failed'])
      .withMessage('Invalid status')
  ],
  bankAccountController.getPayoutHistory
);

// Get specific payout details
router.get('/payouts/:payoutId', 
  authenticate,
  [
    param('payoutId')
      .isMongoId()
      .withMessage('Invalid payout ID')
  ],
  bankAccountController.getPayoutDetails
);

// Cancel pending payout
router.post('/payouts/:payoutId/cancel', 
  authenticate,
  [
    param('payoutId')
      .isMongoId()
      .withMessage('Invalid payout ID')
  ],
  bankAccountController.cancelPayout
);

// ==================== ADMIN ROUTES ====================

// Admin: Get all bank accounts (with filtering)
router.get('/admin/accounts', 
  authenticate,
  [
    query('userId')
      .optional()
      .isMongoId()
      .withMessage('Invalid user ID'),
    
    query('currency')
      .optional()
      .isIn(['NGN', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'KES', 'GHS', 'ZAR'])
      .withMessage('Invalid currency'),
    
    query('status')
      .optional()
      .isIn(['active', 'pending_verification', 'suspended'])
      .withMessage('Invalid status'),
    
    query('verified')
      .optional()
      .isBoolean()
      .withMessage('Verified must be boolean'),
    
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1-100')
  ],
  bankAccountController.adminGetBankAccounts
);

// Admin: Verify bank account manually
router.post('/admin/:accountId/verify', 
  authenticate,
  [
    param('accountId')
      .isMongoId()
      .withMessage('Invalid account ID'),
    
    body('verified')
      .isBoolean()
      .withMessage('Verified must be boolean'),
    
    body('notes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notes must be less than 500 characters')
  ],
  bankAccountController.adminVerifyBankAccount
);

// Admin: Suspend/activate bank account
router.put('/admin/:accountId/status', 
  authenticate,
  [
    param('accountId')
      .isMongoId()
      .withMessage('Invalid account ID'),
    
    body('status')
      .isIn(['active', 'suspended'])
      .withMessage('Status must be active or suspended'),
    
    body('reason')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Reason must be less than 500 characters')
  ],
  bankAccountController.adminUpdateAccountStatus
);

// ==================== WEBHOOK ROUTES ====================

// Paystack webhook for transfer updates
router.post('/webhook/paystack', 
  express.raw({ type: 'application/json' }),
  bankAccountController.paystackWebhook
);

// Flutterwave webhook for transfer updates
router.post('/webhook/flutterwave', 
  express.raw({ type: 'application/json' }),
  bankAccountController.flutterwaveWebhook
);

// ==================== UTILITY ROUTES ====================

// Get bank account statistics
router.get('/stats/summary', 
  authenticate, 
  bankAccountController.getAccountStats
);

// Validate bank account (without saving)
router.post('/validate', 
  authenticate,
  [
    body('accountNumber')
      .notEmpty()
      .withMessage('Account number is required'),
    
    body('bankCode')
      .notEmpty()
      .withMessage('Bank code is required'),
    
    body('currency')
      .isIn(['NGN', 'USD', 'EUR', 'GBP'])
      .withMessage('Invalid currency')
  ],
  bankAccountController.validateBankAccount
);

// Get supported currencies
router.get('/currencies/supported', 
  authenticate, 
  bankAccountController.getSupportedCurrencies
);

// Get account limits
router.get('/limits', 
  authenticate, 
  bankAccountController.getAccountLimits
);

module.exports = router;