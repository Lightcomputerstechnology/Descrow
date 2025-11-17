// backend/controllers/bankAccount.controller.js - BANK VERIFICATION

const BankAccount = require('../models/BankAccount.model');
const User = require('../models/User.model');
const axios = require('axios');

// Nigerian banks list (Paystack bank codes)
const NIGERIAN_BANKS = [
  { name: 'Access Bank', code: '044' },
  { name: 'Citibank', code: '023' },
  { name: 'Diamond Bank', code: '063' },
  { name: 'Ecobank Nigeria', code: '050' },
  { name: 'Fidelity Bank Nigeria', code: '070' },
  { name: 'First Bank of Nigeria', code: '011' },
  { name: 'First City Monument Bank', code: '214' },
  { name: 'Guaranty Trust Bank', code: '058' },
  { name: 'Heritage Bank Plc', code: '030' },
  { name: 'Jaiz Bank', code: '301' },
  { name: 'Keystone Bank Limited', code: '082' },
  { name: 'Providus Bank Plc', code: '101' },
  { name: 'Polaris Bank', code: '076' },
  { name: 'Stanbic IBTC Bank Nigeria Limited', code: '221' },
  { name: 'Standard Chartered Bank', code: '068' },
  { name: 'Sterling Bank', code: '232' },
  { name: 'Suntrust Bank Nigeria Limited', code: '100' },
  { name: 'Union Bank of Nigeria', code: '032' },
  { name: 'United Bank for Africa', code: '033' },
  { name: 'Unity Bank Plc', code: '215' },
  { name: 'Wema Bank', code: '035' },
  { name: 'Zenith Bank', code: '057' }
];

// Get list of banks
exports.getBanks = async (req, res) => {
  try {
    const { currency } = req.query;

    if (currency === 'NGN') {
      return res.status(200).json({
        success: true,
        data: { banks: NIGERIAN_BANKS }
      });
    }

    // For other currencies, return empty (to be implemented)
    res.status(200).json({
      success: true,
      data: { banks: [] },
      message: 'Bank verification only available for NGN currently'
    });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch banks' });
  }
};

// Verify bank account using Paystack
async function verifyBankAccountPaystack(accountNumber, bankCode) {
  try {
    const response = await axios.get(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    if (response.data.status) {
      return {
        success: true,
        accountName: response.data.data.account_name,
        accountNumber: response.data.data.account_number
      };
    }

    return { success: false, message: 'Account verification failed' };
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Verification failed'
    };
  }
}

// Add bank account
exports.addBankAccount = async (req, res) => {
  try {
    const { accountNumber, bankCode, bankName, currency } = req.body;

    if (!accountNumber || !bankCode || !bankName) {
      return res.status(400).json({
        success: false,
        message: 'Account number, bank code, and bank name are required'
      });
    }

    // Verify account if NGN
    let accountName = null;
    let isVerified = false;

    if (currency === 'NGN') {
      const verification = await verifyBankAccountPaystack(accountNumber, bankCode);
      
      if (!verification.success) {
        return res.status(400).json({
          success: false,
          message: verification.message || 'Could not verify bank account'
        });
      }

      accountName = verification.accountName;
      isVerified = true;
    } else {
      // For non-NGN, require manual account name input
      accountName = req.body.accountName;
      if (!accountName) {
        return res.status(400).json({
          success: false,
          message: 'Account name is required for non-NGN accounts'
        });
      }
    }

    // Check if account already exists
    const existingAccount = await BankAccount.findOne({
      user: req.user._id,
      accountNumber,
      bankCode
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'This bank account is already linked to your account'
      });
    }

    // Check if user has any accounts
    const userAccountsCount = await BankAccount.countDocuments({ user: req.user._id });
    const isPrimary = userAccountsCount === 0; // First account is primary

    // Create bank account
    const bankAccount = new BankAccount({
      user: req.user._id,
      accountName,
      accountNumber,
      bankName,
      bankCode,
      currency: currency || 'NGN',
      isVerified,
      isPrimary,
      verificationData: isVerified ? {
        verifiedAt: new Date(),
        verificationMethod: 'paystack',
        verificationResponse: { accountName }
      } : null
    });

    await bankAccount.save();

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      hasBankAccount: true
    });

    res.status(201).json({
      success: true,
      message: 'Bank account added successfully',
      data: { bankAccount }
    });
  } catch (error) {
    console.error('Add bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add bank account'
    });
  }
};

