const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'escrow_created',
      'escrow_accepted',
      'escrow_funded',
      'escrow_delivered',
      'escrow_completed',
      'escrow_cancelled',
      'dispute_raised',
      'dispute_resolved',
      'message_received',
      'payment_received'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  link: String, // URL to relevant page
  metadata: {
    escrowId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Escrow'
    },
    amount: Number,
    otherParty: String
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, { timestamps: true });

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
