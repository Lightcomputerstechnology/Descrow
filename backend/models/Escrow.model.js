const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
  escrowId: {
    type: String,
    unique: true,
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  itemDescription: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  adminFee: {
    type: Number,
    required: true // Fee deducted immediately when escrow is funded
  },
  netAmount: {
    type: Number,
    required: true // Amount after admin fee deduction (amount - adminFee)
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'NGN', 'CNY', 'JPY', 'AUD', 'CAD', 'INR', 'ZAR']
  },
  status: {
    type: String,
    enum: ['in_escrow', 'awaiting_delivery', 'completed', 'disputed', 'cancelled', 'refunded'],
    default: 'in_escrow'
  },
  paymentMethod: {
    type: String,
    enum: ['flutterwave', 'paystack', 'nowpayments', 'bank_transfer'],
    required: true
  },
  paymentReference: {
    type: String // Payment gateway reference
  },
  deliveryProof: {
    method: {
      type: String,
      enum: ['courier', 'personal', 'other']
    },
    courierName: String,
    trackingNumber: String,
    vehicleType: String,
    plateNumber: String,
    driverName: String,
    methodDescription: String,
    estimatedDelivery: Date,
    photos: [String], // URLs to delivery photos
    gpsEnabled: {
      type: Boolean,
      default: false
    },
    gpsCoordinates: [{
      lat: Number,
      lng: Number,
      timestamp: Date
    }]
  },
  deliverySignature: {
    type: {
      type: String,
      enum: ['drawn', 'typed', 'photo']
    },
    data: String, // Base64 or URL
    timestamp: Date
  },
  autoReleaseDate: {
    type: Date // 3 days after delivery date
  },
  chatUnlocked: {
    type: Boolean,
    default: false
  },
  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute'
  }
}, {
  timestamps: true
});

// Generate unique escrow ID
escrowSchema.pre('save', async function(next) {
  if (!this.escrowId) {
    this.escrowId = 'ESC' + Date.now() + Math.floor(Math.random() * 1000);
  }
  next();
});

// Auto-release payment after 3 days
escrowSchema.methods.setAutoReleaseDate = function() {
  if (this.deliveryProof && this.deliveryProof.estimatedDelivery) {
    const deliveryDate = new Date(this.deliveryProof.estimatedDelivery);
    this.autoReleaseDate = new Date(deliveryDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // +3 days
  }
};const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
  escrowId: {
    type: String,
    unique: true,
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  itemDescription: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  adminFee: {
    type: Number,
    required: true,
    min: 0
  },
  netAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'NGN'],
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending_payment', 'in_escrow', 'awaiting_delivery', 'completed', 'cancelled', 'disputed'],
    default: 'pending_payment'
  },
  paymentMethod: {
    type: String,
    enum: ['paystack', 'flutterwave', 'crypto'],
    required: true
  },
  paymentReference: {
    type: String
  },
  nowpaymentsId: {
    type: String
  },
  paymentVerifiedAt: {
    type: Date
  },
  chatUnlocked: {
    type: Boolean,
    default: false
  },
  deliveryProof: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    proofImages: [String],
    notes: String,
    uploadedAt: Date,
    trackingUpdates: [{
      status: String,
      location: String,
      timestamp: Date
    }]
  },
  deliverySignature: {
    signatureData: String,
    timestamp: Date
  },
  autoReleaseDate: {
    type: Date
  },
  dispute: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute'
  }
}, {
  timestamps: true
});

// Generate unique escrow ID before saving
escrowSchema.pre('save', async function(next) {
  if (!this.escrowId) {
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    this.escrowId = `ESC${Date.now()}${randomStr}`;
  }
  next();
});

module.exports = mongoose.model('Escrow', escrowSchema);

module.exports = mongoose.model('Escrow', escrowSchema);
