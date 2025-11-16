// backend/config/fee.config.js - PRODUCTION READY TIER-BASED FEE SYSTEM

module.exports = {
  // ======================================================
  //                     TIER DEFINITIONS
  // ======================================================
  tiers: {
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
  },

  // ======================================================
  //                     GATEWAY COSTS
  // ======================================================
  gatewayCosts: {
    paystack: {
      NGN: { percentage: 0.015, flatFee: 100, cap: 2000 },
      USD: { percentage: 0.039, flatFee: 100 },
      transferFee: {
        small: 10,
        medium: 25,
        large: 50
      }
    },

    flutterwave: {
      NGN: { percentage: 0.014, flatFee: 0 },
      USD: { percentage: 0.038, flatFee: 0 },
      transferFee: 0
    },

    crypto: {
      percentage: 0.005,
      flatFee: 0,
      transferFee: 0
    }
  },

  // ======================================================
  //               CALCULATE FEES FOR TRANSACTION
  // ======================================================
  calculateFees(amount, currency, userTier, paymentMethod = 'flutterwave') {
    const tier = this.tiers[userTier] || this.tiers.starter;
    const fees = tier.fees[currency] || tier.fees.USD;

    const baseAmount = parseFloat(amount);

    // User-facing fees
    const buyerFee = baseAmount * fees.buyer;
    const sellerFee = baseAmount * fees.seller;

    const buyerPays = baseAmount + buyerFee;
    const sellerReceives = baseAmount - sellerFee;

    const totalPlatformFee = buyerFee + sellerFee;

    // Gateway cost calculations
    let gatewayIncoming = 0;
    let gatewayOutgoing = 0;

    if (paymentMethod === 'paystack') {
      const costs = this.gatewayCosts.paystack[currency] || this.gatewayCosts.paystack.NGN;
      gatewayIncoming = (buyerPays * costs.percentage) + costs.flatFee;

      if (currency === 'NGN' && costs.cap) {
        gatewayIncoming = Math.min(gatewayIncoming, costs.cap);
      }

      if (sellerReceives <= 5000) gatewayOutgoing = this.gatewayCosts.paystack.transferFee.small;
      else if (sellerReceives <= 50000) gatewayOutgoing = this.gatewayCosts.paystack.transferFee.medium;
      else gatewayOutgoing = this.gatewayCosts.paystack.transferFee.large;

    } else if (paymentMethod === 'flutterwave') {
      const costs = this.gatewayCosts.flutterwave[currency] || this.gatewayCosts.flutterwave.USD;
      gatewayIncoming = buyerPays * costs.percentage;
      gatewayOutgoing = this.gatewayCosts.flutterwave.transferFee;

    } else if (paymentMethod === 'crypto') {
      gatewayIncoming = buyerPays * this.gatewayCosts.crypto.percentage;
      gatewayOutgoing = 0;
    }

    const gatewayCost = gatewayIncoming + gatewayOutgoing;

    // Platform profit
    const platformProfit = totalPlatformFee - gatewayCost;
    const profitPercentage = (platformProfit / baseAmount) * 100;

    return {
      tier: userTier,
      amount: parseFloat(baseAmount.toFixed(2)),
      currency,
      paymentMethod,

      buyerFee: parseFloat(buyerFee.toFixed(2)),
      sellerFee: parseFloat(sellerFee.toFixed(2)),
      buyerPays: parseFloat(buyerPays.toFixed(2)),
      sellerReceives: parseFloat(sellerReceives.toFixed(2)),
      totalPlatformFee: parseFloat(totalPlatformFee.toFixed(2)),

      buyerFeePercentage: fees.buyer * 100,
      sellerFeePercentage: fees.seller * 100,
      totalFeePercentage: (fees.buyer + fees.seller) * 100,

      gatewayIncoming: parseFloat(gatewayIncoming.toFixed(2)),
      gatewayOutgoing: parseFloat(gatewayOutgoing.toFixed(2)),
      totalGatewayCost: parseFloat(gatewayCost.toFixed(2)),

      platformProfit: parseFloat(platformProfit.toFixed(2)),
      profitPercentage: parseFloat(profitPercentage.toFixed(2)),

      breakdown: {
        buyerFeeDescription: `${(fees.buyer * 100).toFixed(2)}% escrow protection fee`,
        sellerFeeDescription: `${(fees.seller * 100).toFixed(2)}% platform service fee`,
        totalFeeDescription: `${((fees.buyer + fees.seller) * 100).toFixed(2)}% combined fee`,
        note: 'Both buyer and seller are equally protected. No hidden fees.'
      }
    };
  },

  // ======================================================
  //                TIER INFO HELPERS
  // ======================================================
  getTierInfo(tierName) {
    return this.tiers[tierName] || this.tiers.starter;
  },

  getAllTiers() {
    return Object.keys(this.tiers).map(key => ({
      id: key,
      ...this.tiers[key]
    }));
  },

  isAmountWithinLimit(amount, currency, tierName) {
    const tier = this.getTierInfo(tierName);
    const limit = tier.maxTransactionAmount[currency];

    if (limit === -1) return true;
    return amount <= limit;
  },

  // ======================================================
  //                UPGRADE BENEFITS
  // ======================================================
  getUpgradeBenefits(currentTier, targetTier) {
    const current = this.tiers[currentTier];
    const target = this.tiers[targetTier];

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
  //                MONTHLY SAVINGS
  // ======================================================
  calculateMonthlySavings(monthlyVolume, currency, currentTier, targetTier) {
    const currentFees = this.calculateFees(monthlyVolume, currency, currentTier);
    const targetFees = this.calculateFees(monthlyVolume, currency, targetTier);

    const currentTotal = currentFees.totalPlatformFee;
    const targetTotal = targetFees.totalPlatformFee;
    const savings = currentTotal - targetTotal;

    const targetMonthlyCost =
      this.tiers[targetTier].monthlyCost[currency] ||
      this.tiers[targetTier].monthlyCost.USD;

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
  //                FEE EXPLANATION
  // ======================================================
  getFeeExplanation(currency, tierName) {
    const tier = this.getTierInfo(tierName);
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
        details:
          'Your payment is held securely until you confirm delivery. Includes buyer fraud protection and dispute resolution.',
        example: `For a ${symbol}${example.amount} item, you pay ${symbol}${example.buyerFee} extra (${symbol}${example.buyerPays} total)`
      },

      seller: {
        percentage: `${sellerPercent}%`,
        description: 'Platform Service Fee',
        details:
          'Covers secure processing, instant payouts, fraud prevention, and dispute protection.',
        example: `For a ${symbol}${example.amount} sale, you receive ${symbol}${example.sellerReceives}`
      },

      combined: {
        total: `${totalPercent}%`,
        description: 'Fair & Transparent Pricing',
        details:
          'Covers gateway fees, escrow operations, fraud protection, infrastructure & support. No hidden fees.'
      }
    };
  }
};
