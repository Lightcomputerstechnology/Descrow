const Escrow = require('../models/Escrow.model');
const User = require('../models/User.model');
const feeConfig = require('../config/fee.config');
const { notifyEscrowParties, createNotification } = require('../utils/notificationHelper');

/**
 * Create new escrow (Buyer initiates) - WITH TIER VALIDATION
 */
exports.createEscrow = async (req, res) => {
  try {
    const { title, description, amount, currency, sellerEmail, category, deliveryMethod } = req.body;
    const buyerId = req.user.id;

    // Validate required fields
    if (!title || !description || !amount || !sellerEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Find seller by email
    const seller = await User.findOne({ email: sellerEmail });
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

    // ✅ NEW: Get buyer with tier info
    const buyer = await User.findById(buyerId);
    
    // ✅ NEW: Check tier limits
    const canCreate = buyer.canCreateTransaction(amount, currency || 'USD');
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

    // ✅ NEW: Calculate tier-based fees
    const feeBreakdown = feeConfig.calculateFees(
      amount,
      currency || 'USD',
      buyer.tier,
      'flutterwave' // Default gateway
    );

    // Create escrow with tier-based payment
    const escrow = await Escrow.create({
      title,
      description,
      amount,
      currency: currency || 'USD',
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
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        actor: buyerId,
        note: 'Escrow created by buyer'
      }]
    });

    // ✅ NEW: Increment monthly usage
    buyer.monthlyUsage.transactionCount += 1;
    await buyer.save();

    // Notify seller
    await createNotification(
      seller._id,
      'escrow_created',
      'New Escrow Request',
      `${buyer.name} wants to create a ${currency || 'USD'} ${amount} escrow deal with you: "${title}"`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id, amount, otherParty: buyer.name }
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
        tierLimits: buyer.getTierLimits()
      }
    });

  } catch (error) {
    console.error('Create escrow error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create escrow'
    });
  }
};

/**
 * Seller accepts escrow
 */
exports.acceptEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const escrow = await Escrow.findById(id).populate('buyer seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is the seller
    if (escrow.seller._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can accept this escrow'
      });
    }

    // Check status
    if (escrow.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept escrow in ${escrow.status} status`
      });
    }

    // Update status
    escrow.status = 'accepted';
    escrow.timeline.push({
      status: 'accepted',
      timestamp: new Date(),
      actor: userId,
      note: 'Seller accepted the escrow'
    });

    await escrow.save();

    // Notify buyer
    await createNotification(
      escrow.buyer._id,
      'escrow_accepted',
      'Escrow Accepted!',
      `${escrow.seller.name} has accepted your escrow request. You can now proceed with payment.`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id, amount: escrow.amount, otherParty: escrow.seller.name }
    );

    res.json({
      success: true,
      message: 'Escrow accepted successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Accept escrow error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to accept escrow'
    });
  }
};

/**
 * Seller marks as delivered
 */
exports.markDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingNumber, notes, evidenceUrls } = req.body;
    const userId = req.user.id;

    const escrow = await Escrow.findById(id).populate('buyer seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is the seller
    if (escrow.seller._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can mark as delivered'
      });
    }

    // Check status
    if (escrow.status !== 'funded') {
      return res.status(400).json({
        success: false,
        message: 'Escrow must be funded before marking as delivered'
      });
    }

    // Update delivery info
    escrow.status = 'delivered';
    escrow.delivery.trackingNumber = trackingNumber;
    escrow.delivery.notes = notes;
    escrow.delivery.deliveredAt = new Date();

    // Add evidence if provided
    if (evidenceUrls && Array.isArray(evidenceUrls)) {
      escrow.delivery.evidence = evidenceUrls.map(url => ({
        type: 'image',
        url,
        uploadedBy: userId,
        uploadedAt: new Date()
      }));
    }

    escrow.timeline.push({
      status: 'delivered',
      timestamp: new Date(),
      actor: userId,
      note: 'Seller marked as delivered'
    });

    await escrow.save();

    // Notify buyer
    await createNotification(
      escrow.buyer._id,
      'escrow_delivered',
      'Item Delivered!',
      `${escrow.seller.name} has marked your order as delivered. Please confirm receipt.`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id, amount: escrow.amount, otherParty: escrow.seller.name }
    );

    res.json({
      success: true,
      message: 'Marked as delivered. Waiting for buyer confirmation.',
      data: escrow
    });

  } catch (error) {
    console.error('Mark delivered error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark as delivered'
    });
  }
};

/**
 * Buyer confirms receipt
 */
exports.confirmDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const escrow = await Escrow.findById(id).populate('buyer seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is the buyer
    if (escrow.buyer._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can confirm delivery'
      });
    }

    // Check status
    if (escrow.status !== 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Item must be marked as delivered before confirmation'
      });
    }

    // Update status
    escrow.status = 'completed';
    escrow.delivery.confirmedAt = new Date();

    escrow.timeline.push({
      status: 'completed',
      timestamp: new Date(),
      actor: userId,
      note: 'Buyer confirmed receipt'
    });

    await escrow.save();

    // Trigger automatic payout
    await this.processPayout(escrow);

    // Notify seller
    await createNotification(
      escrow.seller._id,
      'escrow_completed',
      'Escrow Completed!',
      `${escrow.buyer.name} has confirmed receipt. Payment is being processed.`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id, amount: escrow.payment.sellerReceives, otherParty: escrow.buyer.name }
    );

    res.json({
      success: true,
      message: 'Delivery confirmed! Payment is being released to seller.',
      data: escrow
    });

  } catch (error) {
    console.error('Confirm delivery error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to confirm delivery'
    });
  }
};

/**
 * Process payout to seller (automatic after confirmation)
 */
exports.processPayout = async (escrow) => {
  try {
    // TODO: Integrate actual payment gateway payout

    escrow.status = 'paid_out';
    escrow.timeline.push({
      status: 'paid_out',
      timestamp: new Date(),
      note: 'Automatic payout processed'
    });

    await escrow.save();

    // Update seller stats
    const seller = await User.findById(escrow.seller);
    if (seller) {
      seller.totalEarned = (seller.totalEarned || 0) + parseFloat(escrow.payment.sellerReceives.toString());
      seller.totalTransactions = (seller.totalTransactions || 0) + 1;
      await seller.save();
    }

    // Notify seller
    await createNotification(
      escrow.seller,
      'payment_received',
      'Payment Released!',
      `You've received ${escrow.currency} ${escrow.payment.sellerReceives} from escrow #${escrow.escrowId}`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id, amount: escrow.payment.sellerReceives }
    );

    console.log(`✅ Payout processed for escrow ${escrow._id}`);

  } catch (error) {
    console.error('Payout error:', error);
  }
};

