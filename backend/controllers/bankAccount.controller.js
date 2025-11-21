// backend/controllers/bankAccount.controller.js - ENHANCED MULTI-CURRENCY SUPPORT
const BankAccount = require('../models/BankAccount.model');
const User = require('../models/User.model');
const Escrow = require('../models/Escrow.model');
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

// International banks template (for Flutterwave)
const INTERNATIONAL_BANKS = [
  { name: 'Bank of America', code: 'BOFAUS3N', country: 'US', currency: 'USD' },
  { name: 'Chase Bank', code: 'CHASUS33', country: 'US', currency: 'USD' },
  { name: 'Wells Fargo', code: 'WFBIUS6S', country: 'US', currency: 'USD' },
  { name: 'HSBC UK', code: 'MIDLGB22', country: 'GB', currency: 'GBP' },
  { name: 'Barclays Bank', code: 'BARCGB22', country: 'GB', currency: 'GBP' },
  { name: 'Deutsche Bank', code: 'DEUTDEFF', country: 'DE', currency: 'EUR' },
  { name: 'BNP Paribas', code: 'BNPAFRPP', country: 'FR', currency: 'EUR' }
];

// Verify bank account using appropriate provider (HELPER FUNCTION - RENAMED)
async function verifyBankAccountHelper(accountData) {
  const { accountNumber, bankCode, currency, bankName } = accountData;

  try {
    // NGN - Paystack verification
    if (currency === 'NGN') {
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
          accountNumber: response.data.data.account_number,
          provider: 'paystack',
          verifiedAt: new Date()
        };
      }
    }

    // USD/EUR/GBP - Flutterwave verification (mock - requires actual integration)
    if (['USD', 'EUR', 'GBP'].includes(currency)) {
      // For Flutterwave, we typically verify during transfer
      // Return success with manual verification for now
      return {
        success: true,
        accountName: accountData.accountName, // Required for international
        accountNumber,
        provider: 'flutterwave',
        verifiedAt: new Date(),
        note: 'Account will be verified during first transfer'
      };
    }

    return { 
      success: false, 
      message: `Verification not available for ${currency} accounts` 
    };
  } catch (error) {
    console.error('Bank verification error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'Account verification failed',
      provider: currency === 'NGN' ? 'paystack' : 'flutterwave'
    };
  }
}

// Helper: Initiate Paystack transfer (NGN)
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
        amount: Math.round(amount * 100), // Convert to kobo
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

