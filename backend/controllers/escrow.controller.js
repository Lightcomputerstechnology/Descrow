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

    const { sellerEmail, itemName, itemDescription, amount, currency, paymentMethod } = req.body;

    // Get buyer (from authenticated user or API key)
    let buyer;
    if (req.user) {
      buyer = req.user;
    } else if (req.apiKey) {
      // For API requests, buyer details should be in request
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

    // Check if buyer and seller are the same
    if (buyer._id.toString() === seller._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot create an escrow with yourself'
      });
    }

    // Get buyer's tier limits
    const tierLimits = buyer.getTierLimits();

    // Check transaction amount limit
    if (tierLimits.maxTransactionAmount !== -1 && amount > tierLimits.maxTransactionAmount) {
      return res.status(400).json({
        success: false,
        message: `Transaction amount exceeds your tier limit of $${tierLimits.maxTransactionAmount}. Please upgrade your account.`
      });
    }

    // Check monthly transaction limit
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

    // Calculate admin fee (DEDUCTED IMMEDIATELY)
    const adminFee = amount * tierLimits.transactionFee;
    const netAmount = amount - adminFee;

    // Create escrow
    const escrow = await Escrow.create({
      buyer: buyer._id,
      seller: seller._id,
      itemName,
      itemDescription: itemDescription || '',
      amount,
      adminFee,
      netAmount,
      currency: currency || 'USD',
      paymentMethod,
      status: 'in_escrow',
      chatUnlocked: true // Chat unlocks when escrow is created (after payment)
    });

    // Update buyer statistics
    buyer.totalTransactions += 1;
    buyer.totalSpent += amount;
    await buyer.save();

    // Send notification emails
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

    // Populate buyer and seller details
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
exports.getUserEscrows = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.query; // 'buying' or 'selling'

    // Verify user owns this request
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
      // Get all (both buying and selling)
      query = {
        $or: [{ buyer: userId }, { seller: userId }]
      };
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
exports.getEscrowById = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findOne({ escrowId })
      .populate('buyer', 'name email avatar')
      .populate('seller', 'name email avatar')
      .populate('dispute');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is part of this escrow
    const userId = req.user._id.toString();
    if (escrow.buyer._id.toString() !== userId && escrow.seller._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this escrow'
      });
    }

    res.status(200).json({
      success: true,
      escrow
    });

  } catch (error) {
    console.error('Get escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch escrow',
      error: error.message
    });
  }
};

// Update escrow status
exports.updateEscrowStatus = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { status } = req.body;

    const escrow = await Escrow.findOne({ escrowId });

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is the seller (only seller can mark as shipped)
    if (escrow.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can update this status'
      });
    }

    escrow.status = status;
    await escrow.save();

    res.status(200).json({
      success: true,
      message: 'Escrow status updated',
      escrow
    });

  } catch (error) {
    console.error('Update escrow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update escrow status',
      error: error.message
    });
  }
};

// Release payment (buyer confirms delivery)
exports.releasePayment = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { signatureData } = req.body;

    const escrow = await Escrow.findOne({ escrowId })
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is the buyer
    if (escrow.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can release payment'
      });
    }

    // Check if escrow is in correct status
    if (escrow.status !== 'awaiting_delivery') {
      return res.status(400).json({
        success: false,
        message: 'Payment can only be released when item is in transit'
      });
    }

    // Save signature
    if (signatureData) {
      escrow.deliverySignature = {
        ...signatureData,
        timestamp: new Date()
      };
    }

    // Update escrow status
    escrow.status = 'completed';
    await escrow.save();

    // Update seller statistics
    const seller = await User.findById(escrow.seller);
    seller.totalTransactions += 1;
    seller.totalEarned += escrow.netAmount;
    await seller.save();

    // Send payment released notification
    await emailService.sendPaymentReleasedEmail(
      escrow.seller.email,
      {
        escrowId: escrow.escrowId,
        netAmount: escrow.netAmount,
        currency: escrow.currency
      }
    );

    res.status(200).json({
      success: true,
      message: 'Payment released successfully',
      escrow
    });

  } catch (error) {
    console.error('Release payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to release payment',
      error: error.message
    });
  }
};

// Cancel escrow
exports.cancelEscrow = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { reason } = req.body;

    const escrow = await Escrow.findOne({ escrowId });

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Only buyer can cancel before shipment
    if (escrow.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can cancel this escrow'
      });
    }

    // Can only cancel if not shipped yet
    if (escrow.status !== 'in_escrow') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel escrow after shipment'
      });
    }

    escrow.status = 'cancelled';
    await escrow.save();

    res.status(200).json({
      success: true,
      message: 'Escrow cancelled successfully',
      escrow
    });

  } catch (error) {
    console.error('Cancel escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel escrow',
      error: error.message
    });
  }
};

// Get user statistics
exports.getUserStats = async (req, res) => {
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
      stats: {
        buying: buyingStats,
        selling: sellingStats
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};
