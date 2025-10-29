const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  disputeId: {
    type: String,
    unique: true,
    required: true
  },
  escrow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escrow',
    required: true
  },
  filedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: ['not_received', 'wrong_item', 'damaged', 'not_as_described', 'counterfeit', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    minlength: [50, 'Description must be at least 50 characters']
  },
  evidence: [{
    type: String, // URLs to uploaded files
    filename: String,
    uploadedAt: Date
  }],
  status: {
    type: String,
    enum: ['pending', 'under_review', 'resolved', 'rejected'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  resolution: {
    decision: {
      type: String,
      enum: ['refund_to_buyer', 'release_to_seller', 'partial_refund', 'reject_dispute']
    },
    amount: Number, // For partial refunds
    notes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    resolvedAt: Date
  }
}, {
  timestamps: true
});

// Generate unique dispute ID
disputeSchema.pre('save', async function(next) {
  if (!this.disputeId) {
    this.disputeId = 'DIS' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model('Dispute', disputeSchema);
