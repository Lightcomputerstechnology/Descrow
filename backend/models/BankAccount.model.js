// backend/models/BankAccount.model.js

const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    accountName: {
      type: String,
      required: true,
      trim: true
    },

    accountNumber: {
      type: String,
      required: true,
      trim: true
    },

    bankName: {
      type: String,
      required: true
    },

    bankCode: {
      type: String,
      required: true
    },

    currency: {
      type: String,
      default: 'NGN'
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    isPrimary: {
      type: Boolean,
      default: false
    },

    verificationData: {
      verifiedAt: Date,
      verificationMethod: String,
      verificationResponse: mongoose.Schema.Types.Mixed
    }
  },
  {
    timestamps: true
  }
);

// ------------------------------------------------------
// Ensure only ONE primary bank account per user
// ------------------------------------------------------
bankAccountSchema.pre('save', async function (next) {
  if (this.isPrimary) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isPrimary: false }
    );
  }
  next();
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);
