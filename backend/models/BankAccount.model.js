// backend/models/BankAccount.model.js - ENHANCED MULTI-CURRENCY SUPPORT

const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Basic Account Information
    accountName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    bankName: {
      type: String,
      required: true,
      trim: true
    },

    bankCode: {
      type: String,
      required: true,
      trim: true
    },

    // Multi-Currency Support
    currency: {
      type: String,
      required: true,
      enum: ['NGN', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'KES', 'GHS', 'ZAR'],
      default: 'NGN',
      index: true
    },

    // Account Type
    accountType: {
      type: String,
      enum: ['personal', 'business'],
      default: 'personal'
    },

    // International Banking Details
    swiftCode: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true // Allows null for NGN accounts
    },

    iban: {
      type: String,
      trim: true,
      uppercase: true,
      sparse: true
    },

    routingNumber: {
      type: String,
      trim: true,
      sparse: true // For US accounts
    },

    // Provider Information
    provider: {
      type: String,
      enum: ['paystack', 'flutterwave', 'manual'],
      default: 'paystack'
    },

    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
      index: true
    },

    isPrimary: {
      type: Boolean,
      default: false,
      index: true
    },

    // Enhanced Verification Data
    verificationData: {
      verifiedAt: {
        type: Date
      },
      verificationMethod: {
        type: String,
        enum: ['paystack', 'flutterwave', 'manual', 'admin'],
        default: 'manual'
      },
      verificationResponse: {
        type: mongoose.Schema.Types.Mixed
      },
      failedAttempts: {
        type: Number,
        default: 0
      },
      lastVerificationAttempt: {
        type: Date
      }
    },

    // Security & Status
    status: {
      type: String,
      enum: ['active', 'pending_verification', 'suspended', 'deleted'],
      default: 'active'
    },

    // Usage Statistics
    usageStats: {
      totalPayouts: {
        type: Number,
        default: 0
      },
      totalPayoutAmount: {
        type: Number,
        default: 0
      },
      lastPayoutAt: {
        type: Date
      },
      failedPayouts: {
        type: Number,
        default: 0
      }
    },

    // Metadata
    metadata: {
      country: {
        type: String,
        default: 'NG'
      },
      branchCode: {
        type: String,
        trim: true
      },
      branchName: {
        type: String,
        trim: true
      }
    }

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// ------------------------------------------------------
// INDEXES FOR PERFORMANCE
// ------------------------------------------------------
bankAccountSchema.index({ user: 1, isPrimary: 1 });
bankAccountSchema.index({ user: 1, currency: 1 });
bankAccountSchema.index({ user: 1, isVerified: 1 });
bankAccountSchema.index({ accountNumber: 1, bankCode: 1, currency: 1 }, { unique: true });

// ------------------------------------------------------
// VIRTUAL FIELDS
// ------------------------------------------------------
bankAccountSchema.virtual('displayAccountNumber').get(function() {
  // Mask account number for display
  if (this.accountNumber && this.accountNumber.length > 4) {
    return `••••${this.accountNumber.slice(-4)}`;
  }
  return this.accountNumber;
});

bankAccountSchema.virtual('isInternational').get(function() {
  return this.currency !== 'NGN';
});

bankAccountSchema.virtual('providerName').get(function() {
  const providers = {
    'paystack': 'Paystack',
    'flutterwave': 'Flutterwave', 
    'manual': 'Manual'
  };
  return providers[this.provider] || 'Unknown';
});

bankAccountSchema.virtual('requiresSwiftCode').get(function() {
  return ['USD', 'EUR', 'GBP'].includes(this.currency);
});

// ------------------------------------------------------
// STATIC METHODS
// ------------------------------------------------------
bankAccountSchema.statics.findPrimaryByUser = function(userId) {
  return this.findOne({ user: userId, isPrimary: true, status: 'active' });
};

bankAccountSchema.statics.findVerifiedByUser = function(userId) {
  return this.find({ 
    user: userId, 
    isVerified: true, 
    status: 'active' 
  }).sort({ isPrimary: -1, createdAt: -1 });
};

bankAccountSchema.statics.findByCurrency = function(userId, currency) {
  return this.find({ 
    user: userId, 
    currency: currency.toUpperCase(),
    status: 'active',
    isVerified: true
  });
};

bankAccountSchema.statics.getUserAccountsCount = function(userId) {
  return this.countDocuments({ 
    user: userId, 
    status: { $ne: 'deleted' } 
  });
};

// ------------------------------------------------------
// INSTANCE METHODS
// ------------------------------------------------------
bankAccountSchema.methods.canBePrimary = function() {
  return this.isVerified && this.status === 'active';
};