/**
 * Raise dispute
 */
exports.raiseDispute = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, evidenceUrls } = req.body;
    const userId = req.user.id;

    const escrow = await Escrow.findById(id).populate('buyer seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is buyer or seller
    const isBuyer = escrow.buyer._id.toString() === userId;
    const isSeller = escrow.seller._id.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this escrow'
      });
    }

    // Can only dispute after funded
    if (!['funded', 'delivered'].includes(escrow.status)) {
      return res.status(400).json({
        success: false,
        message: 'Can only raise dispute after escrow is funded'
      });
    }

    // Check if already disputed
    if (escrow.dispute.isDisputed) {
      return res.status(400).json({
        success: false,
        message: 'Dispute already raised for this escrow'
      });
    }

    // Update dispute details
    escrow.status = 'disputed';
    escrow.dispute = {
      isDisputed: true,
      raisedBy: userId,
      raisedAt: new Date(),
      reason,
      evidence: evidenceUrls || [],
      status: 'pending'
    };

    escrow.timeline.push({
      status: 'disputed',
      timestamp: new Date(),
      actor: userId,
      note: `Dispute raised: ${reason}`
    });

    await escrow.save();

    // Notify other party
    const otherParty = isBuyer ? escrow.seller : escrow.buyer;
    await createNotification(
      otherParty._id,
      'dispute_raised',
      'Dispute Raised',
      `A dispute has been raised on escrow #${escrow.escrowId}. Admin will review.`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id, amount: escrow.amount }
    );

    res.json({
      success: true,
      message: 'Dispute raised successfully. Admin will review within 24-48 hours.',
      data: escrow
    });

  } catch (error) {
    console.error('Raise dispute error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to raise dispute'
    });
  }
};

/**
 * Cancel escrow (only in pending/accepted status)
 */
