const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
  // Unique Escrow ID
  escrowId: {
    type: String,
    unique: true,
    index: true
  },

  // Basic Info
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  amount: {
    type: mongoose.Schema.Types.Decimal128,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR', 'CAD', 'AUD', 'XOF', 'XAF']
  },

  // ✅ NEW: File Attachments Support
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    mimetype: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Participants
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Tier tracking
  buyerTier: {
    type: String,
    enum: ['starter', 'growth', 'enterprise', 'api'],
    default: 'starter'
  },
  
  sellerTier: {
    type: String,
    enum: ['starter', 'growth', 'enterprise', 'api'],
    default: 'starter'
  },

  // Status Flow
  status: {
    type: String,
    enum: [
      'pending',      // Created, waiting for seller acceptance
      'accepted',     // Seller accepted, waiting for payment
      'funded',       // Buyer paid, money in escrow
      'delivered',    // Seller marked as delivered
      'completed',    // Buyer confirmed delivery
      'paid_out',     // Seller received payment
      'cancelled',    // Cancelled by either party
      'disputed'      // In dispute
    ],
    default: 'pending',
    index: true
  },

  // Timeline tracking
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String
  }],

  // Payment details with tier-based fees
  payment: {
    method: {
      type: String,
      enum: ['paystack', 'flutterwave', 'crypto']
    },
    reference: String,
    transactionId: String,
    paymentId: String,
    
    // Amounts
    amount: mongoose.Schema.Types.Decimal128,
    buyerFee: mongoose.Schema.Types.Decimal128,
    sellerFee: mongoose.Schema.Types.Decimal128,
    platformFee: mongoose.Schema.Types.Decimal128,
    buyerPays: mongoose.Schema.Types.Decimal128,
    sellerReceives: mongoose.Schema.Types.Decimal128,
    
    // Fee percentages used (for record keeping)
    buyerFeePercentage: Number,
    sellerFeePercentage: Number,
    
    // Status tracking
    paidAt: Date,
    verifiedAt: Date,
    paidOutAt: Date,
    
    // Gateway response data
    gatewayResponse: mongoose.Schema.Types.Mixed
  },

  // Chat system
  chat: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }],

  // Delivery details with proof system
  delivery: {
    method: {
      type: String,
      enum: ['physical', 'digital', 'service'],
      default: 'physical'
    },
    
    // Delivery proof data
    proof: {
      method: {
        type: String,
        enum: ['courier', 'personal', 'other']
      },
      
      // Courier delivery
      courierName: String,
      trackingNumber: String,
      
      // Personal delivery
      vehicleType: String,
      plateNumber: String,
      driverName: String,
      driverPhoto: String,
      vehiclePhoto: String,
      gpsEnabled: Boolean,
      gpsTrackingId: String,
      
      // Other method
      methodDescription: String,
      
      // Common fields
      estimatedDelivery: Date,
      packagePhotos: [String],
      additionalNotes: String,
      submittedAt: Date,
      submittedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    },
    
    trackingNumber: String,
    deliveredAt: Date,
    confirmedAt: Date,
    autoReleaseAt: Date,
    
    evidence: [{
      type: { type: String },
      url: String,
      uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      uploadedAt: { type: Date, default: Date.now }
    }],
    
    notes: String
  },

  // Dispute management
  dispute: {
    isDisputed: { type: Boolean, default: false },
    raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    raisedAt: Date,
    reason: String,
    evidence: [String],
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved'],
      default: 'pending'
    },
    resolution: String,
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },

  // Payout tracking
  payout: {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount'
    },
    accountNumber: String,
    bankName: String,
    amount: mongoose.Schema.Types.Decimal128,
    transferCode: String,
    paidOut: {
      type: Boolean,
      default: false
    },
    paidOutAt: Date
  },

  // Category
  category: {
    type: String,
    enum: [
      'electronics', 'services', 'digital_goods',
      'fashion', 'automotive', 'real_estate', 'other'
    ],
    default: 'other'
  },

  // Ratings
  rating: {
    buyerRating: {
      score: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: Date
    },
    sellerRating: {
      score: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: Date
    }
  },

  // Chat unlock flag
  chatUnlocked: {
    type: Boolean,
    default: false
  },

  // ✅ NEW: Activity tracking
  isActive: {
    type: Boolean,
    default: true
  },

  // ✅ NEW: Visibility for public deals
  visibility: {
    type: String,
    enum: ['private', 'public'],
    default: 'private'
  }

}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Convert Decimal128 to numbers for JSON
      if (ret.amount) ret.amount = parseFloat(ret.amount.toString());
      if (ret.payment) {
        if (ret.payment.amount) ret.payment.amount = parseFloat(ret.payment.amount.toString());
        if (ret.payment.buyerFee) ret.payment.buyerFee = parseFloat(ret.payment.buyerFee.toString());
        if (ret.payment.sellerFee) ret.payment.sellerFee = parseFloat(ret.payment.sellerFee.toString());
        if (ret.payment.platformFee) ret.payment.platformFee = parseFloat(ret.payment.platformFee.toString());
        if (ret.payment.buyerPays) ret.payment.buyerPays = parseFloat(ret.payment.buyerPays.toString());
        if (ret.payment.sellerReceives) ret.payment.sellerReceives = parseFloat(ret.payment.sellerReceives.toString());
      }
      if (ret.payout && ret.payout.amount) {
        ret.payout.amount = parseFloat(ret.payout.amount.toString());
      }
      
      // Convert attachment file sizes to readable format
      if (ret.attachments) {
        ret.attachments = ret.attachments.map(attachment => ({
          ...attachment,
          sizeReadable: formatFileSize(attachment.size)
        }));
      }
      
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Helper function to format file sizes
function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// INDEXES
escrowSchema.index({ buyer: 1, status: 1 });
escrowSchema.index({ seller: 1, status: 1 });
escrowSchema.index({ createdAt: -1 });
escrowSchema.index({ 'payment.reference': 1 }, { sparse: true });
escrowSchema.index({ visibility: 1, status: 1 }); // ✅ NEW: For public deals

