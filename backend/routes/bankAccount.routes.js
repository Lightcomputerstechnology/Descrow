// backend/routes/bankAccount.routes.js - NEW ROUTES

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const bankAccountController = require('../controllers/bankAccount.controller');

// Get list of banks
router.get('/banks', authMiddleware, bankAccountController.getBanks);

// Add bank account
router.post('/add', authMiddleware, bankAccountController.addBankAccount);

// Get user's bank accounts
router.get('/list', authMiddleware, bankAccountController.getBankAccounts);

// Set primary account
router.put('/primary/:accountId', authMiddleware, bankAccountController.setPrimaryAccount);

// Delete bank account
router.delete('/:accountId', authMiddleware, bankAccountController.deleteBankAccount);

// Initiate payout
router.post('/payout', authMiddleware, bankAccountController.initiatePayout);

module.exports = router;
