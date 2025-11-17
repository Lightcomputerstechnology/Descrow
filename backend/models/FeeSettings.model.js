const mongoose = require('mongoose');

const feeSettingsSchema = new mongoose.Schema({
  // Tier fees
  tiers: {
    starter: {
      fees: {
        NGN: {
          buyer: { type: Number, default: 0.03 },
          seller: { type: Number, default: 0.03 }
        },
        USD: {
          buyer: { type: Number, default: 0.035 },
          seller: { type: Number, default: 0.035 }
        },
        crypto: {
          buyer: { type: Number, default: 0.0175 },
          seller: { type: Number, default: 0.0175 }
        }
      },
      monthlyCost: {
        NGN: { type: Number, default: 0 },
        USD: { type: Number, default: 0 }
      },
      maxTransactionAmount: {
        NGN: { type: Number, default: 50000 },
        USD: { type: Number, default: 500 }
      },
      maxTransactionsPerMonth: { type: Number, default: 10 }
    },
    
    growth: {
      fees: {
        NGN: {
          buyer: { type: Number, default: 0.025 },
          seller: { type: Number, default: 0.025 }
        },
        USD: {
          buyer: { type: Number, default: 0.03 },
          seller: { type: Number, default: 0.03 }
        },
        crypto: {
          buyer: { type: Number, default: 0.0125 },
          seller: { type: Number, default: 0.0125 }
        }
      },
      monthlyCost: {
        NGN: { type: Number, default: 5000 },
        USD: { type: Number, default: 10 }
      },
      maxTransactionAmount: {
        NGN: { type: Number, default: 500000 },
        USD: { type: Number, default: 5000 }
      },
      maxTransactionsPerMonth: { type: Number, default: 50 }
    },
    
    enterprise: {
      fees: {
        NGN: {
          buyer: { type: Number, default: 0.0225 },
          seller: { type: Number, default: 0.0225 }
        },
        USD: {
          buyer: { type: Number, default: 0.0275 },
          seller: { type: Number, default: 0.0275 }
        },
        crypto: {
          buyer: { type: Number, default: 0.009 },
          seller: { type: Number, default: 0.009 }
        }
      },
      monthlyCost: {
        NGN: { type: Number, default: 15000 },
        USD: { type: Number, default: 30 }
      },
      maxTransactionAmount: {
        NGN: { type: Number, default: -1 }, // Unlimited
        USD: { type: Number, default: -1 }
      },
      maxTransactionsPerMonth: { type: Number, default: -1 }
    },
    
    api: {
      fees: {
        NGN: {
          buyer: { type: Number, default: 0.02 },
          seller: { type: Number, default: 0.02 }
        },
        USD: {
          buyer: { type: Number, default: 0.025 },
          seller: { type: Number, default: 0.025 }
        },
        crypto: {
          buyer: { type: Number, default: 0.0075 },
          seller: { type: Number, default: 0.0075 }
        }
      },
      monthlyCost: {
        NGN: { type: Number, default: 50000 },
        USD: { type: Number, default: 100 }
      },
      setupFee: {
        NGN: { type: Number, default: 100000 },
        USD: { type: Number, default: 200 }
      },
      maxTransactionAmount: {
        NGN: { type: Number, default: -1 },
        USD: { type: Number, default: -1 }
      },
      maxTransactionsPerMonth: { type: Number, default: -1 }
    }
  },

  // Gateway costs (what platform pays)
  gatewayCosts: {
    paystack: {
      NGN: {
        percentage: { type: Number, default: 0.015 },
        flatFee: { type: Number, default: 100 },
        cap: { type: Number, default: 2000 }
      },
      USD: {
        percentage: { type: Number, default: 0.039 },
        flatFee: { type: Number, default: 100 }
      },
      transferFee: {
        small: { type: Number, default: 10 },
        medium: { type: Number, default: 25 },
        large: { type: Number, default: 50 }
      }
    },
    flutterwave: {
      NGN: {
        percentage: { type: Number, default: 0.014 },
        flatFee: { type: Number, default: 0 }
      },
      USD: {
        percentage: { type: Number, default: 0.038 },
        flatFee: { type: Number, default: 0 }
      },
      transferFee: { type: Number, default: 0 }
    },
    crypto: {
      percentage: { type: Number, default: 0.005 },
      flatFee: { type: Number, default: 0 },
      transferFee: { type: Number, default: 0 }
    }
  },

  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  version: {
    type: Number,
    default: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// ✅ Ensure only one active fee settings document
feeSettingsSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model('FeeSettings', feeSettingsSchema);