bankAccountSchema.methods.maskSensitiveData = function() {
  const masked = this.toObject();
  
  // Mask account number
  if (masked.accountNumber && masked.accountNumber.length > 4) {
    masked.accountNumber = `••••${masked.accountNumber.slice(-4)}`;
  }
  
  // Remove sensitive verification data
  if (masked.verificationData && masked.verificationData.verificationResponse) {
    delete masked.verificationData.verificationResponse;
  }
  
  return masked;
};

bankAccountSchema.methods.incrementPayoutStats = function(amount) {
  this.usageStats.totalPayouts += 1;
  this.usageStats.totalPayoutAmount += amount;
  this.usageStats.lastPayoutAt = new Date();
  return this.save();
};

bankAccountSchema.methods.incrementFailedPayout = function() {
  this.usageStats.failedPayouts += 1;
  return this.save();
};

// ------------------------------------------------------
// PRE-SAVE MIDDLEWARE
// ------------------------------------------------------

// Ensure only ONE primary bank account per user
bankAccountSchema.pre('save', async function (next) {
  if (this.isPrimary && this.isModified('isPrimary')) {
    try {
      await this.constructor.updateMany(
        { 
          user: this.user, 
          _id: { $ne: this._id },
          status: 'active'
        },
        { isPrimary: false }
      );
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Auto-set provider based on currency
bankAccountSchema.pre('save', function (next) {
  if (this.isModified('currency') || this.isNew) {
    if (this.currency === 'NGN') {
      this.provider = 'paystack';
    } else if (['USD', 'EUR', 'GBP'].includes(this.currency)) {
      this.provider = 'flutterwave';
    } else {
      this.provider = 'manual';
    }
  }
  next();
});

// Auto-set country based on currency
bankAccountSchema.pre('save', function (next) {
  if (this.isNew || this.isModified('currency')) {
    const currencyCountries = {
      'NGN': 'NG',
      'USD': 'US', 
      'EUR': 'EU',
      'GBP': 'GB',
      'CAD': 'CA',
      'AUD': 'AU',
      'KES': 'KE',
      'GHS': 'GH',
      'ZAR': 'ZA'
    };
    this.metadata.country = currencyCountries[this.currency] || 'US';
  }
  next();
});

// Validate international accounts have required fields
bankAccountSchema.pre('save', function (next) {
  if (this.isInternational && this.isNew) {
    if (this.requiresSwiftCode && !this.swiftCode) {
      return next(new Error('SWIFT/BIC code is required for international accounts'));
    }
    
    if (!this.accountName) {
      return next(new Error('Account name is required for international accounts'));
    }
  }
  next();
});

// ------------------------------------------------------
// POST-SAVE MIDDLEWARE  
// ------------------------------------------------------
bankAccountSchema.post('save', async function(doc) {
  // Update user's bank account stats
  const User = mongoose.model('User');
  
  try {
    const activeAccountsCount = await this.constructor.countDocuments({
      user: doc.user,
      status: 'active'
    });
    
    const verifiedAccountsCount = await this.constructor.countDocuments({
      user: doc.user,
      status: 'active',
      isVerified: true
    });

    await User.findByIdAndUpdate(doc.user, {
      'stats.bankAccountsCount': activeAccountsCount,
      'stats.verifiedBankAccountsCount': verifiedAccountsCount,
      hasBankAccount: activeAccountsCount > 0
    });
  } catch (error) {
    console.error('Error updating user bank account stats:', error);
  }
});

// ------------------------------------------------------
// QUERY HELPERS
// ------------------------------------------------------
bankAccountSchema.query.active = function() {
  return this.where({ status: 'active' });
};

bankAccountSchema.query.verified = function() {
  return this.where({ isVerified: true, status: 'active' });
};

bankAccountSchema.query.byCurrency = function(currency) {
  return this.where({ currency: currency.toUpperCase() });
};

bankAccountSchema.query.byUser = function(userId) {
  return this.where({ user: userId });
};

// ------------------------------------------------------
// VALIDATION METHODS
// ------------------------------------------------------
bankAccountSchema.methods.validateAccountNumber = function() {
  if (!this.accountNumber) return false;
  
  // Basic validation - can be enhanced per country/bank
  const accountNumber = this.accountNumber.replace(/\s/g, '');
  
  if (this.currency === 'NGN') {
    // Nigerian account numbers are typically 10 digits
    return /^\d{10}$/.test(accountNumber);
  }
  
  // International accounts - basic numeric validation
  return /^\d+$/.test(accountNumber) && accountNumber.length >= 5 && accountNumber.length <= 20;
};

bankAccountSchema.methods.validateSwiftCode = function() {
  if (!this.swiftCode) return !this.requiresSwiftCode;
  
  // Basic SWIFT/BIC format validation (8 or 11 characters)
  const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  return swiftRegex.test(this.swiftCode.toUpperCase());
};

module.exports = mongoose.model('BankAccount', bankAccountSchema);
