const Escrow = require('../models/Escrow.model');
const User = require('../models/User.model');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');

// Create new escrow
const createEscrow = async (req, res) => {
  try {
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

// Get all escrows for a user
const getUserEscrows = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query;

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this data'
      });
    }

    let query;
    if (role === 'buying') {
      query = { buyer: userId };
    } else if (role === 'selling') {
      query = { seller: userId };
    } else {
      query = { $or: [{ buyer: userId }, { seller: userId }] };
    }

    const escrows = await Escrow.find(query)
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: escrows.length,
      escrows: escrows.map(escrow => ({
        escrowId: escrow.escrowId,
        buyer: escrow.buyer,
        seller: escrow.seller,
        itemName: escrow.itemName,
        amount: escrow.amount,
        netAmount: escrow.netAmount,
        currency: escrow.currency,
        status: escrow.status,
        createdAt: escrow.createdAt,
        deliveryDate: escrow.deliveryProof?.estimatedDelivery,
        autoReleaseDate: escrow.autoReleaseDate
      }))
    });

  } catch (error) {
    console.error('Get user escrows error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch escrows',
      error: error.message
    });
  }
};

// Get single escrow by ID
const getEscrowById = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findOne({ escrowId })
      .populate('buyer', 'name email avatar')
      .populate('seller', 'name email avatar')
      .populate('dispute');

    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow not found' });
    }

    const userId = req.user._id.toString();
    if (escrow.buyer._id.toString() !== userId && escrow.seller._id.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to access this escrow' });
    }

    res.status(200).json({ success: true, escrow });

  } catch (error) {
    console.error('Get escrow error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch escrow', error: error.message });
  }
};

// Update escrow status
const updateEscrowStatus = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { status } = req.body;

    const escrow = await Escrow.findOne({ escrowId });
    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow not found' });
    }

    if (escrow.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the seller can update this status' });
    }

    escrow.status = status;
    await escrow.save();

    res.status(200).json({ success: true, message: 'Escrow status updated', escrow });

  } catch (error) {
    console.error('Update escrow status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update escrow status', error: error.message });
  }
};

// Release payment
const releasePayment = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { signatureData } = req.body;

    const escrow = await Escrow.findOne({ escrowId })
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow not found' });
    }

    if (escrow.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer can release payment' });
    }

    if (escrow.status !== 'awaiting_delivery') {
      return res.status(400).json({ success: false, message: 'Payment can only be released when item is in transit' });
    }

    if (signatureData) {
      escrow.deliverySignature = { ...signatureData, timestamp: new Date() };
    }

    escrow.status = 'completed';
    await escrow.save();

    const seller = await User.findById(escrow.seller);
    seller.totalTransactions += 1;
    seller.totalEarned += escrow.netAmount;
    await seller.save();

    await emailService.sendPaymentReleasedEmail(escrow.seller.email, {
      escrowId: escrow.escrowId,
      netAmount: escrow.netAmount,
      currency: escrow.currency
    });

    res.status(200).json({ success: true, message: 'Payment released successfully', escrow });

  } catch (error) {
    console.error('Release payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to release payment', error: error.message });
  }
};

// Cancel escrow
const cancelEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findOne({ escrowId });
    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow not found' });
    }

    if (escrow.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the buyer can cancel this escrow' });
    }

    if (escrow.status !== 'in_escrow') {
      return res.status(400).json({ success: false, message: 'Cannot cancel escrow after shipment' });
    }

    escrow.status = 'cancelled';
    await escrow.save();

    res.status(200).json({ success: true, message: 'Escrow cancelled successfully', escrow });

  } catch (error) {
    console.error('Cancel escrow error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel escrow', error: error.message });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const buyingStats = {
      total: await Escrow.countDocuments({ buyer: userId }),
      inEscrow: await Escrow.countDocuments({ buyer: userId, status: 'in_escrow' }),
      inTransit: await Escrow.countDocuments({ buyer: userId, status: 'awaiting_delivery' }),
      completed: await Escrow.countDocuments({ buyer: userId, status: 'completed' }),
      disputed: await Escrow.countDocuments({ buyer: userId, status: 'disputed' })
    };

    const sellingStats = {
      total: await Escrow.countDocuments({ seller: userId }),
      pending: await Escrow.countDocuments({ seller: userId, status: 'in_escrow' }),
      shipped: await Escrow.countDocuments({ seller: userId, status: 'awaiting_delivery' }),
      completed: await Escrow.countDocuments({ seller: userId, status: 'completed' }),
      disputed: await Escrow.countDocuments({ seller: userId, status: 'disputed' })
    };

    res.status(200).json({
      success: true,
      stats: { buying: buyingStats, selling: sellingStats }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics', error: error.message });
  }
};

// ✅ Export all functions
module.exports = {
  createEscrow,
  getUserEscrows,
  getEscrowById,
  updateEscrowStatus,
  releasePayment,
  cancelEscrow,
  getUserStats
};