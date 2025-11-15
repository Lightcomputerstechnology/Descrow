 backend/models/ApiKey.model.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  key: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  secret: {
    type: String,
    required: true
  },
  environment: {
    type: String,
    enum: ['sandbox', 'production'],
    default: 'sandbox'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'revoked'],
    default: 'active'
  },
  permissions: {
    createEscrow: { type: Boolean, default: true },
    viewEscrow: { type: Boolean, default: true },
    fundEscrow: { type: Boolean, default: true },
    deliverEscrow: { type: Boolean, default: true },
    confirmDelivery: { type: Boolean, default: true },
    webhooks: { type: Boolean, default: true }
  },
  webhookUrl: {
    type: String,
    trim: true
  },
  rateLimit: {
    requestsPerMinute: { type: Number, default: 60 },
    requestsPerHour: { type: Number, default: 1000 }
  },
  usage: {
    totalRequests: { type: Number, default: 0 },
    lastUsed: Date,
    requestsThisMonth: { type: Number, default: 0 }
  },
  ipWhitelist: [String],
  metadata: {
    businessName: String,
    website: String,
    description: String
  },
  lastUsedAt: Date,
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Generate API key and secret
apiKeySchema.statics.generateKey = function() {
  const key = 'pk_' + crypto.randomBytes(24).toString('hex');
  const secret = 'sk_' + crypto.randomBytes(32).toString('hex');
  return { key, secret };
};

// Hash secret before saving
apiKeySchema.pre('save', async function(next) {
  if (this.isModified('secret')) {
    const crypto = require('crypto');
    this.secret = crypto.createHash('sha256').update(this.secret).digest('hex');
  }
  next();
});

// Verify secret
apiKeySchema.methods.verifySecret = function(secret) {
  const crypto = require('crypto');
  const hashedSecret = crypto.createHash('sha256').update(secret).digest('hex');
  return this.secret === hashedSecret;
};

// Increment usage
apiKeySchema.methods.incrementUsage = async function() {
  this.usage.totalRequests += 1;
  this.usage.requestsThisMonth += 1;
  this.usage.lastUsed = new Date();
  this.lastUsedAt = new Date();
  await this.save();
};

module.exports = mongoose.model('ApiKey', apiKeySchema);
