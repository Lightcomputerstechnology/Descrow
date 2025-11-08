const mongoose = require('mongoose');

const twoFactorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  enabled: {
    type: Boolean,
    default: false
  },
  secret: {
    type: String,
    required: true
  },
  backupCodes: [{
    code: String,
    used: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],
  trustedDevices: [{
    deviceId: String,
    deviceName: String,
    lastUsed: Date,
    expiresAt: Date
  }],
  lastVerified: Date
}, { timestamps: true });

module.exports = mongoose.model('TwoFactor', twoFactorSchema);
