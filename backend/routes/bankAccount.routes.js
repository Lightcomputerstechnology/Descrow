// backend/routes/bankAccount.routes.js - NEW ROUTES

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const bankAccountController = require('../controllers/bankAccount.controller');

// Get list of banks
router.get('/banks', authenticate, bankAccountController.getBanks);

// Add bank account
router.post('/add', authenticate, bankAccountController.addBankAccount);

// Get user's bank accounts
router.get('/list', authenticate, bankAccountController.getBankAccounts);

// Set primary account
router.put('/primary/:accountId', authenticate, bankAccountController.setPrimaryAccount);

// Delete bank account
router.delete('/:accountId', authenticate, bankAccountController.deleteBankAccount);

// Initiate payout
router.post('/payout', authenticate, bankAccountController.initiatePayout);

module.exports = router;