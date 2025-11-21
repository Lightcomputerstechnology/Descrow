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
  
  tier: {
    type: String,
    enum: ['free', 'starter', 'growth', 'enterprise', 'api'],
    default: 'free'
  },
  
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
  
  // ✅ FIXED: Enhanced KYC Status with proper defaults and validation
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
    submittedAt: {
      type: Date,
      default: null
    },
    reviewedAt: {
      type: Date,
      default: null
    },
    rejectionReason: {
      type: String,
      default: null
    },
    resubmissionAllowed: {
      type: Boolean,
      default: true
    },
    verificationId: {
      type: String,
      sparse: true,
      default: null
    },
    documents: {
      type: [{
        type: {
          type: String,
          enum: ['id_front', 'id_back', 'proof_of_address', 'selfie', 'business_registration', 'tax_certificate']
        },
        url: String,
        uploadedAt: {
          type: Date,
          default: Date.now
        },
        verified: {
          type: Boolean,
          default: false
        }
      }],
      default: []
    },
    personalInfo: {
      dateOfBirth: {
        type: Date,
        default: null
      },
      nationality: {
        type: String,
        default: null
      },
      idNumber: {
        type: String,
        default: null
      },
      idType: {
        type: String,
        enum: ['passport', 'drivers_license', 'national_id', null],
        default: null
      },
      address: {
        street: {
          type: String,
          default: null
        },
        city: {
          type: String,
          default: null
        },
        state: {
          type: String,
          default: null
        },
        country: {
          type: String,
          default: null
        },
        postalCode: {
          type: String,
          default: null
        }
      }
    },
    businessInfo: {
      companyName: {
        type: String,
        default: null
      },
      registrationNumber: {
        type: String,
        default: null
      },
      taxId: {
        type: String,
        default: null
      },
      businessType: {
        type: String,
        default: null
      },
      website: {
        type: String,
        default: null
      }
    }
  },
  
  stats: {
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
    lastPayoutAt: {
      type: Date,
      default: null
    },
    
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
      type: Number,
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
  
  hasBankAccount: {
    type: Boolean,
    default: false
  },
  
  primaryBankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    sparse: true
  },
  
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

// ✅ FIXED: Pre-save middleware to handle corrupted KYC data
userSchema.pre('save', function(next) {
  // Fix corrupted kycStatus data
  if (this.kycStatus && typeof this.kycStatus === 'string') {
    console.warn(`Fixing corrupted KYC data for user ${this.email}`);
    this.kycStatus = {
      status: this.kycStatus,
      tier: 'basic',
      submittedAt: null,
      reviewedAt: null,
      rejectionReason: null,
      resubmissionAllowed: true,
      verificationId: null,
      documents: [],
      personalInfo: {
        dateOfBirth: null,
        nationality: null,
        idNumber: null,
        idType: null,
        address: {
          street: null,
          city: null,
          state: null,
          country: null,
          postalCode: null
        }
      },
      businessInfo: {
        companyName: null,
        registrationNumber: null,
        taxId: null,
        businessType: null,
        website: null
      }
    };
  }

  // Ensure kycStatus.documents is an array
  if (this.kycStatus && !Array.isArray(this.kycStatus.documents)) {
    this.kycStatus.documents = [];
  }

  // Sync isKYCVerified with kycStatus.status
  if (this.kycStatus && this.kycStatus.status === 'approved') {
    this.isKYCVerified = true;
  } else {
    this.isKYCVerified = false;
  }

  // Reset monthly transaction count if it's a new month
  const now = new Date();
  const lastReset = this.monthlyUsage?.lastResetDate;
  
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

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user can access escrow features
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

// Check if user can receive payouts
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

// Get tier limits
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
          buyer: 0.03,
          seller: 0.03
        },
        USD: {
          buyer: 0.035,
          seller: 0.035
        },
        EUR: {
          buyer: 0.035,
          seller: 0.035
        },
        GBP: {
          buyer: 0.035,
          seller: 0.035
        },
        crypto: {
          buyer: 0.0175,
          seller: 0.0175
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
          buyer: 0.03,
          seller: 0.03
        },
        USD: {
          buyer: 0.035,
          seller: 0.035
        },
        EUR: {
          buyer: 0.035,
          seller: 0.035
        },
        GBP: {
          buyer: 0.035,
          seller: 0.035
        },
        crypto: {
          buyer: 0.0175,
          seller: 0.0175
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
          buyer: 0.025,
          seller: 0.025
        },
        USD: {
          buyer: 0.03,
          seller: 0.03
        },
        EUR: {
          buyer: 0.03,
          seller: 0.03
        },
        GBP: {
          buyer: 0.03,
          seller: 0.03
        },
        crypto: {
          buyer: 0.0125,
          seller: 0.0125
        }
      },
      features: ['Fast processing', 'Priority support', '50 transactions/month', 'Advanced KYC options']
    },
    
    enterprise: {
      name: 'Enterprise',
      maxTransactionAmount: {
        NGN: -1,
        USD: -1,
        EUR: -1,
        GBP: -1
      },
      maxTransactionsPerMonth: -1,
      monthlyCost: {
        NGN: 15000,
        USD: 30,
        EUR: 27,
        GBP: 24
      },
      fees: {
        NGN: {
          buyer: 0.0225,
          seller: 0.0225
        },
        USD: {
          buyer: 0.0275,
          seller: 0.0275
        },
        EUR: {
          buyer: 0.0275,
          seller: 0.0275
        },
        GBP: {
          buyer: 0.0275,
          seller: 0.0275
        },
        crypto: {
          buyer: 0.009,
          seller: 0.009
        }
      },
      features: ['Instant processing', 'Premium support', 'Unlimited transactions', 'Dedicated manager', 'Custom solutions']
    },
    
    api: {
      name: 'API Tier',
      maxTransactionAmount: {
        NGN: -1,
        USD: -1,
        EUR: -1,
        GBP: -1
      },
      maxTransactionsPerMonth: -1,
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
          buyer: 0.02,
          seller: 0.02
        },
        USD: {
          buyer: 0.025,
          seller: 0.025
        },
        EUR: {
          buyer: 0.025,
          seller: 0.025
        },
        GBP: {
          buyer: 0.025,
          seller: 0.025
        },
        crypto: {
          buyer: 0.0075,
          seller: 0.0075
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

// Check if user can create transaction with KYC verification
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

// Get fees for specific transaction
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

// Add audit log entry
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

// Update login stats
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

// Check if user needs to upgrade tier
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