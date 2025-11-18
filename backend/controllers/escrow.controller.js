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
    const feeBreakdown = await feeConfig.calculateSimpleFees(
      parseFloat(amount),
      currency
    );

    // Get tier info
    const tierInfo = await feeConfig.getTierInfo(userTier);

    // Check if amount within limits
    const withinLimit = await feeConfig.isAmountWithinLimit(
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

/**
 * Get user's escrows with filtering and pagination - FIXED
 */
exports.getMyEscrows = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [{ buyer: userId }, { seller: userId }]
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    const escrows = await Escrow.find(query)
      .populate('buyer', 'firstName lastName email profilePicture')
      .populate('seller', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean(); // Convert to plain objects

    // Format the data properly
    const formattedEscrows = escrows.map(escrow => ({
      ...escrow,
      amount: escrow.amount ? parseFloat(escrow.amount.toString()) : 0,
      payment: escrow.payment ? {
        ...escrow.payment,
        amount: escrow.payment.amount ? parseFloat(escrow.payment.amount.toString()) : 0,
        buyerFee: escrow.payment.buyerFee ? parseFloat(escrow.payment.buyerFee.toString()) : 0,
        sellerFee: escrow.payment.sellerFee ? parseFloat(escrow.payment.sellerFee.toString()) : 0,
        platformFee: escrow.payment.platformFee ? parseFloat(escrow.payment.platformFee.toString()) : 0,
        buyerPays: escrow.payment.buyerPays ? parseFloat(escrow.payment.buyerPays.toString()) : 0,
        sellerReceives: escrow.payment.sellerReceives ? parseFloat(escrow.payment.sellerReceives.toString()) : 0
      } : null
    }));

    const total = await Escrow.countDocuments(query);

    res.json({
      success: true,
      data: formattedEscrows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get my escrows error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch escrows'
    });
  }
};

/**
 * Get dashboard statistics for user - FIXED
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get stats by status
    const stats = await Escrow.aggregate([
      {
        $match: {
          $or: [
            { buyer: new mongoose.Types.ObjectId(userId) }, 
            { seller: new mongoose.Types.ObjectId(userId) }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get total counts
    const totalEscrows = await Escrow.countDocuments({
      $or: [{ buyer: userId }, { seller: userId }]
    });

    const activeEscrows = await Escrow.countDocuments({
      $or: [{ buyer: userId }, { seller: userId }],
      status: { $in: ['pending', 'accepted', 'funded', 'delivered'] }
    });

    // Format the response properly
    const formattedStats = {
      byStatus: stats.map(stat => ({
        status: stat._id,
        count: stat.count,
        totalAmount: stat.totalAmount ? parseFloat(stat.totalAmount.toString()) : 0
      })),
      totalEscrows,
      activeEscrows,
      completedEscrows: totalEscrows - activeEscrows
    };

    res.json({
      success: true,
      data: formattedStats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};

/**
 * Get escrow by ID - FIXED
 */
exports.getEscrowById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let escrow;
    
    // Try by MongoDB _id first, then by escrowId
    if (mongoose.Types.ObjectId.isValid(id)) {
      escrow = await Escrow.findById(id)
        .populate('buyer', 'firstName lastName email profilePicture phone')
        .populate('seller', 'firstName lastName email profilePicture phone')
        .populate('attachments.uploadedBy', 'firstName lastName email')
        .populate('timeline.actor', 'firstName lastName email');
    } else {
      escrow = await Escrow.findOne({ escrowId: id })
        .populate('buyer', 'firstName lastName email profilePicture phone')
        .populate('seller', 'firstName lastName email profilePicture phone')
        .populate('attachments.uploadedBy', 'firstName lastName email')
        .populate('timeline.actor', 'firstName lastName email');
    }

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if user has access to this escrow
    const isBuyer = escrow.buyer && escrow.buyer._id.toString() === userId;
    const isSeller = escrow.seller && escrow.seller._id.toString() === userId;
    
    if (!isBuyer && !isSeller && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this escrow'
      });
    }

    // Format the escrow data properly
    const formattedEscrow = {
      ...escrow.toObject(),
      amount: escrow.amount ? parseFloat(escrow.amount.toString()) : 0,
      payment: escrow.payment ? {
        ...escrow.payment,
        amount: escrow.payment.amount ? parseFloat(escrow.payment.amount.toString()) : 0,
        buyerFee: escrow.payment.buyerFee ? parseFloat(escrow.payment.buyerFee.toString()) : 0,
        sellerFee: escrow.payment.sellerFee ? parseFloat(escrow.payment.sellerFee.toString()) : 0,
        platformFee: escrow.payment.platformFee ? parseFloat(escrow.payment.platformFee.toString()) : 0,
        buyerPays: escrow.payment.buyerPays ? parseFloat(escrow.payment.buyerPays.toString()) : 0,
        sellerReceives: escrow.payment.sellerReceives ? parseFloat(escrow.payment.sellerReceives.toString()) : 0
      } : null
    };

    res.json({
      success: true,
      data: formattedEscrow,
      userRole: isBuyer ? 'buyer' : isSeller ? 'seller' : 'admin'
    });

  } catch (error) {
    console.error('Get escrow by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch escrow details'
    });
  }
};

