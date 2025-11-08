const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  escrow: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escrow',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text'
  },
  message: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  attachments: [{
    url: String,  // File link
    name: String,
    size: Number, // Bytes
    mimetype: String
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date
}, { timestamps: true });

// Indexing
chatSchema.index({ escrow: 1, createdAt: -1 });
chatSchema.index({ sender: 1 });
chatSchema.index({ receiver: 1 });

// Virtual: chat room ID
chatSchema.virtual('chatRoom').get(function() {
  return `escrow_${this.escrow}`;
});

// Pre-save: mark system messages
chatSchema.pre('save', function(next) {
  if (!this.sender) {
    this.type = 'system';
  }
  next();
});

module.exports = mongoose.model('Chat', chatSchema);