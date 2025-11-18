// backend/config/fee.config.js - UPDATED FOR FRONTEND COMPATIBILITY

const FeeSettings = require('../models/FeeSettings.model');

// ======================================================
//           DATABASE INTEGRATION FUNCTIONS
// ======================================================

async function getActiveFeeSettings() {
  try {
    let settings = await FeeSettings.findOne({ isActive: true });
    if (!settings) {
      settings = await FeeSettings.create({ isActive: true });
    }
    return settings;
  } catch (error) {
    console.error('Error fetching fee settings from database:', error);
    return null;
  }
}

// ======================================================
//                UPDATED FEE TIERS WITH ALL CURRENCIES
// ======================================================

const FALLBACK_TIERS = {
  starter: {
    name: 'Starter',
    monthlyCost: { NGN: 0, USD: 0 },
    setupFee: { NGN: 0, USD: 0 },
    maxTransactionAmount: { NGN: 50000, USD: 500 },
    maxTransactionsPerMonth: 10,

    fees: {
      NGN: { buyer: 0.03, seller: 0.03 },
      USD: { buyer: 0.035, seller: 0.035 },
      EUR: { buyer: 0.035, seller: 0.035 },
      GBP: { buyer: 0.035, seller: 0.035 },
      CAD: { buyer: 0.035, seller: 0.035 },
      AUD: { buyer: 0.035, seller: 0.035 },
      KES: { buyer: 0.04, seller: 0.04 },
      GHS: { buyer: 0.04, seller: 0.04 },
      ZAR: { buyer: 0.04, seller: 0.04 },
      XOF: { buyer: 0.045, seller: 0.045 },
      XAF: { buyer: 0.045, seller: 0.045 },
      crypto: { buyer: 0.0175, seller: 0.0175 }
    },

    features: [
      'Standard processing',
      'Basic support',
      '10 transactions per month',
      'Max ₦50,000 / $500 per transaction'
    ]
  },

  growth: {
    name: 'Growth',
    monthlyCost: { NGN: 5000, USD: 10 },
    setupFee: { NGN: 0, USD: 0 },
    maxTransactionAmount: { NGN: 500000, USD: 5000 },
    maxTransactionsPerMonth: 50,

    fees: {
      NGN: { buyer: 0.025, seller: 0.025 },
      USD: { buyer: 0.03, seller: 0.03 },
      EUR: { buyer: 0.03, seller: 0.03 },
      GBP: { buyer: 0.03, seller: 0.03 },
      CAD: { buyer: 0.03, seller: 0.03 },
      AUD: { buyer: 0.03, seller: 0.03 },
      KES: { buyer: 0.035, seller: 0.035 },
      GHS: { buyer: 0.035, seller: 0.035 },
      ZAR: { buyer: 0.035, seller: 0.035 },
      XOF: { buyer: 0.04, seller: 0.04 },
      XAF: { buyer: 0.04, seller: 0.04 },
      crypto: { buyer: 0.0125, seller: 0.0125 }
    },

    features: [
      'Fast processing',
      'Priority support',
      '50 transactions per month',
      'Max ₦500,000 / $5,000 per transaction',
      'Lower fees than Starter'
    ]
  },

  enterprise: {
    name: 'Enterprise',
    monthlyCost: { NGN: 15000, USD: 30 },
    setupFee: { NGN: 0, USD: 0 },
    maxTransactionAmount: { NGN: -1, USD: -1 },
    maxTransactionsPerMonth: -1,

    fees: {
      NGN: { buyer: 0.0225, seller: 0.0225 },
      USD: { buyer: 0.0275, seller: 0.0275 },
      EUR: { buyer: 0.0275, seller: 0.0275 },
      GBP: { buyer: 0.0275, seller: 0.0275 },
      CAD: { buyer: 0.0275, seller: 0.0275 },
      AUD: { buyer: 0.0275, seller: 0.0275 },
      KES: { buyer: 0.0325, seller: 0.0325 },
      GHS: { buyer: 0.0325, seller: 0.0325 },
      ZAR: { buyer: 0.0325, seller: 0.0325 },
      XOF: { buyer: 0.0375, seller: 0.0375 },
      XAF: { buyer: 0.0375, seller: 0.0375 },
      crypto: { buyer: 0.009, seller: 0.009 }
    },

    features: [
      'Instant processing',
      'Premium support',
      'Unlimited transactions',
      'Unlimited transaction amounts',
      'Dedicated account manager',
      'Lowest fees'
    ]
  },

  api: {
    name: 'API Tier',
    monthlyCost: { NGN: 50000, USD: 100 },
    setupFee: { NGN: 100000, USD: 200 },
    maxTransactionAmount: { NGN: -1, USD: -1 },
    maxTransactionsPerMonth: -1,

    fees: {
      NGN: { buyer: 0.02, seller: 0.02 },
      USD: { buyer: 0.025, seller: 0.025 },
      EUR: { buyer: 0.025, seller: 0.025 },
      GBP: { buyer: 0.025, seller: 0.025 },
      CAD: { buyer: 0.025, seller: 0.025 },
      AUD: { buyer: 0.025, seller: 0.025 },
      KES: { buyer: 0.03, seller: 0.03 },
      GHS: { buyer: 0.03, seller: 0.03 },
      ZAR: { buyer: 0.03, seller: 0.03 },
      XOF: { buyer: 0.035, seller: 0.035 },
      XAF: { buyer: 0.035, seller: 0.035 },
      crypto: { buyer: 0.0075, seller: 0.0075 }
    },

    features: [
      'Full API access',
      'Webhook support',
      'White-label option',
      'Custom integration support',
      'Dedicated account manager',
      'Priority processing',
      'Bulk transaction support',
      'Developer documentation'
    ]
  }
};

