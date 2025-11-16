// backend/models/Business.model.js - NEW BUSINESS MODEL

const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
  businessId: {
    type: String,
    required: true,
    unique: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  businessType: {
    type: String,
    enum: ['sole_proprietor', 'partnership', 'llc', 'corporation', 'ngo'],
    required: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },
  taxId: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  documents: [{
    type: {
      type: String,
      enum: ['registration_certificate', 'tax_id', 'utility_bill', 'bank_statement', 'other']
    },
    url: String,
    uploadedAt: Date
  }],
  verification: {
    status: {
      type: String,
      enum: ['pending', 'in_review', 'approved', 'rejected'],
      default: 'pending'
    },
    verifiedAt: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String
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
      type: String
    },
    webhookUrl: String,
    ipWhitelist: [String],
    rateLimit: {
      requestsPerMinute: {
        type: Number,
        default: 60
      },
      requestsPerDay: {
        type: Number,
        default: 10000
      }
    }
  },
  statistics: {
    totalTransactions: {
      type: Number,
      default: 0
    },
    totalVolume: {
      type: Number,
      default: 0
    },
    apiCalls: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Generate business ID
businessSchema.pre('save', async function(next) {
  if (!this.businessId) {
    this.businessId = `BUS${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
  }
  next();
});

module.exports = mongoose.model('Business', businessSchema);