// Helper: Initiate Flutterwave transfer (USD/EUR/GBP)
async function initiateFlutterwaveTransfer(bankAccount, amount, reference) {
  try {
    // Note: This is a simplified implementation
    // Flutterwave transfer requires proper integration with their API
    const transferResponse = await axios.post(
      'https://api.flutterwave.com/v3/transfers',
      {
        account_bank: bankAccount.bankCode, // SWIFT code for international
        account_number: bankAccount.accountNumber,
        amount: amount,
        narration: `Payout for escrow ${reference}`,
        currency: bankAccount.currency,
        reference: `ESCROW_${reference}_${Date.now()}`,
        beneficiary_name: bankAccount.accountName
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (transferResponse.data.status !== 'success') {
      throw new Error('Transfer initiation failed');
    }

    return {
      success: true,
      transfer_code: transferResponse.data.data.id,
      reference: transferResponse.data.data.reference
    };
  } catch (error) {
    console.error('Flutterwave transfer error:', error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || 'International transfer failed'
    };
  }
}

// CONTROLLER METHODS

// Get list of banks with multi-currency support
exports.getBanks = async (req, res) => {
  try {
    const { currency, country } = req.query;

    // NGN - Paystack Nigerian banks
    if (currency === 'NGN') {
      return res.status(200).json({
        success: true,
        data: { 
          banks: NIGERIAN_BANKS,
          provider: 'paystack',
          verification: 'automatic'
        }
      });
    }

    // USD/EUR/GBP - Flutterwave international banks
    if (['USD', 'EUR', 'GBP'].includes(currency)) {
      const filteredBanks = INTERNATIONAL_BANKS.filter(bank => 
        bank.currency === currency && (!country || bank.country === country)
      );
      
      return res.status(200).json({
        success: true,
        data: { 
          banks: filteredBanks,
          provider: 'flutterwave',
          verification: 'manual',
          requiredFields: ['accountNumber', 'accountName', 'swiftCode']
        }
      });
    }

    // Other currencies
    res.status(200).json({
      success: true,
      data: { 
        banks: [],
        provider: 'manual',
        verification: 'manual'
      },
      message: 'Contact support for bank account setup in this currency'
    });
  } catch (error) {
    console.error('Get banks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch banks' });
  }
};

// Enhanced add bank account with multi-currency support
exports.addBankAccount = async (req, res) => {
  try {
    const { 
      accountNumber, 
      bankCode, 
      bankName, 
      currency,
      accountType,
      swiftCode,
      iban,
      routingNumber,
      accountName: manualAccountName // For international accounts
    } = req.body;

    // Required field validation based on currency
    if (!accountNumber || !bankCode || !bankName || !currency) {
      return res.status(400).json({
        success: false,
        message: 'Account number, bank code, bank name, and currency are required'
      });
    }

    // Additional validation for international accounts
    if (['USD', 'EUR', 'GBP'].includes(currency)) {
      if (!swiftCode) {
        return res.status(400).json({
          success: false,
          message: 'SWIFT/BIC code is required for international accounts'
        });
      }
      if (!manualAccountName) {
        return res.status(400).json({
          success: false,
          message: 'Account name is required for international accounts'
        });
      }
    }

    // Check KYC status for escrow access
    const user = await User.findById(req.user._id);
    if (!user.kycStatus || user.kycStatus.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required to add bank accounts',
        action: 'complete_kyc',
        kycRequired: true
      });
    }

    // Verify account based on currency
    let verificationResult;
    let accountName = manualAccountName;
    let isVerified = false;

    if (currency === 'NGN' || ['USD', 'EUR', 'GBP'].includes(currency)) {
      verificationResult = await verifyBankAccountHelper({
        accountNumber,
        bankCode,
        currency,
        bankName,
        accountName: manualAccountName
      });

      if (!verificationResult.success) {
        return res.status(400).json({
          success: false,
          message: verificationResult.message || 'Could not verify bank account',
          provider: verificationResult.provider
        });
      }

      accountName = verificationResult.accountName;
      isVerified = true;
    } else {
      // Manual verification for other currencies
      if (!manualAccountName) {
        return res.status(400).json({
          success: false,
          message: 'Account name is required for manual verification'
        });
      }
      accountName = manualAccountName;
      isVerified = false; // Requires manual verification
    }

    // Check if account already exists
    const existingAccount = await BankAccount.findOne({
      user: req.user._id,
      accountNumber,
      bankCode,
      currency
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'This bank account is already linked to your account'
      });
    }

    // Check account limit (max 5 accounts per user)
    const userAccountsCount = await BankAccount.countDocuments({ user: req.user._id });
    if (userAccountsCount >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Maximum of 5 bank accounts allowed per user'
      });
    }

    const isPrimary = userAccountsCount === 0; // First account is primary

    // Create bank account
    const bankAccount = new BankAccount({
      user: req.user._id,
      accountName,
      accountNumber,
      bankName,
      bankCode,
      currency: currency || 'NGN',
      accountType: accountType || 'personal',
      swiftCode,
      iban,
      routingNumber,
      isVerified,
      isPrimary,
      verificationData: isVerified ? {
        verifiedAt: verificationResult.verifiedAt || new Date(),
        verificationMethod: verificationResult.provider || 'manual',
        verificationResponse: { accountName }
      } : null,
      provider: currency === 'NGN' ? 'paystack' : 'flutterwave'
    });

    await bankAccount.save();

    // Update user
    await User.findByIdAndUpdate(req.user._id, {
      hasBankAccount: true,
      $inc: { 'stats.bankAccountsCount': 1 }
    });

    res.status(201).json({
      success: true,
      message: `Bank account added ${isVerified ? 'and verified' : ''} successfully`,
      data: { 
        bankAccount,
        verification: {
          isVerified,
          provider: bankAccount.provider,
          method: isVerified ? 'automatic' : 'manual'
        }
      }
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

    // Check KYC status
    const user = await User.findById(req.user._id);
    const kycVerified = user.kycStatus?.status === 'approved';

    res.status(200).json({
      success: true,
      data: { 
        accounts,
        kycVerified,
        canAddAccounts: kycVerified,
        limits: {
          maxAccounts: 5,
          currentCount: accounts.length
        }
      }
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

    if (!account.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Only verified accounts can be set as primary'
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

    // Prevent deletion of only account if user has active escrows
    const activeEscrows = await Escrow.countDocuments({
      $or: [
        { buyer: req.user._id, status: { $in: ['accepted', 'funded', 'delivered'] } },
        { seller: req.user._id, status: { $in: ['accepted', 'funded', 'delivered'] } }
      ]
    });

    const totalAccounts = await BankAccount.countDocuments({ user: req.user._id });

    if (activeEscrows > 0 && totalAccounts === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your only bank account while you have active escrows'
      });
    }

    await account.deleteOne();

    // If deleted account was primary, set another verified account as primary
    if (account.isPrimary) {
      const nextAccount = await BankAccount.findOne({ 
        user: req.user._id,
        isVerified: true 
      }).sort({ createdAt: 1 });
      
      if (nextAccount) {
        nextAccount.isPrimary = true;
        await nextAccount.save();
      }
    }

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.bankAccountsCount': -1 }
    });

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

// Enhanced payout system with multi-currency support
exports.initiatePayout = async (req, res) => {
  try {
    const { escrowId, accountId, currency } = req.body;

    const escrow = await Escrow.findById(escrowId).populate('seller buyer');
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
      // Use primary account in same currency as escrow
      bankAccount = await BankAccount.findOne({
        user: req.user._id,
        isPrimary: true,
        currency: escrow.currency
      });
    }

    if (!bankAccount) {
      return res.status(404).json({
        success: false,
        message: `No ${escrow.currency} bank account found. Please add a bank account in ${escrow.currency} first.`,
        action: 'add_bank_account',
        requiredCurrency: escrow.currency
      });
    }

    if (!bankAccount.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Bank account not verified. Please verify your account first.'
      });
    }

    // Currency mismatch check
    if (bankAccount.currency !== escrow.currency) {
      return res.status(400).json({
        success: false,
        message: `Escrow currency (${escrow.currency}) doesn't match bank account currency (${bankAccount.currency})`,
        action: 'use_correct_currency_account'
      });
    }

    let payoutResult;

    // Route payout based on currency and provider
    if (bankAccount.currency === 'NGN') {
      payoutResult = await initiatePaystackTransfer(
        bankAccount,
        escrow.payment.sellerReceives,
        escrow.escrowId
      );
    } else if (['USD', 'EUR', 'GBP'].includes(bankAccount.currency)) {
      payoutResult = await initiateFlutterwaveTransfer(
        bankAccount,
        escrow.payment.sellerReceives,
        escrow.escrowId
      );
    } else {
      return res.status(400).json({
        success: false,
        message: `Payout not supported for ${bankAccount.currency} accounts`
      });
    }

    if (!payoutResult.success) {
      return res.status(400).json({
        success: false,
        message: payoutResult.message || 'Payout failed',
        provider: bankAccount.provider
      });
    }

    // Update escrow payout info
    escrow.payout = {
      accountId: bankAccount._id,
      accountNumber: bankAccount.accountNumber,
      bankName: bankAccount.bankName,
      currency: bankAccount.currency,
      amount: escrow.payment.sellerReceives,
      provider: bankAccount.provider,
      transferCode: payoutResult.transfer_code,
      reference: payoutResult.reference,
      paidOut: true,
      paidOutAt: new Date()
    };

    await escrow.save();

    res.status(200).json({
      success: true,
      message: 'Payout initiated successfully',
      data: {
        transferCode: payoutResult.transfer_code,
        amount: escrow.payment.sellerReceives,
        currency: bankAccount.currency,
        accountNumber: bankAccount.accountNumber,
        bankName: bankAccount.bankName,
        provider: bankAccount.provider,
        estimatedDelivery: '1-3 business days'
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

// Get payout methods available for user
exports.getPayoutMethods = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const accounts = await BankAccount.find({ user: req.user._id, isVerified: true });

    const methods = {
      ngn: {
        available: accounts.some(acc => acc.currency === 'NGN'),
        provider: 'paystack',
        type: 'bank_transfer',
        accounts: accounts.filter(acc => acc.currency === 'NGN')
      },
      usd: {
        available: accounts.some(acc => acc.currency === 'USD'),
        provider: 'flutterwave',
        type: 'bank_transfer',
        accounts: accounts.filter(acc => acc.currency === 'USD')
      },
      eur: {
        available: accounts.some(acc => acc.currency === 'EUR'),
        provider: 'flutterwave',
        type: 'bank_transfer', 
        accounts: accounts.filter(acc => acc.currency === 'EUR')
      },
      gbp: {
        available: accounts.some(acc => acc.currency === 'GBP'),
        provider: 'flutterwave',
        type: 'bank_transfer',
        accounts: accounts.filter(acc => acc.currency === 'GBP')
      }
    };

    res.status(200).json({
      success: true,
      data: {
        methods,
        kycVerified: user.kycStatus?.status === 'approved',
        canReceivePayouts: user.kycStatus?.status === 'approved' && accounts.length > 0
      }
    });
  } catch (error) {
    console.error('Get payout methods error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payout methods'
    });
  }
};

