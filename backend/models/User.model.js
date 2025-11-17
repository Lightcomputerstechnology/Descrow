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
  
  // ✅ UPDATED: New tier system
  tier: {
    type: String,
    enum: ['starter', 'growth', 'enterprise', 'api'],
    default: 'starter'
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
  
  // ✅ NEW: Additional verification fields
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
  
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  kycDocuments: [{
    type: String
  }],
  kycVerification: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'KYCVerification'
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
  
  // ✅ NEW: Bank account linked flag
  hasBankAccount: {
    type: Boolean,
    default: false
  },
  
  notificationSettings: {
    email: {
      escrowUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      disputes: { type: Boolean, default: true },
      payments: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
    },
    push: {
      escrowUpdates: { type: Boolean, default: true },
      messages: { type: Boolean, default: true },
      disputes: { type: Boolean, default: true },
      payments: { type: Boolean, default: true }
    }
  }
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

// ✅ NEW: Reset monthly transaction count
userSchema.pre('save', function(next) {
  const now = new Date();
  const lastReset = this.monthlyUsage.lastResetDate;
  
  // Reset if it's a new month
  if (lastReset && now.getMonth() !== lastReset.getMonth()) {
    this.monthlyUsage.transactionCount = 0;
    this.monthlyUsage.lastResetDate = now;
  }
  
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ UPDATED: Get tier limits with new structure
userSchema.methods.getTierLimits = function() {
  const limits = {
    starter: {
      name: 'Starter',
      maxTransactionAmount: {
        NGN: 50000,
        USD: 500
      },
      maxTransactionsPerMonth: 10,
      monthlyCost: {
        NGN: 0,
        USD: 0
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
        crypto: {
          buyer: 0.0175,  // 1.75%
          seller: 0.0175  // 1.75%
        }
      },
      features: ['Standard processing', 'Basic support', 'Limited transactions']
    },
    
    growth: {
      name: 'Growth',
      maxTransactionAmount: {
        NGN: 500000,
        USD: 5000
      },
      maxTransactionsPerMonth: 50,
      monthlyCost: {
        NGN: 5000,
        USD: 10
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
        crypto: {
          buyer: 0.0125,  // 1.25%
          seller: 0.0125  // 1.25%
        }
      },
      features: ['Fast processing', 'Priority support', '50 transactions/month']
    },
    
    enterprise: {
      name: 'Enterprise',
      maxTransactionAmount: {
        NGN: -1,  // Unlimited
        USD: -1   // Unlimited
      },
      maxTransactionsPerMonth: -1,  // Unlimited
      monthlyCost: {
        NGN: 15000,
        USD: 30
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
        crypto: {
          buyer: 0.009,   // 0.9%
          seller: 0.009   // 0.9%
        }
      },
      features: ['Instant processing', 'Premium support', 'Unlimited transactions', 'Dedicated manager']
    },
    
    api: {
      name: 'API Tier',
      maxTransactionAmount: {
        NGN: -1,  // Unlimited
        USD: -1   // Unlimited
      },
      maxTransactionsPerMonth: -1,  // Unlimited
      monthlyCost: {
        NGN: 50000,
        USD: 100
      },
      setupFee: {
        NGN: 100000,
        USD: 200
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
        'Priority processing'
      ]
    }
  };
  
  return limits[this.tier];
};

// ✅ NEW: Check if user can create transaction
userSchema.methods.canCreateTransaction = function(amount, currency) {
  const limits = this.getTierLimits();
  
  // Check transaction count limit
  if (limits.maxTransactionsPerMonth !== -1 && 
      this.monthlyUsage.transactionCount >= limits.maxTransactionsPerMonth) {
    return {
      allowed: false,
      reason: 'Monthly transaction limit reached',
      limit: limits.maxTransactionsPerMonth,
      current: this.monthlyUsage.transactionCount
    };
  }
  
  // Check transaction amount limit
  const maxAmount = limits.maxTransactionAmount[currency];
  if (maxAmount !== -1 && amount > maxAmount) {
    return {
      allowed: false,
      reason: 'Transaction amount exceeds tier limit',
      limit: maxAmount,
      currency
    };
  }
  
  return { allowed: true };
};

// ✅ NEW: Get fees for specific transaction
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

module.exports = mongoose.model('User', userSchema);