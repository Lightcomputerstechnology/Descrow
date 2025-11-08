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
    type: String
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
  // ← Added notification settings
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

// Compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get tier limits
userSchema.methods.getTierLimits = function() {
  const limits = {
    free: { maxTransactionAmount: 500, maxTransactionsPerMonth: 5, transactionFee: 0.05 },
    basic: { maxTransactionAmount: 5000, maxTransactionsPerMonth: 50, transactionFee: 0.03 },
    pro: { maxTransactionAmount: 50000, maxTransactionsPerMonth: -1, transactionFee: 0.02 },
    enterprise: { maxTransactionAmount: -1, maxTransactionsPerMonth: -1, transactionFee: 0.015 }
  };
  return limits[this.tier];
};

module.exports = mongoose.model('User', userSchema);