/**
 * Get GPS tracking information - FIXED
 */
exports.getGPSTracking = async (req, res) => {
  try {
    const { gpsTrackingId } = req.params;
    const userId = req.user.id;

    // Find escrow with this GPS tracking ID
    const escrow = await Escrow.findOne({
      'delivery.proof.gpsTrackingId': gpsTrackingId,
      $or: [{ buyer: userId }, { seller: userId }]
    });

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Tracking information not found'
      });
    }

    // Return basic tracking info
    const trackingData = {
      trackingId: gpsTrackingId,
      status: 'active',
      lastUpdate: new Date(),
      escrowTitle: escrow.title,
      estimatedDelivery: escrow.delivery?.proof?.estimatedDelivery || null
    };

    res.json({
      success: true,
      data: trackingData
    });

  } catch (error) {
    console.error('Get GPS tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking information'
    });
  }
};

/**
 * Upload delivery proof - FIXED
 */
exports.uploadDeliveryProof = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const {
      method,
      courierName,
      trackingNumber,
      vehicleType,
      plateNumber,
      driverName,
      gpsEnabled,
      methodDescription,
      estimatedDelivery,
      additionalNotes,
      packagePhotos = [],
      driverPhoto,
      vehiclePhoto
    } = req.body;

    const escrow = await Escrow.findById(id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if user is the seller
    if (escrow.seller.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only seller can upload delivery proof'
      });
    }

    // Check if escrow can have delivery proof uploaded
    if (!['funded', 'accepted'].includes(escrow.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot upload delivery proof in current status'
      });
    }

    // Update delivery proof
    escrow.delivery.proof = {
      method: method || 'other',
      courierName,
      trackingNumber,
      vehicleType,
      plateNumber,
      driverName,
      driverPhoto,
      vehiclePhoto,
      gpsEnabled: gpsEnabled === 'true',
      methodDescription,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      packagePhotos: Array.isArray(packagePhotos) ? packagePhotos : [packagePhotos],
      additionalNotes,
      submittedAt: new Date(),
      submittedBy: userId
    };

    // Add to timeline
    escrow.timeline.push({
      status: 'delivered',
      timestamp: new Date(),
      actor: userId,
      note: 'Delivery proof uploaded by seller'
    });

    await escrow.save();

    // Populate before sending response
    await escrow.populate('buyer seller', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Delivery proof uploaded successfully',
      data: escrow.delivery.proof
    });

  } catch (error) {
    console.error('Upload delivery proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload delivery proof'
    });
  }
};

/**
 * Accept escrow (seller) - FIXED
 */
exports.acceptEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const escrow = await Escrow.findById(id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if user is the seller
    if (escrow.seller.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only seller can accept escrow'
      });
    }

    // Check if escrow can be accepted
    if (escrow.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Escrow cannot be accepted in current status'
      });
    }

    // Update status
    escrow.status = 'accepted';
    escrow.chatUnlocked = true;

    // Add to timeline
    escrow.timeline.push({
      status: 'accepted',
      timestamp: new Date(),
      actor: userId,
      note: 'Escrow accepted by seller'
    });

    await escrow.save();

    // Populate before sending response
    await escrow.populate('buyer seller', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Escrow accepted successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Accept escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept escrow'
    });
  }
};

/**
 * Fund escrow (buyer payment) - FIXED
 */