exports.cancelEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const escrow = await Escrow.findById(id).populate('buyer seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is buyer or seller
    const isBuyer = escrow.buyer._id.toString() === userId;
    const isSeller = escrow.seller._id.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'You are not part of this escrow'
      });
    }

    // Can only cancel before funding
    if (!['pending', 'accepted'].includes(escrow.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel escrow after it has been funded'
      });
    }

    escrow.status = 'cancelled';
    escrow.timeline.push({
      status: 'cancelled',
      timestamp: new Date(),
      actor: userId,
      note: reason || 'Escrow cancelled'
    });

    await escrow.save();

    // ✅ NEW: Decrement buyer's monthly usage if they cancel
    if (isBuyer) {
      const buyer = await User.findById(userId);
      if (buyer && buyer.monthlyUsage.transactionCount > 0) {
        buyer.monthlyUsage.transactionCount -= 1;
        await buyer.save();
      }
    }

    // Notify other party
    const otherParty = isBuyer ? escrow.seller : escrow.buyer;
    await createNotification(
      otherParty._id,
      'escrow_cancelled',
      'Escrow Cancelled',
      `Escrow #${escrow.escrowId} has been cancelled.`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id }
    );

    res.json({
      success: true,
      message: 'Escrow cancelled successfully',
      data: escrow
    });

  } catch (error) {
    console.error('Cancel escrow error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel escrow'
    });
  }
};

/**
 * Get user's escrows with filters
 */
exports.getMyEscrows = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      role,
      status, 
      search, 
      sortBy = 'createdAt', 
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    let query = {};

    // Filter by role
    if (role === 'buyer') {
      query.buyer = userId;
    } else if (role === 'seller') {
      query.seller = userId;
    } else {
      query.$or = [{ buyer: userId }, { seller: userId }];
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search in title/description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [escrows, total] = await Promise.all([
      Escrow.find(query)
        .populate('buyer seller', 'name email profilePicture tier')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit)),
      Escrow.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        escrows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get escrows error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch escrows'
    });
  }
};

/**
 * Get single escrow details
 */
exports.getEscrowById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let escrow;

    // Try to find by MongoDB _id first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id)
        .populate('buyer seller', 'name email profilePicture phone tier')
        .populate('timeline.actor', 'name');
    }

    // If not found by _id, try by escrowId field
    if (!escrow) {
      escrow = await Escrow.findOne({ escrowId: id })
        .populate('buyer seller', 'name email profilePicture phone tier')
        .populate('timeline.actor', 'name');
    }

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is part of the escrow
    const isBuyer = escrow.buyer._id.toString() === userId;
    const isSeller = escrow.seller._id.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this escrow'
      });
    }

    res.json({
      success: true,
      data: {
        escrow,
        userRole: isBuyer ? 'buyer' : 'seller'
      }
    });

  } catch (error) {
    console.error('Get escrow error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch escrow'
    });
  }
};

/**
 * ✅ NEW: Calculate fees for amount (preview before creating) - TIER-BASED
 */
exports.calculateFeePreview = async (req, res) => {
  try {
    const { amount, currency } = req.query;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    // Get user's tier
    const user = await User.findById(userId);
    const userTier = user.tier || 'starter';

    // Calculate fees based on user's tier
    const feeBreakdown = feeConfig.calculateFees(
      parseFloat(amount),
      currency || 'USD',
      userTier,
      'flutterwave'
    );

    // Get tier info
    const tierInfo = feeConfig.getTierInfo(userTier);

    // Check if amount within limits
    const withinLimit = feeConfig.isAmountWithinLimit(
      parseFloat(amount),
      currency || 'USD',
      userTier
    );

    res.json({
      success: true,
      data: {
        feeBreakdown,
        userTier,
        tierInfo,
        withinLimit,
        upgradeAvailable: !withinLimit
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
 * Get dashboard statistics
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user with tier info
    const user = await User.findById(userId);

    // Aggregate statistics
    const [buyingStats, sellingStats] = await Promise.all([
      Escrow.aggregate([
        { $match: { buyer: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: { $toDouble: '$amount' } }
          }
        }
      ]),
      Escrow.aggregate([
        { $match: { seller: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: { $toDouble: '$amount' } }
          }
        }
      ])
    ]);

    // Calculate totals
    const calculateTotals = (stats) => {
      return stats.reduce((acc, stat) => {
        acc.total += stat.count;
        acc.totalValue += stat.totalAmount;
        acc[stat._id] = stat.count;
        return acc;
      }, { total: 0, totalValue: 0 });
    };

    const buying = calculateTotals(buyingStats);
    const selling = calculateTotals(sellingStats);

    // Recent transactions
    const recentTransactions = await Escrow.find({
      $or: [{ buyer: userId }, { seller: userId }]
    })
      .populate('buyer seller', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .limit(10);

    // Get tier limits
    const tierLimits = user.getTierLimits();

    res.json({
      success: true,
      data: {
        buying,
        selling,
        recentTransactions,
        totalTransactions: buying.total + selling.total,
        totalValue: buying.totalValue + selling.totalValue,
        userTier: user.tier,
        tierLimits,
        monthlyUsage: user.monthlyUsage
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch dashboard stats'
    });
  }
};

module.exports = exports;