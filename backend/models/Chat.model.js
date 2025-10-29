const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  escrow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escrow',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image'],
    default: 'text'
  },
  fileUrl: {
    type: String // For file/image messages
  },
  fileName: {
    type: String
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ escrow: 1, createdAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);
