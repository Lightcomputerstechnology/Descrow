const mongoose = require('mongoose');

// Create schema
const escrowSchema = new mongoose.Schema({
  // Unique Escrow ID (for reference in invoices, UI, etc.)
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
    enum: ['USD', 'EUR', 'GBP', 'NGN']
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

  // Status Flow
  status: {
    type: String,
    enum: [
      'pending',      // Buyer created, waiting for seller
      'accepted',     // Seller accepted
      'funded',       // Buyer paid
      'delivered',    // Seller delivered
      'completed',    // Buyer confirmed
      'paid_out',     // Seller paid
      'cancelled',    // Cancelled
      'disputed'      // In dispute
    ],
    default: 'pending',
    index: true
  },

  // Timeline tracking (history)
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    note: String
  }],

  // Payment details
  payment: {
    method: String,
    transactionId: String,
    paidAt: Date,
    amount: mongoose.Schema.Types.Decimal128,   // Original amount
    buyerPays: mongoose.Schema.Types.Decimal128, // Amount + buyer fee
    sellerReceives: mongoose.Schema.Types.Decimal128, // Amount - seller fee
    platformFee: mongoose.Schema.Types.Decimal128, // Total fee
    buyerFee: mongoose.Schema.Types.Decimal128,
    sellerFee: mongoose.Schema.Types.Decimal128
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
    evidence: [{
      type: { type: String }, // 'image', 'document', 'link'
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
    evidence: [String], // URLs
    status: {
      type: String,
      enum: ['pending', 'under_review', 'resolved'],
      default: 'pending'
    },
    resolution: String,
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
  },

  // Category and metadata
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
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});


// ──────────────────────────────
// INDEXES
// ──────────────────────────────
escrowSchema.index({ buyer: 1, status: 1 });
escrowSchema.index({ seller: 1, status: 1 });
escrowSchema.index({ createdAt: -1 });

// ──────────────────────────────
// PRE-SAVE HOOKS
// ──────────────────────────────

// Generate unique Escrow ID
escrowSchema.pre('save', function(next) {
  if (!this.escrowId) {
    this.escrowId = 'ESC' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

// Prevent buyer = seller
escrowSchema.pre('validate', function(next) {
  if (this.buyer && this.seller && this.buyer.equals(this.seller)) {
    return next(new Error('Buyer and Seller cannot be the same user.'));
  }
  next();
});

// Track status changes in timeline
escrowSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.timeline.push({
      status: this.status,
      timestamp: new Date(),
      actor: this.buyer // default; controller can overwrite
    });
  }
  next();
});

// Auto fee calculation (optional business logic)
escrowSchema.pre('save', function(next) {
  if (this.isModified('amount') && !this.payment.platformFee) {
    const amount = parseFloat(this.amount.toString());
    const buyerFee = amount * 0.02;
    const sellerFee = amount * 0.01;
    this.payment = {
      ...this.payment,
      buyerFee,
      sellerFee,
      platformFee: buyerFee + sellerFee,
      buyerPays: amount + buyerFee,
      sellerReceives: amount - sellerFee
    };
  }
  next();
});

// ──────────────────────────────
// VIRTUALS
// ──────────────────────────────

// Example: quick status check for UI
escrowSchema.virtual('isCompleted').get(function() {
  return ['completed', 'paid_out'].includes(this.status);
});

escrowSchema.virtual('isActive').get(function() {
  return !['cancelled', 'disputed', 'paid_out'].includes(this.status);
});


// Export model
module.exports = mongoose.model('Escrow', escrowSchema);