// ======================================================
//           UPDATED GATEWAY COSTS WITH ALL CURRENCIES
// ======================================================

const FALLBACK_GATEWAY_COSTS = {
  paystack: {
    NGN: { percentage: 0.015, flatFee: 100, cap: 2000 },
    USD: { percentage: 0.039, flatFee: 100 },
    EUR: { percentage: 0.039, flatFee: 100 },
    GBP: { percentage: 0.039, flatFee: 100 },
    CAD: { percentage: 0.039, flatFee: 100 },
    AUD: { percentage: 0.039, flatFee: 100 },
    KES: { percentage: 0.035, flatFee: 50 },
    GHS: { percentage: 0.035, flatFee: 50 },
    ZAR: { percentage: 0.035, flatFee: 50 },
    XOF: { percentage: 0.04, flatFee: 100 },
    XAF: { percentage: 0.04, flatFee: 100 },
    transferFee: {
      small: 10,
      medium: 25,
      large: 50
    }
  },

  flutterwave: {
    NGN: { percentage: 0.014, flatFee: 0 },
    USD: { percentage: 0.038, flatFee: 0 },
    EUR: { percentage: 0.038, flatFee: 0 },
    GBP: { percentage: 0.038, flatFee: 0 },
    CAD: { percentage: 0.038, flatFee: 0 },
    AUD: { percentage: 0.038, flatFee: 0 },
    KES: { percentage: 0.032, flatFee: 0 },
    GHS: { percentage: 0.032, flatFee: 0 },
    ZAR: { percentage: 0.032, flatFee: 0 },
    XOF: { percentage: 0.036, flatFee: 0 },
    XAF: { percentage: 0.036, flatFee: 0 },
    transferFee: 0
  },

  crypto: {
    percentage: 0.005,
    flatFee: 0,
    transferFee: 0
  }
};

// ======================================================
//                    MAIN EXPORTS
// ======================================================

