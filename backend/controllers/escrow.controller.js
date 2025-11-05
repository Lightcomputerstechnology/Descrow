const Escrow = require('../models/Escrow.model');
const User = require('../models/User.model');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');

// Create new escrow
exports.createEscrow = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      sellerEmail,
      itemName,
      itemDescription,
      amount,
      currency,
      paymentMethod,
      location,
      itemCondition
    } = req.body;

    // Get buyer (from authenticated user or API key)
    let buyer;
    if (req.user) {
      buyer = req.user;
    } else if (req.apiKey) {
      buyer = await User.findOne({ email: req.body.buyerEmail });
      if (!buyer) {
        return res.status(404).json({
          success: false,
          message: 'Buyer not found'
        });
      }
    }

    // Get seller
    const seller = await User.findOne({ email: sellerEmail });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (buyer._id.toString() === seller._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot create an escrow with yourself'
      });
    }

    const tierLimits = buyer.getTierLimits();

    if (tierLimits.maxTransactionAmount !== -1 && amount > tierLimits.maxTransactionAmount) {
      return res.status(400).json({
        success: false,
        message: `Transaction amount exceeds your tier limit of $${tierLimits.maxTransactionAmount}. Please upgrade your account.`
      });
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = await Escrow.countDocuments({
      buyer: buyer._id,
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });

    if (tierLimits.maxTransactionsPerMonth !== -1 && monthlyTransactions >= tierLimits.maxTransactionsPerMonth) {
      return res.status(400).json({
        success: false,
        message: `You have reached your monthly transaction limit of ${tierLimits.maxTransactionsPerMonth}. Please upgrade your account.`
      });
    }

    const adminFee = amount * tierLimits.transactionFee;
    const netAmount = amount - adminFee;

    // Create escrow
    const escrow = await Escrow.create({
      buyer: buyer._id,
      seller: seller._id,
      itemName,
      itemDescription: itemDescription || '',
      location,
      itemCondition,
      amount,
      adminFee,
      netAmount,
      currency: currency || 'USD',
      paymentMethod,
      status: 'in_escrow',
      chatUnlocked: true
    });

    buyer.totalTransactions += 1;
    buyer.totalSpent += amount;
    await buyer.save();

    await emailService.sendEscrowCreatedEmail(
      buyer.email,
      seller.email,
      {
        escrowId: escrow.escrowId,
        itemName: escrow.itemName,
        amount: escrow.amount,
        adminFee: escrow.adminFee,
        netAmount: escrow.netAmount,
        currency: escrow.currency
      }
    );

    await escrow.populate('buyer', 'name email');
    await escrow.populate('seller', 'name email');

    res.status(201).json({
      success: true,
      message: 'Escrow created successfully',
      escrow: {
        escrowId: escrow.escrowId,
        buyer: escrow.buyer,
        seller: escrow.seller,
        itemName: escrow.itemName,
        itemDescription: escrow.itemDescription,
        location: escrow.location,
        itemCondition: escrow.itemCondition,
        amount: escrow.amount,
        adminFee: escrow.adminFee,
        netAmount: escrow.netAmount,
        currency: escrow.currency,
        status: escrow.status,
        chatUnlocked: escrow.chatUnlocked,
        createdAt: escrow.createdAt
      }
    });

  } catch (error) {
    console.error('Create escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create escrow',
      error: error.message
    });
  }
};

// The rest of the controller functions (getUserEscrows, getEscrowById, updateEscrowStatus, releasePayment, cancelEscrow, getUserStats) remain unchanged.