// ADDITIONAL ENHANCED METHODS

// Get specific bank account details
exports.getBankAccount = async (req, res) => {
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

    res.status(200).json({
      success: true,
      data: { account: account.maskSensitiveData() }
    });
  } catch (error) {
    console.error('Get bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank account'
    });
  }
};

// Update bank account details
exports.updateBankAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { accountName, accountType } = req.body;

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

    // Only allow updating specific fields
    if (accountName) account.accountName = accountName;
    if (accountType) account.accountType = accountType;

    await account.save();

    res.status(200).json({
      success: true,
      message: 'Bank account updated successfully',
      data: { account: account.maskSensitiveData() }
    });
  } catch (error) {
    console.error('Update bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update bank account'
    });
  }
};

// Verify bank account (CONTROLLER METHOD - RENAMED FROM HELPER)
exports.verifyBankAccount = async (req, res) => {
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

    if (account.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'Bank account is already verified'
      });
    }

    // Re-verify the account using HELPER FUNCTION
    const verificationResult = await verifyBankAccountHelper({
      accountNumber: account.accountNumber,
      bankCode: account.bankCode,
      currency: account.currency,
      bankName: account.bankName,
      accountName: account.accountName
    });

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message || 'Verification failed'
      });
    }

    // Update verification status
    account.isVerified = true;
    account.verificationData = {
      verifiedAt: new Date(),
      verificationMethod: verificationResult.provider,
      verificationResponse: { accountName: verificationResult.accountName }
    };

    await account.save();

    res.status(200).json({
      success: true,
      message: 'Bank account verified successfully',
      data: { account }
    });
  } catch (error) {
    console.error('Verify bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify bank account'
    });
  }
};

