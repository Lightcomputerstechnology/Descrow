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
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: ['dual'], // All users can buy and sell
    default: 'dual'
  },
  tier: {
    type: String,
    enum: ['free', 'basic', 'pro', 'enterprise'],
    default: 'free'
  },
  verified: {
    type: Boolean,
    default: false
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  kycDocuments: [{
    type: String // URLs to uploaded documents
  }],
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
  avatar: {
    type: String // URL to profile picture
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
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get tier limits
userSchema.methods.getTierLimits = function() {
  const limits = {
    free: {
      maxTransactionAmount: 500,
      maxTransactionsPerMonth: 5,
      transactionFee: 0.05 // 5%
    },
    basic: {
      maxTransactionAmount: 5000,
      maxTransactionsPerMonth: 50,
      transactionFee: 0.03 // 3%
    },
    pro: {
      maxTransactionAmount: 50000,
      maxTransactionsPerMonth: -1, // Unlimited
      transactionFee: 0.02 // 2%
    },
    enterprise: {
      maxTransactionAmount: -1, // Unlimited
      maxTransactionsPerMonth: -1, // Unlimited
      transactionFee: 0.015 // 1.5%
    }
  };
  
  return limits[this.tier];
};

module.exports = mongoose.model('User', userSchema);