module.exports = {
  tiers: FALLBACK_TIERS,
  gatewayCosts: FALLBACK_GATEWAY_COSTS,

  // ======================================================
  //        CALCULATE FEES - FRONTEND COMPATIBLE VERSION
  // ======================================================
  calculateFees: async function(amount, currency, userTier = 'starter', paymentMethod = 'flutterwave') {
    const settings = await getActiveFeeSettings();
    
    // Get tier data from database or fallback
    const tierData = settings ? settings.tiers[userTier] : FALLBACK_TIERS[userTier] || FALLBACK_TIERS.starter;
    const gatewayCostData = settings ? settings.gatewayCosts : FALLBACK_GATEWAY_COSTS;
    
    // Use USD as fallback for any currency not explicitly defined
    const fees = tierData.fees[currency] || tierData.fees.USD;
    
    const baseAmount = parseFloat(amount);
    
    // Calculate buyer and seller fees
    const buyerFee = baseAmount * fees.buyer;
    const sellerFee = baseAmount * fees.seller;
    const buyerPays = baseAmount + buyerFee;
    const sellerReceives = baseAmount - sellerFee;
    const totalPlatformFee = buyerFee + sellerFee;
    
    // Calculate gateway costs
    let gatewayCost = 0;
    let gatewayIncoming = 0;
    let gatewayOutgoing = 0;
    
    if (paymentMethod === 'paystack') {
      const costs = gatewayCostData.paystack[currency] || gatewayCostData.paystack.USD;
      gatewayIncoming = (buyerPays * costs.percentage) + costs.flatFee;
      
      if (currency === 'NGN' && costs.cap) {
        gatewayIncoming = Math.min(gatewayIncoming, costs.cap);
      }
      
      if (sellerReceives <= 5000) {
        gatewayOutgoing = gatewayCostData.paystack.transferFee.small;
      } else if (sellerReceives <= 50000) {
        gatewayOutgoing = gatewayCostData.paystack.transferFee.medium;
      } else {
        gatewayOutgoing = gatewayCostData.paystack.transferFee.large;
      }
      
      gatewayCost = gatewayIncoming + gatewayOutgoing;
      
    } else if (paymentMethod === 'flutterwave') {
      const costs = gatewayCostData.flutterwave[currency] || gatewayCostData.flutterwave.USD;
      gatewayIncoming = buyerPays * costs.percentage;
      gatewayOutgoing = gatewayCostData.flutterwave.transferFee;
      gatewayCost = gatewayIncoming + gatewayOutgoing;
      
    } else if (paymentMethod === 'crypto') {
      gatewayIncoming = buyerPays * gatewayCostData.crypto.percentage;
      gatewayOutgoing = 0;
      gatewayCost = gatewayIncoming;
    }
    
    const platformProfit = totalPlatformFee - gatewayCost;
    const profitPercentage = (platformProfit / baseAmount) * 100;
    
    // Return frontend-compatible response
    return {
      // Core fields needed by frontend
      amount: parseFloat(baseAmount.toFixed(2)),
      buyerFee: parseFloat(buyerFee.toFixed(2)),
      sellerFee: parseFloat(sellerFee.toFixed(2)),
      buyerPays: parseFloat(buyerPays.toFixed(2)),
      sellerReceives: parseFloat(sellerReceives.toFixed(2)),
      buyerFeePercentage: parseFloat((fees.buyer * 100).toFixed(2)),
      sellerFeePercentage: parseFloat((fees.seller * 100).toFixed(2)),
      
      // Additional backend fields
      tier: userTier,
      currency,
      paymentMethod,
      totalPlatformFee: parseFloat(totalPlatformFee.toFixed(2)),
      totalFeePercentage: parseFloat(((fees.buyer + fees.seller) * 100).toFixed(2)),
      gatewayIncoming: parseFloat(gatewayIncoming.toFixed(2)),
      gatewayOutgoing: parseFloat(gatewayOutgoing.toFixed(2)),
      totalGatewayCost: parseFloat(gatewayCost.toFixed(2)),
      platformProfit: parseFloat(platformProfit.toFixed(2)),
      profitPercentage: parseFloat(profitPercentage.toFixed(2)),
      
      breakdown: {
        buyerFeeDescription: `${(fees.buyer * 100).toFixed(2)}% escrow protection fee`,
        sellerFeeDescription: `${(fees.seller * 100).toFixed(2)}% platform service fee`,
        totalFeeDescription: `${((fees.buyer + fees.seller) * 100).toFixed(2)}% combined fee covers ALL costs`,
        note: 'Both buyer and seller equally protected. No hidden fees.'
      }
    };
  },

  // ======================================================
  //           SIMPLIFIED CALCULATION FOR FRONTEND
  // ======================================================
  calculateSimpleFees: async function(amount, currency) {
    // Default to starter tier for frontend compatibility
    return await this.calculateFees(amount, currency, 'starter', 'flutterwave');
  },

  // ======================================================
  //           GET TIER INFO (DATABASE-FIRST)
  // ======================================================
  getTierInfo: async function(tierName) {
    const settings = await getActiveFeeSettings();
    if (settings && settings.tiers[tierName]) {
      return settings.tiers[tierName];
    }
    return FALLBACK_TIERS[tierName] || FALLBACK_TIERS.starter;
  },

  // ======================================================
  //           GET ALL TIERS (DATABASE-FIRST)
  // ======================================================
  getAllTiers: async function() {
    const settings = await getActiveFeeSettings();
    if (settings) {
      return Object.keys(settings.tiers).map(key => ({
        id: key,
        ...settings.tiers[key].toObject()
      }));
    }
    return Object.keys(FALLBACK_TIERS).map(key => ({
      id: key,
      ...FALLBACK_TIERS[key]
    }));
  },

  // ======================================================
  //          AMOUNT WITHIN LIMIT (DATABASE-FIRST)
  // ======================================================
  isAmountWithinLimit: async function(amount, currency, tierName) {
    const tierInfo = await this.getTierInfo(tierName);
    const limit = tierInfo.maxTransactionAmount[currency] || tierInfo.maxTransactionAmount.USD;
    if (limit === -1) return true;
    return amount <= limit;
  },

  // ======================================================
  //               UPGRADE BENEFITS
  // ======================================================
  getUpgradeBenefits: async function(currentTier, targetTier) {
    const current = await this.getTierInfo(currentTier);
    const target = await this.getTierInfo(targetTier);

    if (!current || !target) return null;

    return {
      currentTier,
      targetTier,
      monthlyCostDifference: {
        NGN: target.monthlyCost.NGN - current.monthlyCost.NGN,
        USD: target.monthlyCost.USD - current.monthlyCost.USD
      },
      feeReduction: {
        NGN: {
          buyer: `${((current.fees.NGN.buyer - target.fees.NGN.buyer) * 100).toFixed(2)}%`,
          seller: `${((current.fees.NGN.seller - target.fees.NGN.seller) * 100).toFixed(2)}%`
        },
        USD: {
          buyer: `${((current.fees.USD.buyer - target.fees.USD.buyer) * 100).toFixed(2)}%`,
          seller: `${((current.fees.USD.seller - target.fees.USD.seller) * 100).toFixed(2)}%`
        }
      },
      newFeatures: target.features.filter(f => !current.features.includes(f)),
      transactionLimitIncrease: {
        amount: {
          NGN: target.maxTransactionAmount.NGN === -1
            ? 'Unlimited'
            : `₦${target.maxTransactionAmount.NGN.toLocaleString()}`,
          USD: target.maxTransactionAmount.USD === -1
            ? 'Unlimited'
            : `$${target.maxTransactionAmount.USD.toLocaleString()}`
        },
        monthly: target.maxTransactionsPerMonth === -1
          ? 'Unlimited'
          : target.maxTransactionsPerMonth
      }
    };
  },

  // ======================================================
  //              MONTHLY SAVINGS CALCULATOR
  // ======================================================
  calculateMonthlySavings: async function(monthlyVolume, currency, currentTier, targetTier) {
    const currentFees = await this.calculateFees(monthlyVolume, currency, currentTier);
    const targetFees = await this.calculateFees(monthlyVolume, currency, targetTier);

    const currentTotal = currentFees.totalPlatformFee;
    const targetTotal = targetFees.totalPlatformFee;
    const savings = currentTotal - targetTotal;

    const targetTierInfo = await this.getTierInfo(targetTier);
    const targetMonthlyCost = targetTierInfo.monthlyCost[currency] || targetTierInfo.monthlyCost.USD;

    const netSavings = savings - targetMonthlyCost;

    return {
      currentFees: currentTotal,
      targetFees: targetTotal,
      grossSavings: parseFloat(savings.toFixed(2)),
      subscriptionCost: targetMonthlyCost,
      netSavings: parseFloat(netSavings.toFixed(2)),
      worthUpgrading: netSavings > 0,
      breakEvenVolume:
        (targetMonthlyCost /
          (currentFees.totalFeePercentage - targetFees.totalFeePercentage)) *
        100
    };
  },

  // ======================================================
  //               FEE EXPLANATION
  // ======================================================
  getFeeExplanation: async function(currency, tierName = 'starter') {
    const tier = await this.getTierInfo(tierName);
    const fees = tier.fees[currency] || tier.fees.USD;

    const buyerPercent = (fees.buyer * 100).toFixed(2);
    const sellerPercent = (fees.seller * 100).toFixed(2);
    const totalPercent = ((fees.buyer + fees.seller) * 100).toFixed(2);

    const examples = {
      NGN: {
        amount: 10000,
        buyerFee: (10000 * fees.buyer).toFixed(0),
        sellerFee: (10000 * fees.seller).toFixed(0),
        buyerPays: (10000 * (1 + fees.buyer)).toFixed(0),
        sellerReceives: (10000 * (1 - fees.seller)).toFixed(0)
      },
      USD: {
        amount: 100,
        buyerFee: (100 * fees.buyer).toFixed(2),
        sellerFee: (100 * fees.seller).toFixed(2),
        buyerPays: (100 * (1 + fees.buyer)).toFixed(2),
        sellerReceives: (100 * (1 - fees.seller)).toFixed(2)
      }
    };

    const example = currency === 'NGN' ? examples.NGN : examples.USD;
    const symbol = currency === 'NGN' ? '₦' : '$';

    return {
      tier: tier.name,
      buyer: {
        percentage: `${buyerPercent}%`,
        description: 'Escrow Protection Fee',
        details: 'Your payment is held securely until you confirm delivery. Includes buyer fraud protection and dispute resolution.',
        example: `For a ${symbol}${example.amount} item, you pay ${symbol}${example.buyerFee} extra (${symbol}${example.buyerPays} total)`
      },
      seller: {
        percentage: `${sellerPercent}%`,
        description: 'Platform Service Fee',
        details: 'Covers secure processing, instant payouts, fraud prevention, and dispute protection.',
        example: `For a ${symbol}${example.amount} sale, you receive ${symbol}${example.sellerReceives}`
      },
      combined: {
        total: `${totalPercent}%`,
        description: 'Fair & Transparent Pricing',
        details: 'Covers gateway fees, escrow operations, fraud protection, infrastructure & support. No hidden fees.'
      }
    };
  }
};