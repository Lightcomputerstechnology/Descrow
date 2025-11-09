const PlatformSettings = require('../models/PlatformSettings');

/**
 * Calculate fees for an escrow transaction
 * @param {Number} amount - Transaction amount
 * @returns {Object} Fee breakdown
 */
const calculateFees = async (amount) => {
  // ✅ FIX: Convert amount to number first
  const numAmount = parseFloat(amount);
  
  // ✅ Validate amount
  if (isNaN(numAmount) || numAmount <= 0) {
    throw new Error('Invalid transaction amount');
  }

  const settings = await PlatformSettings.getSettings();
  const { percentage, minimumFee, maximumPercentage, buyerShare, sellerShare } = settings.fees;

  // Calculate total fee as percentage
  let totalFee = (numAmount * percentage) / 100;
  
  // Apply minimum fee
  if (totalFee < minimumFee) {
    totalFee = minimumFee;
  }
  
  // Apply maximum cap
  const maxFee = (numAmount * maximumPercentage) / 100;
  if (totalFee > maxFee) {
    totalFee = maxFee;
  }

  // Split between buyer and seller
  const buyerFee = (totalFee * buyerShare) / 100;
  const sellerFee = (totalFee * sellerShare) / 100;

  return {
    amount: parseFloat(numAmount.toFixed(2)),
    totalFee: parseFloat(totalFee.toFixed(2)),
    buyerFee: parseFloat(buyerFee.toFixed(2)),
    sellerFee: parseFloat(sellerFee.toFixed(2)),
    buyerPays: parseFloat((numAmount + buyerFee).toFixed(2)),
    sellerReceives: parseFloat((numAmount - sellerFee).toFixed(2)),
    platformEarns: parseFloat(totalFee.toFixed(2)),
    feePercentage: percentage
  };
};

module.exports = { calculateFees };