// Generate unique Escrow ID
escrowSchema.pre('save', function(next) {
  if (!this.escrowId) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.escrowId = `ESC${timestamp}${random}`;
  }
  next();
});

// Prevent buyer = seller
escrowSchema.pre('validate', function(next) {
  if (this.buyer && this.seller && this.buyer.equals(this.seller)) {
    return next(new Error('Buyer and Seller cannot be the same user'));
  }
  next();
});

// Track status changes in timeline
escrowSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

// Virtuals
escrowSchema.virtual('isCompleted').get(function() {
  return ['completed', 'paid_out'].includes(this.status);
});

escrowSchema.virtual('isActive').get(function() {
  return !['cancelled', 'disputed', 'paid_out', 'completed'].includes(this.status);
});

escrowSchema.virtual('canBeFunded').get(function() {
  return this.status === 'accepted' || this.status === 'pending';
});

escrowSchema.virtual('canBeDelivered').get(function() {
  return this.status === 'funded';
});

// ✅ NEW: Virtual for attachment count
escrowSchema.virtual('attachmentsCount').get(function() {
  return this.attachments ? this.attachments.length : 0;
});

// ✅ NEW: Method to add attachment
escrowSchema.methods.addAttachment = function(fileData, uploadedBy) {
  this.attachments.push({
    filename: fileData.filename,
    originalName: fileData.originalname,
    url: fileData.path || fileData.location,
    mimetype: fileData.mimetype,
    size: fileData.size,
    uploadedBy: uploadedBy,
    uploadedAt: new Date()
  });
  return this.save();
};

// ✅ NEW: Method to remove attachment
escrowSchema.methods.removeAttachment = function(attachmentId) {
  this.attachments = this.attachments.filter(att => att._id.toString() !== attachmentId);
  return this.save();
};

module.exports = mongoose.model('Escrow', escrowSchema);