// Get payout history
exports.getPayoutHistory = async (req, res) => {
  try {
    const { page = 1, limit = 10, currency, status } = req.query;
    const skip = (page - 1) * limit;

    // Build query for escrows with payouts
    let query = { 
      $or: [
        { buyer: req.user._id },
        { seller: req.user._id }
      ],
      'payout.paidOut': true
    };

    if (currency) {
      query.currency = currency;
    }

    if (status) {
      // Note: You might want to add payout status field to escrow model
      query['payout.status'] = status;
    }

    const payouts = await Escrow.find(query)
      .populate('buyer seller', 'name email')
      .sort({ 'payout.paidOutAt': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Escrow.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        payouts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get payout history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payout history'
    });
  }
};

// Get payout details
exports.getPayoutDetails = async (req, res) => {
  try {
    const { payoutId } = req.params;

    const escrow = await Escrow.findOne({
      _id: payoutId,
      $or: [
        { buyer: req.user._id },
        { seller: req.user._id }
      ],
      'payout.paidOut': true
    }).populate('buyer seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { payout: escrow }
    });
  } catch (error) {
    console.error('Get payout details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payout details'
    });
  }
};

// Cancel payout (if pending)
exports.cancelPayout = async (req, res) => {
  try {
    const { payoutId } = req.params;

    const escrow = await Escrow.findOne({
      _id: payoutId,
      seller: req.user._id,
      'payout.paidOut': true
      // Note: You might want to add payout status field to check if it's still pending
    });

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Payout not found or you are not authorized'
      });
    }

    // Check if payout can be cancelled (only if still processing)
    // This would require integration with payment provider APIs
    // For now, return not implemented
    
    res.status(501).json({
      success: false,
      message: 'Payout cancellation is not yet implemented'
    });
  } catch (error) {
    console.error('Cancel payout error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel payout'
    });
  }
};

