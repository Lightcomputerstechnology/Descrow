const Escrow = require('../models/Escrow.model');
const User = require('../models/User.model');
const mongoose = require('mongoose');
const feeConfig = require('../config/fee.config');
const { notifyEscrowParties, createNotification } = require('../utils/notificationHelper');

/**
 * Create new escrow (Buyer initiates) - WITH FILE UPLOAD SUPPORT
 */
exports.createEscrow = async (req, res) => {
  try {
    // Handle both JSON and FormData
    const { 
      title, 
      description, 
      amount, 
      currency, 
      sellerEmail, 
      category, 
      deliveryMethod 
    } = req.body;

    const buyerId = req.user.id;

    // Validate required fields
    if (!title || !description || !amount || !sellerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, amount, sellerEmail'
      });
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Validate currency
    const supportedCurrencies = ['USD', 'NGN', 'EUR', 'GBP', 'CAD', 'AUD', 'KES', 'GHS', 'ZAR', 'XOF', 'XAF'];
    if (!supportedCurrencies.includes(currency)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported currency. Supported: ${supportedCurrencies.join(', ')}`
      });
    }

    // Find seller by email
    const seller = await User.findOne({ email: sellerEmail.toLowerCase() });
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found with this email'
      });
    }

    // Prevent self-dealing
    if (seller._id.toString() === buyerId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot create an escrow with yourself'
      });
    }

    // Get buyer with tier info
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({
        success: false,
        message: 'Buyer not found'
      });
    }
    
    // Check tier limits
    const canCreate = buyer.canCreateTransaction(parsedAmount, currency);
    if (!canCreate.allowed) {
      return res.status(403).json({
        success: false,
        message: canCreate.reason,
        limit: canCreate.limit,
        current: canCreate.current,
        upgradeRequired: true,
        currentTier: buyer.tier,
        suggestedTier: buyer.tier === 'starter' ? 'growth' : 'enterprise'
      });
    }

    // Calculate tier-based fees
    const feeBreakdown = feeConfig.calculateFees(
      parsedAmount,
      currency,
      buyer.tier,
      'flutterwave'
    );

    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: file.path, // or file.location for cloud storage
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date()
      }));
    }

    // Create escrow with tier-based payment
    const escrowData = {
      title: title.trim(),
      description: description.trim(),
      amount: parsedAmount,
      currency: currency,
      buyer: buyerId,
      seller: seller._id,
      buyerTier: buyer.tier,
      sellerTier: seller.tier,
      category: category || 'other',
      delivery: {
        method: deliveryMethod || 'physical'
      },
      payment: {
        amount: feeBreakdown.amount,
        buyerFee: feeBreakdown.buyerFee,
        sellerFee: feeBreakdown.sellerFee,
        platformFee: feeBreakdown.totalPlatformFee,
        buyerPays: feeBreakdown.buyerPays,
        sellerReceives: feeBreakdown.sellerReceives,
        buyerFeePercentage: feeBreakdown.buyerFeePercentage,
        sellerFeePercentage: feeBreakdown.sellerFeePercentage
      },
      attachments: attachments,
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        actor: buyerId,
        note: 'Escrow created by buyer'
      }]
    };

    const escrow = await Escrow.create(escrowData);

    // Increment monthly usage
    buyer.monthlyUsage.transactionCount += 1;
    await buyer.save();

    // Notify seller
    await createNotification(
      seller._id,
      'escrow_created',
      'New Escrow Request',
      `${buyer.name} wants to create a ${currency} ${parsedAmount} escrow deal with you: "${title}"`,
      `/escrow/${escrow._id}`,
      { 
        escrowId: escrow._id, 
        amount: parsedAmount, 
        currency: currency,
        otherParty: buyer.name 
      }
    );

    // Populate and return
    await escrow.populate('buyer seller', 'name email profilePicture tier');

    res.status(201).json({
      success: true,
      message: 'Escrow created successfully. Waiting for seller acceptance.',
      data: {
        escrow,
        feeBreakdown,
        buyerTier: buyer.tier,
        tierLimits: buyer.getTierLimits(),
        attachmentsCount: attachments.length
      }
    });

  } catch (error) {
    console.error('Create escrow error:', error);
    
    // Handle specific errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create escrow'
    });
  }
};

/**
 * Calculate fees for amount (preview before creating) - ENHANCED WITH CURRENCY SUPPORT
 */
exports.calculateFeePreview = async (req, res) => {
  try {
    const { amount, currency = 'USD' } = req.query;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Validate currency
    const supportedCurrencies = ['USD', 'NGN', 'EUR', 'GBP', 'CAD', 'AUD', 'KES', 'GHS', 'ZAR', 'XOF', 'XAF'];
    if (!supportedCurrencies.includes(currency)) {
      return res.status(400).json({
        success: false,
        message: `Unsupported currency. Supported: ${supportedCurrencies.join(', ')}`
      });
    }

    // Get user's tier
    const user = await User.findById(userId);
    const userTier = user.tier || 'starter';

    // Calculate fees based on user's tier and currency
    const feeBreakdown = feeConfig.calculateFees(
      parseFloat(amount),
      currency,
      userTier,
      'flutterwave'
    );

    // Get tier info
    const tierInfo = feeConfig.getTierInfo(userTier);

    // Check if amount within limits
    const withinLimit = feeConfig.isAmountWithinLimit(
      parseFloat(amount),
      currency,
      userTier
    );

    res.json({
      success: true,
      data: {
        feeBreakdown,
        userTier,
        tierInfo,
        withinLimit,
        upgradeAvailable: !withinLimit,
        currency: currency
      }
    });

  } catch (error) {
    console.error('Calculate fees error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to calculate fees'
    });
  }
};

// ... REST OF YOUR EXISTING FUNCTIONS REMAIN THE SAME ...
// (acceptEscrow, markDelivered, uploadDeliveryProof, getGPSTracking, confirmDelivery, etc.)