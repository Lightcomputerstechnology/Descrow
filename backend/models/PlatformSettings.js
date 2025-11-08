const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  fees: {
    percentage: {
      type: Number,
      default: 2.5 // Total fee percentage
    },
    buyerShare: {
      type: Number,
      default: 50 // 50% = 1.25%
    },
    sellerShare: {
      type: Number,
      default: 50 // 50% = 1.25%
    },
    minimumFee: {
      type: Number,
      default: 0.50
    },
    maximumPercentage: {
      type: Number,
      default: 2.5
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  maintenance: {
    enabled: {
      type: Boolean,
      default: false
    },
    message: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, { timestamps: true });

// Singleton pattern - only one settings document
platformSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);
