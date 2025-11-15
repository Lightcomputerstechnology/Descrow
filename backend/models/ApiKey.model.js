const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  businessEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  apiKey: {
    type: String,
    unique: true,
    required: true
  },
  environment: {
    type: String,
    enum: ['test', 'production'],
    default: 'test'
  },
  status: {
    type: String,
    enum: ['active', 'revoked'],
    default: 'active'
  },
  permissions: [{
    type: String,
    enum: ['create_escrow', 'view_transactions', 'release_payment', 'webhooks', 'refunds']
  }],
  rateLimit: {
    type: Number,
    default: 100 // requests per hour
  },
  requestsToday: {
    type: Number,
    default: 0
  },
  requestsThisMonth: {
    type: Number,
    default: 0
  },
  transactionsCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date
  },
  webhookUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Generate API key
apiKeySchema.pre('save', function(next) {
  if (!this.apiKey) {
    const prefix = this.environment === 'production' ? 'sk_live_' : 'sk_test_';
    this.apiKey = prefix + crypto.randomBytes(32).toString('hex');
  }
  next();
});

// Reset monthly counters
apiKeySchema.methods.resetMonthlyCounters = function() {
  this.requestsThisMonth = 0;
};

module.exports = mongoose.model('APIKey', apiKeySchema);
