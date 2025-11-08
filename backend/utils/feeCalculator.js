const PlatformSettings = require('../models/PlatformSettings');

/**
 * Calculate fees for an escrow transaction
 * @param {Number} amount - Transaction amount
 * @returns {Object} Fee breakdown
 */
const calculateFees = async (amount) => {
  const settings = await PlatformSettings.getSettings();
  const { percentage, minimumFee, maximumPercentage, buyerShare, sellerShare } = settings.fees;

  // Calculate total fee as percentage
  let totalFee = (amount * percentage) / 100;
  
  // Apply minimum fee
  if (totalFee < minimumFee) {
    totalFee = minimumFee;
  }
  
  // Apply maximum cap
  const maxFee = (amount * maximumPercentage) / 100;
  if (totalFee > maxFee) {
    totalFee = maxFee;
  }

  // Split between buyer and seller
  const buyerFee = (totalFee * buyerShare) / 100;
  const sellerFee = (totalFee * sellerShare) / 100;

  return {
    amount: parseFloat(amount.toFixed(2)),
    totalFee: parseFloat(totalFee.toFixed(2)),
    buyerFee: parseFloat(buyerFee.toFixed(2)),
    sellerFee: parseFloat(sellerFee.toFixed(2)),
    buyerPays: parseFloat((amount + buyerFee).toFixed(2)),
    sellerReceives: parseFloat((amount - sellerFee).toFixed(2)),
    platformEarns: parseFloat(totalFee.toFixed(2)),
    feePercentage: percentage
  };
};

module.exports = { calculateFees };
