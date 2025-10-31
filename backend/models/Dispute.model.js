const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  escrow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escrow',
    required: true,
    unique: true
  },
  initiatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  evidence: [String],
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved'],
    default: 'open'
  },
  responses: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    evidence: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  resolution: {
    type: String
  },
  winner: {
    type: String,
    enum: ['buyer', 'seller']
  },
  refundAmount: {
    type: Number
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  resolvedAt: {
    type: Date
  },
  adminNotes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Dispute', disputeSchema);