// Get user's bank accounts
exports.getBankAccounts = async (req, res) => {
  try {
    const accounts = await BankAccount.find({ user: req.user._id })
      .sort({ isPrimary: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { accounts }
    });
  } catch (error) {
    console.error('Get bank accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank accounts'
    });
  }
};

// Set primary account
exports.setPrimaryAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await BankAccount.findOne({
      _id: accountId,
      user: req.user._id
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    // Set as primary (pre-save hook handles removing primary from others)
    account.isPrimary = true;
    await account.save();

    res.status(200).json({
      success: true,
      message: 'Primary account updated',
      data: { account }
    });
  } catch (error) {
    console.error('Set primary account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to set primary account'
    });
  }
};

// Delete bank account
exports.deleteBankAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await BankAccount.findOne({
      _id: accountId,
      user: req.user._id
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Bank account not found'
      });
    }

    await account.deleteOne();

    // If deleted account was primary, set another as primary
    if (account.isPrimary) {
      const nextAccount = await BankAccount.findOne({ user: req.user._id });
      if (nextAccount) {
        nextAccount.isPrimary = true;
        await nextAccount.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Bank account deleted successfully'
    });
  } catch (error) {
    console.error('Delete bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete bank account'
    });
  }
};

// Initiate payout (for completed escrows)
exports.initiatePayout = async (req, res) => {
  try {
    const { escrowId, accountId } = req.body;

    const escrow = await Escrow.findOne({ escrowId });
    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow not found' });
    }

    // Verify seller
    if (escrow.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only seller can request payout' });
    }

    // Check escrow is completed
    if (escrow.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payout only available for completed escrows'
      });
    }

    // Check if already paid out
    if (escrow.payout?.paidOut) {
      return res.status(400).json({
        success: false,
        message: 'Payout already processed'
      });
    }

    // Get bank account
    let bankAccount;
    if (accountId) {
      bankAccount = await BankAccount.findOne({
        _id: accountId,
        user: req.user._id
      });
    } else {
      // Use primary account
      bankAccount = await BankAccount.findOne({
        user: req.user._id,
        isPrimary: true
      });
    }

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: 'No bank account found. Please add a bank account first.',
        action: 'add_bank_account'
      });
    }

    if (!bankAccount.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Bank account not verified. Please verify your account first.'
      });
    }

    // Initiate payout via Paystack Transfer
    const transferData = await initiatePaystackTransfer(
      bankAccount,
      escrow.payment.sellerReceives,
      escrow.escrowId
    );

    if (!transferData.success) {
      return res.status(400).json({
        success: false,
        message: transferData.message || 'Payout failed'
      });
    }

    // Update escrow payout info
    escrow.payout = {
      accountId: bankAccount._id,
      accountNumber: bankAccount.accountNumber,
      bankName: bankAccount.bankName,
      amount: escrow.payment.sellerReceives,
      transferCode: transferData.transfer_code,
      paidOut: true,
      paidOutAt: new Date()
    };

    await escrow.save();

    res.status(200).json({
      success: true,
      message: 'Payout initiated successfully',
      data: {
        transferCode: transferData.transfer_code,
        amount: escrow.payment.sellerReceives,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName
      }
    });
  } catch (error) {
    console.error('Initiate payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payout'
    });
  }
};

// Helper: Initiate Paystack transfer
async function initiatePaystackTransfer(bankAccount, amount, reference) {
  try {
    // Create transfer recipient first
    const recipientResponse = await axios.post(
      'https://api.paystack.co/transferrecipient',
      {
        type: 'nuban',
        name: bankAccount.accountName,
        account_number: bankAccount.accountNumber,
        bank_code: bankAccount.bankCode,
        currency: 'NGN'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!recipientResponse.data.status) {
      throw new Error('Failed to create transfer recipient');
    }

    const recipientCode = recipientResponse.data.data.recipient_code;

    // Initiate transfer
    const transferResponse = await axios.post(
      'https://api.paystack.co/transfer',
      {
        source: 'balance',
        amount: amount * 100, // Convert to kobo
        recipient: recipientCode,
        reason: `Payout for escrow ${reference}`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!transferResponse.data.status) {
      throw new Error('Transfer initiation failed');
    }

    return {
      success: true,
      transfer_code: transferResponse.data.data.transfer_code,
      reference: transferResponse.data.data.reference
    };
  } catch (error) {
    console.error('Paystack transfer error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Transfer failed'
    };
  }
}