exports.fundEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const escrow = await Escrow.findById(id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if user is the buyer
    if (escrow.buyer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only buyer can fund escrow'
      });
    }

    // Check if escrow can be funded
    if (escrow.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Escrow cannot be funded in current status'
      });
    }

    // Update status to funded
    escrow.status = 'funded';

    // Add to timeline
    escrow.timeline.push({
      status: 'funded',
      timestamp: new Date(),
      actor: userId,
      note: 'Escrow funded by buyer'
    });

    await escrow.save();

    // Populate before sending response
    await escrow.populate('buyer seller', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Escrow funded successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Fund escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fund escrow'
    });
  }
};

/**
 * Mark escrow as delivered (seller) - FIXED
 */
exports.markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const escrow = await Escrow.findById(id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if user is the seller
    if (escrow.seller.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only seller can mark as delivered'
      });
    }

    // Check if escrow can be marked as delivered
    if (escrow.status !== 'funded') {
      return res.status(400).json({
        success: false,
        message: 'Escrow cannot be marked as delivered in current status'
      });
    }

    // Update status to delivered
    escrow.status = 'delivered';
    escrow.delivery.deliveredAt = new Date();

    // Add to timeline
    escrow.timeline.push({
      status: 'delivered',
      timestamp: new Date(),
      actor: userId,
      note: 'Item marked as delivered by seller'
    });

    await escrow.save();

    // Populate before sending response
    await escrow.populate('buyer seller', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Item marked as delivered successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark as delivered'
    });
  }
};

/**
 * Confirm delivery (buyer) - FIXED
 */
exports.confirmDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const escrow = await Escrow.findById(id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if user is the buyer
    if (escrow.buyer.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only buyer can confirm delivery'
      });
    }

    // Check if escrow can be confirmed
    if (escrow.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Escrow cannot be confirmed in current status'
      });
    }

    // Update status to completed
    escrow.status = 'completed';
    escrow.delivery.confirmedAt = new Date();

    // Add to timeline
    escrow.timeline.push({
      status: 'completed',
      timestamp: new Date(),
      actor: userId,
      note: 'Delivery confirmed by buyer'
    });

    await escrow.save();

    // Populate before sending response
    await escrow.populate('buyer seller', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Delivery confirmed successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm delivery'
    });
  }
};

/**
 * Raise dispute for escrow - FIXED
 */
exports.raiseDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason, description } = req.body;

    const escrow = await Escrow.findById(id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if user is participant
    const isBuyer = escrow.buyer.toString() === userId;
    const isSeller = escrow.seller.toString() === userId;
    
    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Only participants can raise disputes'
      });
    }

    // Check if escrow can be disputed
    if (!['accepted', 'funded', 'delivered'].includes(escrow.status)) {
      return res.status(400).json({
        success: false,
        message: 'Escrow cannot be disputed in current status'
      });
    }

    // Create dispute
    escrow.dispute = {
      isDisputed: true,
      raisedBy: userId,
      raisedAt: new Date(),
      reason,
      description,
      status: 'pending'
    };

    // Update status to disputed
    escrow.status = 'disputed';

    // Add to timeline
    escrow.timeline.push({
      status: 'disputed',
      timestamp: new Date(),
      actor: userId,
      note: `Dispute raised: ${reason}`
    });

    await escrow.save();

    // Populate before sending response
    await escrow.populate('buyer seller', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Dispute raised successfully',
      data: escrow.dispute
    });

  } catch (error) {
    console.error('Raise dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to raise dispute'
    });
  }
};

/**
 * Cancel escrow - FIXED
 */
exports.cancelEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    const escrow = await Escrow.findById(id);

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if user is participant
    const isBuyer = escrow.buyer.toString() === userId;
    const isSeller = escrow.seller.toString() === userId;
    
    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Only participants can cancel escrow'
      });
    }

    // Check if escrow can be cancelled
    if (!['pending', 'accepted'].includes(escrow.status)) {
      return res.status(400).json({
        success: false,
        message: 'Escrow cannot be cancelled in current status'
      });
    }

    // Update status to cancelled
    escrow.status = 'cancelled';

    // Add to timeline
    escrow.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      actor: userId,
      note: `Escrow cancelled: ${reason || 'No reason provided'}`
    });

    await escrow.save();

    // Populate before sending response
    await escrow.populate('buyer seller', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Escrow cancelled successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Cancel escrow error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel escrow'
    });
  }
};