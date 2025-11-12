// backend/models/Escrow.model.js - PRODUCTION READY
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
    enum: ['USD', 'EUR', 'GBP', 'NGN', 'KES', 'GHS', 'ZAR']
  },

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

  // ✅ FIXED: Proper Status Flow
  status: {
    type: String,
    enum: [
      'pending',      // Created, waiting for seller acceptance
      'accepted',     // Seller accepted, waiting for payment
      'funded',       // ✅ Buyer paid, money in escrow
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

  // ✅ ENHANCED: Payment details with proper fee tracking
  payment: {
    method: {
      type: String,
      enum: ['paystack', 'flutterwave', 'crypto']
    },
    reference: String, // Payment reference (unique per transaction)
    transactionId: String, // Gateway transaction ID
    paymentId: String, // For crypto (Nowpayments payment_id)
    
    // Amounts
    amount: mongoose.Schema.Types.Decimal128,           // Original item amount
    buyerFee: mongoose.Schema.Types.Decimal128,         // 2% buyer fee
    sellerFee: mongoose.Schema.Types.Decimal128,        // 1% seller fee
    platformFee: mongoose.Schema.Types.Decimal128,      // Total 3% platform fee
    buyerPays: mongoose.Schema.Types.Decimal128,        // Amount + buyer fee
    sellerReceives: mongoose.Schema.Types.Decimal128,   // Amount - seller fee
    
    // Status tracking
    paidAt: Date,
    verifiedAt: Date,
    paidOutAt: Date,
    
    // Gateway response data
    gatewayResponse: mongoose.Schema.Types.Mixed
  },

  // Delivery details
  delivery: {
    method: {
      type: String,
      enum: ['physical', 'digital', 'service'],
      default: 'physical'
    },
    trackingNumber: String,
    deliveredAt: Date,
    confirmedAt: Date,
    autoReleaseAt: Date, // Auto-release funds after X days
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

  // ✅ NEW: Chat unlock flag
  chatUnlocked: {
    type: Boolean,
    default: false
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
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// ──────────────────────────────
// INDEXES
// ──────────────────────────────
escrowSchema.index({ buyer: 1, status: 1 });
escrowSchema.index({ seller: 1, status: 1 });
escrowSchema.index({ createdAt: -1 });
escrowSchema.index({ 'payment.reference': 1 }, { sparse: true });

// ──────────────────────────────
// PRE-SAVE HOOKS
// ──────────────────────────────

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

// ✅ ENHANCED: Calculate fees properly
escrowSchema.pre('save', function(next) {
  if (this.isModified('amount') && !this.payment?.platformFee) {
    const amount = parseFloat(this.amount.toString());
    
    // Fee structure: Buyer pays 2%, Seller pays 1%, Platform earns 3%
    const buyerFee = amount * 0.02;
    const sellerFee = amount * 0.01;
    const platformFee = buyerFee + sellerFee;
    
    this.payment = {
      ...this.payment,
      amount: this.amount,
      buyerFee: mongoose.Types.Decimal128.fromString(buyerFee.toFixed(2)),
      sellerFee: mongoose.Types.Decimal128.fromString(sellerFee.toFixed(2)),
      platformFee: mongoose.Types.Decimal128.fromString(platformFee.toFixed(2)),
      buyerPays: mongoose.Types.Decimal128.fromString((amount + buyerFee).toFixed(2)),
      sellerReceives: mongoose.Types.Decimal128.fromString((amount - sellerFee).toFixed(2))
    };
  }
  next();
});

// ──────────────────────────────
// VIRTUALS
// ──────────────────────────────
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

module.exports = mongoose.model('Escrow', escrowSchema);