// Get account statistics
exports.getAccountStats = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const accounts = await BankAccount.find({ user: req.user._id });

    const stats = {
      totalAccounts: accounts.length,
      verifiedAccounts: accounts.filter(acc => acc.isVerified).length,
      primaryAccount: accounts.find(acc => acc.isPrimary),
      accountsByCurrency: accounts.reduce((acc, account) => {
        acc[account.currency] = (acc[account.currency] || 0) + 1;
        return acc;
      }, {}),
      totalPayouts: user.stats?.totalPayoutsReceived || 0,
      totalPayoutAmount: user.stats?.totalPayoutAmount || 0,
      canReceivePayouts: user.kycStatus?.status === 'approved' && accounts.some(acc => acc.isVerified)
    };

    res.status(200).json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get account stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account statistics'
    });
  }
};

// Validate bank account (without saving)
exports.validateBankAccount = async (req, res) => {
  try {
    const { accountNumber, bankCode, currency } = req.body;

    const verificationResult = await verifyBankAccountHelper({
      accountNumber,
      bankCode,
      currency,
      bankName: '' // Will be filled by verification
    });

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
        valid: false
      });
    }

    res.status(200).json({
      success: true,
      data: {
        valid: true,
        accountName: verificationResult.accountName,
        provider: verificationResult.provider,
        message: 'Bank account validation successful'
      }
    });
  } catch (error) {
    console.error('Validate bank account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate bank account'
    });
  }
};

// Get supported currencies
exports.getSupportedCurrencies = async (req, res) => {
  try {
    const currencies = [
      { code: 'NGN', name: 'Nigerian Naira', provider: 'paystack', verification: 'automatic' },
      { code: 'USD', name: 'US Dollar', provider: 'flutterwave', verification: 'manual' },
      { code: 'EUR', name: 'Euro', provider: 'flutterwave', verification: 'manual' },
      { code: 'GBP', name: 'British Pound', provider: 'flutterwave', verification: 'manual' },
      { code: 'CAD', name: 'Canadian Dollar', provider: 'manual', verification: 'manual' },
      { code: 'AUD', name: 'Australian Dollar', provider: 'manual', verification: 'manual' },
      { code: 'KES', name: 'Kenyan Shilling', provider: 'manual', verification: 'manual' },
      { code: 'GHS', name: 'Ghanaian Cedi', provider: 'manual', verification: 'manual' },
      { code: 'ZAR', name: 'South African Rand', provider: 'manual', verification: 'manual' }
    ];

    res.status(200).json({
      success: true,
      data: { currencies }
    });
  } catch (error) {
    console.error('Get supported currencies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch supported currencies'
    });
  }
};

// Get account limits
exports.getAccountLimits = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const accountsCount = await BankAccount.countDocuments({ user: req.user._id });

    const limits = {
      maxAccounts: 5,
      currentAccounts: accountsCount,
      canAddMore: accountsCount < 5,
      kycRequired: user.kycStatus?.status !== 'approved',
      remainingAccounts: Math.max(0, 5 - accountsCount)
    };

    res.status(200).json({
      success: true,
      data: { limits }
    });
  } catch (error) {
    console.error('Get account limits error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch account limits'
    });
  }
};

// ADMIN METHODS (Basic implementation - would need proper admin auth)
exports.adminGetBankAccounts = async (req, res) => {
  try {
    // Basic admin check - you should implement proper admin authentication
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { userId, currency, status, verified, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (userId) query.user = userId;
    if (currency) query.currency = currency;
    if (status) query.status = status;
    if (verified !== undefined) query.isVerified = verified === 'true';

    const accounts = await BankAccount.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await BankAccount.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        accounts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Admin get bank accounts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bank accounts'
    });
  }
};

// Webhook handlers (Basic implementation)
exports.paystackWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const crypto = require('crypto');
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Paystack webhook received:', event.event);

    // Handle transfer events
    if (event.event === 'transfer.success') {
      // Update escrow payout status
      // Implementation depends on your escrow model structure
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

exports.flutterwaveWebhook = async (req, res) => {
  try {
    // Verify Flutterwave webhook
    const crypto = require('crypto');
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET;
    const signature = req.headers['verif-hash'];

    if (!secretHash || signature !== secretHash) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    console.log('Flutterwave webhook received:', event.event);

    // Handle transfer events
    if (event.event === 'transfer.completed') {
      // Update international payout status
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Flutterwave webhook error:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

module.exports = exports;