const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  role: {
    type: String,
    enum: ['dual'],
    default: 'dual'
  },
  
  // ✅ FIXED: Updated tier system to include 'free'
  tier: {
    type: String,
    enum: ['free', 'starter', 'growth', 'enterprise', 'api'],
    default: 'free'
  },
  
  // ✅ NEW: API Access fields
  apiAccess: {
    enabled: {
      type: Boolean,
      default: false
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true
    },
    apiSecret: {
      type: String,
      select: false
    },
    createdAt: Date,
    regeneratedAt: Date,
    lastUsedAt: Date,
    revokedAt: Date,
    requestCount: {
      type: Number,
      default: 0
    },
    keyHistory: [{
      apiKey: String,
      revokedAt: Date
    }]
  },
  
  // ✅ NEW: Subscription tracking
  subscription: {
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active'
    },
    startDate: Date,
    endDate: Date,
    lastPaymentDate: Date,
    autoRenew: {
      type: Boolean,
      default: true
    },
    paymentMethod: String
  },
  
  // ✅ NEW: Transaction limits tracking
  monthlyUsage: {
    transactionCount: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  
  // ✅ NEW: Enhanced verification fields
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isKYCVerified: {
    type: Boolean,
    default: false
  },
  
  // ✅ UPDATED: Enhanced KYC Status with proper integration
  kycStatus: {
    status: {
      type: String,
      enum: ['unverified', 'pending', 'under_review', 'approved', 'rejected', 'resubmission_required'],
      default: 'unverified'
    },
    tier: {
      type: String,
      enum: ['basic', 'advanced', 'premium'],
      default: 'basic'
    },
    submittedAt: Date,
    reviewedAt: Date,
    rejectionReason: String,
    resubmissionAllowed: {
      type: Boolean,
      default: true
    },
    verificationId: {
      type: String,
      sparse: true
    },
    documents: [{
      type: {
        type: String,
        enum: ['id_front', 'id_back', 'proof_of_address', 'selfie', 'business_registration', 'tax_certificate']
      },
      url: String,
      uploadedAt: Date,
      verified: {
        type: Boolean,
        default: false
      }
    }],
    personalInfo: {
      dateOfBirth: Date,
      nationality: String,
      idNumber: String,
      idType: {
        type: String,
        enum: ['passport', 'drivers_license', 'national_id']
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
      }
    },
    businessInfo: {
      companyName: String,
      registrationNumber: String,
      taxId: String,
      businessType: String,
      website: String
    }
  },
  
  // ✅ NEW: Comprehensive stats tracking
  stats: {
    // Transaction Stats
    totalTransactions: {
      type: Number,
      default: 0
    },
    totalSpent: {
      type: Number,
      default: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    },
    completedEscrows: {
      type: Number,
      default: 0
    },
    cancelledEscrows: {
      type: Number,
      default: 0
    },
    
    // Bank Account Stats
    bankAccountsCount: {
      type: Number,
      default: 0
    },
    verifiedBankAccountsCount: {
      type: Number,
      default: 0
    },
    totalPayoutsReceived: {
      type: Number,
      default: 0
    },
    totalPayoutAmount: {
      type: Number,
      default: 0
    },
    lastPayoutAt: Date,
    
    // Platform Engagement
    totalLogins: {
      type: Number,
      default: 0
    },
    accountAgeDays: {
      type: Number,
      default: 0
    },
    responseRate: {
      type: Number,
      default: 0
    },
    averageCompletionTime: {
      type: Number, // in hours
      default: 0
    }
  },
  
  totalTransactions: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  
  phone: {
    type: String,
    trim: true
  },
  
  bio: {
    type: String,
    maxlength: 500
  },
  
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  socialLinks: {
    twitter: String,
    linkedin: String,
    website: String
  },
  
  businessInfo: {
    companyName: String,
    taxId: String,
    industry: String
  },
  
  profilePicture: {
    type: String
  },
  
  avatar: {
    type: String
  },
  
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  twoFactorSecret: {
    type: String,
    select: false
  },
  
  lastLogin: {
    type: Date
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  
  deletedAt: Date,
  deletionReason: String,
  
  // ✅ UPDATED: Bank account linked flag with enhanced tracking
  hasBankAccount: {
    type: Boolean,
    default: false
  },
  
  // ✅ NEW: Primary bank account reference
  primaryBankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    sparse: true
  },
  
  // ✅ NEW: Escrow access control
  escrowAccess: {
    canCreateEscrow: {
      type: Boolean,
      default: true
    },
    canReceiveEscrow: {
      type: Boolean,
      default: true
    },
    maxActiveEscrows: {
      type: Number,
      default: 5
    },
    restrictions: [{
      type: String,
      enum: ['amount_limit', 'currency_restriction', 'geographic_restriction']
    }],
    suspendedUntil: Date,
    suspensionReason: String
  },
  
  notificationSettings: {
    email: {
      escrowUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      disputes: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false },
      kycUpdates: { type: Boolean, default: true },
      payoutNotifications: { type: Boolean, default: true }
    },
    push: {
      escrowUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      disputes: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      kycUpdates: { type: Boolean, default: true }
    }
  },
  
  // ✅ NEW: Security and preferences
  preferences: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    defaultCurrency: {
      type: String,
      default: 'USD'
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    }
  },
  
  // ✅ NEW: Audit trail
  auditLog: [{
    action: String,
    description: String,
    ipAddress: String,
    userAgent: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ UPDATED: Reset monthly transaction count and update account age
userSchema.pre('save', function(next) {
  const now = new Date();
  const lastReset = this.monthlyUsage.lastResetDate;
  
  // Reset if it's a new month
  if (lastReset && now.getMonth() !== lastReset.getMonth()) {
    this.monthlyUsage.transactionCount = 0;
    this.monthlyUsage.lastResetDate = now;
  }
  
  // Update account age in days
  if (this.createdAt) {
    const ageInDays = Math.floor((now - this.createdAt) / (1000 * 60 * 60 * 24));
    this.stats.accountAgeDays = ageInDays;
  }
  
  next();
});

// ✅ NEW: Update KYC verification status automatically
userSchema.pre('save', function(next) {
  // Sync isKYCVerified with kycStatus.status
  if (this.kycStatus && this.kycStatus.status === 'approved') {
    this.isKYCVerified = true;
  } else {
    this.isKYCVerified = false;
  }
  
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ NEW: Check if user can access escrow features
userSchema.methods.canAccessEscrow = function() {
  // Check KYC verification
  if (!this.isKYCVerified) {
    return {
      allowed: false,
      reason: 'KYC verification required',
      action: 'complete_kyc',
      required: true
    };
  }
  
  // Check account status
  if (this.status !== 'active') {
    return {
      allowed: false,
      reason: 'Account is suspended or deleted',
      action: 'contact_support'
    };
  }
  
  // Check escrow access restrictions
  if (!this.escrowAccess.canCreateEscrow) {
    return {
      allowed: false,
      reason: 'Escrow creation is temporarily restricted',
      action: 'contact_support'
    };
  }
  
  return { allowed: true };
};

// ✅ NEW: Check if user can receive payouts
userSchema.methods.canReceivePayouts = function() {
  const escrowAccess = this.canAccessEscrow();
  if (!escrowAccess.allowed) {
    return escrowAccess;
  }
  
  // Check if user has verified bank accounts
  if (this.stats.verifiedBankAccountsCount === 0) {
    return {
      allowed: false,
      reason: 'No verified bank accounts',
      action: 'add_bank_account',
      required: true
    };
  }
  
  return { allowed: true };
};

// ✅ UPDATED: Get tier limits with new structure including 'free' tier
userSchema.methods.getTierLimits = function() {
  const limits = {
    free: {
      name: 'Free',
      maxTransactionAmount: {
        NGN: 50000,
        USD: 500,
        EUR: 450,
        GBP: 400
      },
      maxTransactionsPerMonth: 5,
      monthlyCost: {
        NGN: 0,
        USD: 0,
        EUR: 0,
        GBP: 0
      },
      fees: {
        NGN: {
          buyer: 0.03,    // 3%
          seller: 0.03    // 3%
        },
        USD: {
          buyer: 0.035,   // 3.5%
          seller: 0.035   // 3.5%
        },
        EUR: {
          buyer: 0.035,   // 3.5%
          seller: 0.035   // 3.5%
        },
        GBP: {
          buyer: 0.035,   // 3.5%
          seller: 0.035   // 3.5%
        },
        crypto: {
          buyer: 0.0175,  // 1.75%
          seller: 0.0175  // 1.75%
        }
      },
      features: ['Basic processing', 'Email support', '5 transactions/month', 'KYC required for escrow']
    },
    
    starter: {
      name: 'Starter',
      maxTransactionAmount: {
        NGN: 50000,
        USD: 500,
        EUR: 450,
        GBP: 400
      },
      maxTransactionsPerMonth: 10,
      monthlyCost: {
        NGN: 0,
        USD: 0,
        EUR: 0,
        GBP: 0
      },
      fees: {
        NGN: {
          buyer: 0.03,    // 3%
          seller: 0.03    // 3%
        },
        USD: {
          buyer: 0.035,   // 3.5%
          seller: 0.035   // 3.5%
        },
        EUR: {
          buyer: 0.035,   // 3.5%
          seller: 0.035   // 3.5%
        },
        GBP: {
          buyer: 0.035,   // 3.5%
          seller: 0.035   // 3.5%
        },
        crypto: {
          buyer: 0.0175,  // 1.75%
          seller: 0.0175  // 1.75%
        }
      },
      features: ['Standard processing', 'Basic support', '10 transactions/month', 'Multi-currency support']
    },
    
    growth: {
      name: 'Growth',
      maxTransactionAmount: {
        NGN: 500000,
        USD: 5000,
        EUR: 4500,
        GBP: 4000
      },
      maxTransactionsPerMonth: 50,
      monthlyCost: {
        NGN: 5000,
        USD: 10,
        EUR: 9,
        GBP: 8
      },
      fees: {
        NGN: {
          buyer: 0.025,   // 2.5%
          seller: 0.025   // 2.5%
        },
        USD: {
          buyer: 0.03,    // 3%
          seller: 0.03    // 3%
        },
        EUR: {
          buyer: 0.03,    // 3%
          seller: 0.03    // 3%
        },
        GBP: {
          buyer: 0.03,    // 3%
          seller: 0.03    // 3%
        },
        crypto: {
          buyer: 0.0125,  // 1.25%
          seller: 0.0125  // 1.25%
        }
      },
      features: ['Fast processing', 'Priority support', '50 transactions/month', 'Advanced KYC options']
    },
    
    enterprise: {
      name: 'Enterprise',
      maxTransactionAmount: {
        NGN: -1,  // Unlimited
        USD: -1,  // Unlimited
        EUR: -1,  // Unlimited
        GBP: -1   // Unlimited
      },
      maxTransactionsPerMonth: -1,  // Unlimited
      monthlyCost: {
        NGN: 15000,
        USD: 30,
        EUR: 27,
        GBP: 24
      },
      fees: {
        NGN: {
          buyer: 0.0225,  // 2.25%
          seller: 0.0225  // 2.25%
        },
        USD: {
          buyer: 0.0275,  // 2.75%
          seller: 0.0275  // 2.75%
        },
        EUR: {
          buyer: 0.0275,  // 2.75%
          seller: 0.0275  // 2.75%
        },
        GBP: {
          buyer: 0.0275,  // 2.75%
          seller: 0.0275  // 2.75%
        },
        crypto: {
          buyer: 0.009,   // 0.9%
          seller: 0.009   // 0.9%
        }
      },
      features: ['Instant processing', 'Premium support', 'Unlimited transactions', 'Dedicated manager', 'Custom solutions']
    },
    
    api: {
      name: 'API Tier',
      maxTransactionAmount: {
        NGN: -1,  // Unlimited
        USD: -1,  // Unlimited
        EUR: -1,  // Unlimited
        GBP: -1   // Unlimited
      },
      maxTransactionsPerMonth: -1,  // Unlimited
      monthlyCost: {
        NGN: 50000,
        USD: 100,
        EUR: 90,
        GBP: 80
      },
      setupFee: {
        NGN: 100000,
        USD: 200,
        EUR: 180,
        GBP: 160
      },
      fees: {
        NGN: {
          buyer: 0.02,    // 2%
          seller: 0.02    // 2%
        },
        USD: {
          buyer: 0.025,   // 2.5%
          seller: 0.025   // 2.5%
        },
        EUR: {
          buyer: 0.025,   // 2.5%
          seller: 0.025   // 2.5%
        },
        GBP: {
          buyer: 0.025,   // 2.5%
          seller: 0.025   // 2.5%
        },
        crypto: {
          buyer: 0.0075,  // 0.75%
          seller: 0.0075  // 0.75%
        }
      },
      features: [
        'Full API access',
        'Webhook support',
        'White-label option',
        'Custom integration',
        'Dedicated account manager',
        'Priority processing',
        'Bulk operations'
      ]
    }
  };
  
  return limits[this.tier];
};

// ✅ UPDATED: Check if user can create transaction with KYC verification
userSchema.methods.canCreateTransaction = function(amount, currency) {
  // Check KYC first
  const kycCheck = this.canAccessEscrow();
  if (!kycCheck.allowed) {
    return kycCheck;
  }
  
  const limits = this.getTierLimits();
  
  // Check transaction count limit
  if (limits.maxTransactionsPerMonth !== -1 && 
      this.monthlyUsage.transactionCount >= limits.maxTransactionsPerMonth) {
    return {
      allowed: false,
      reason: 'Monthly transaction limit reached',
      limit: limits.maxTransactionsPerMonth,
      current: this.monthlyUsage.transactionCount,
      upgradeRequired: true
    };
  }
  
  // Check transaction amount limit
  const maxAmount = limits.maxTransactionAmount[currency];
  if (maxAmount !== -1 && amount > maxAmount) {
    return {
      allowed: false,
      reason: 'Transaction amount exceeds tier limit',
      limit: maxAmount,
      currency,
      upgradeRequired: true
    };
  }
  
  return { allowed: true };
};

// ✅ UPDATED: Get fees for specific transaction
userSchema.methods.getFeesForTransaction = function(amount, currency) {
  const limits = this.getTierLimits();
  const fees = limits.fees[currency] || limits.fees.USD;
  
  const buyerFee = amount * fees.buyer;
  const sellerFee = amount * fees.seller;
  
  return {
    buyerFee: parseFloat(buyerFee.toFixed(2)),
    sellerFee: parseFloat(sellerFee.toFixed(2)),
    buyerPays: parseFloat((amount + buyerFee).toFixed(2)),
    sellerReceives: parseFloat((amount - sellerFee).toFixed(2)),
    platformFee: parseFloat((buyerFee + sellerFee).toFixed(2)),
    buyerFeePercentage: fees.buyer * 100,
    sellerFeePercentage: fees.seller * 100
  };
};

// ✅ NEW: Add audit log entry
userSchema.methods.addAuditLog = function(action, description, ipAddress = '', userAgent = '', metadata = {}) {
  this.auditLog.push({
    action,
    description,
    ipAddress,
    userAgent,
    metadata
  });
  
  // Keep only last 100 audit entries
  if (this.auditLog.length > 100) {
    this.auditLog = this.auditLog.slice(-100);
  }
  
  return this.save();
};

// ✅ NEW: Update login stats
userSchema.methods.updateLoginStats = function(ipAddress = '', userAgent = '') {
  this.lastLogin = new Date();
  this.stats.totalLogins += 1;
  
  this.addAuditLog(
    'login',
    'User logged in successfully',
    ipAddress,
    userAgent
  );
  
  return this.save();
};

// ✅ NEW: Check if user needs to upgrade tier
userSchema.methods.needsTierUpgrade = function() {
  const limits = this.getTierLimits();
  
  if (limits.maxTransactionsPerMonth !== -1 && 
      this.monthlyUsage.transactionCount >= limits.maxTransactionsPerMonth) {
    return {
      needed: true,
      reason: 'transaction_limit',
      currentTier: this.tier
    };
  }
  
  return { needed: false };
};

module.exports = mongoose.model('User', userSchema);
