const Escrow = require('../models/Escrow.model');
const User = require('../models/User.model');
const { calculateFees } = require('../utils/feeCalculator');
const { notifyEscrowParties, createNotification } = require('../utils/notificationHelper');

/**
 * Create new escrow (Buyer initiates)
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

    // Calculate fees
    const feeBreakdown = await calculateFees(amount);

    // Create escrow
    const escrow = await Escrow.create({
      title,
      description,
      amount,
      currency: currency || 'USD',
      buyer: buyerId,
      seller: seller._id,
      category: category || 'other',
      delivery: {
        method: deliveryMethod || 'physical'
      },
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        actor: buyerId,
        note: 'Escrow created by buyer'
      }]
    });

    // Notify seller
    await createNotification(
      seller._id,
      'escrow_created',
      'New Escrow Request',
      `${req.user.name} wants to create a $${amount} escrow deal with you: "${title}"`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id, amount, otherParty: req.user.name }
    );

    // Populate and return
    await escrow.populate('buyer seller', 'name email profilePicture');

    res.status(201).json({
      success: true,
      message: 'Escrow created successfully. Waiting for seller acceptance.',
      data: {
        escrow,
        feeBreakdown
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
 * Buyer funds escrow (payment)
 */
exports.fundEscrow = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, transactionId } = req.body;
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
        message: 'Only the buyer can fund this escrow'
      });
    }

    // Check status
    if (escrow.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Escrow must be accepted before funding'
      });
    }

    // Calculate fees
    const feeBreakdown = await calculateFees(escrow.amount);

    // TODO: Integrate actual payment gateway here
    // For now, we'll simulate successful payment
    // const paymentResult = await processPayment(paymentMethod, feeBreakdown.buyerPays);

    // Update escrow with payment details
    escrow.status = 'funded';
    escrow.payment = {
      method: paymentMethod,
      transactionId: transactionId || `TXN_${Date.now()}`,
      paidAt: new Date(),
      amount: escrow.amount,
      buyerPays: feeBreakdown.buyerPays,
      sellerReceives: feeBreakdown.sellerReceives,
      platformFee: feeBreakdown.totalFee,
      buyerFee: feeBreakdown.buyerFee,
      sellerFee: feeBreakdown.sellerFee
    };

    escrow.timeline.push({
      status: 'funded',
      timestamp: new Date(),
      actor: userId,
      note: `Buyer funded escrow with ${paymentMethod}`
    });

    await escrow.save();

    // Notify seller
    await createNotification(
      escrow.seller._id,
      'escrow_funded',
      'Escrow Funded!',
      `${escrow.buyer.name} has funded the escrow. You can now proceed with delivery.`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id, amount: escrow.amount, otherParty: escrow.buyer.name }
    );

    res.json({
      success: true,
      message: 'Escrow funded successfully. Money is now held securely.',
      data: {
        escrow,
        payment: escrow.payment
      }
    });

  } catch (error) {
    console.error('Fund escrow error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fund escrow'
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
        type: 'image', // Can be enhanced to detect type
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
    // const payoutResult = await initiatePayoutToSeller(escrow.seller, escrow.payment.sellerReceives);

    escrow.status = 'paid_out';
    escrow.timeline.push({
      status: 'paid_out',
      timestamp: new Date(),
      note: 'Automatic payout processed'
    });

    await escrow.save();

    // Notify seller
    await createNotification(
      escrow.seller,
      'payment_received',
      'Payment Released!',
      `You've received $${escrow.payment.sellerReceives} from escrow #${escrow._id.toString().slice(-6)}`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id, amount: escrow.payment.sellerReceives }
    );

    console.log(`✅ Payout processed for escrow ${escrow._id}`);

  } catch (error) {
    console.error('Payout error:', error);
    // TODO: Add to failed payouts queue for retry
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
      `A dispute has been raised on escrow #${escrow._id.toString().slice(-6)}. Admin will review.`,
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

    // Notify other party
    const otherParty = isBuyer ? escrow.seller : escrow.buyer;
    await createNotification(
      otherParty._id,
      'escrow_cancelled',
      'Escrow Cancelled',
      `Escrow #${escrow._id.toString().slice(-6)} has been cancelled.`,
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
      role, // 'buyer', 'seller', 'all'
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
        .populate('buyer seller', 'name email profilePicture')
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

    const escrow = await Escrow.findById(id)
      .populate('buyer seller', 'name email profilePicture phone')
      .populate('timeline.actor', 'name');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    /**
 * Get single escrow details
 */
exports.getEscrowById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    let escrow;

    // Try to find by MongoDB _id first (if it's a valid ObjectId format)
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      escrow = await Escrow.findById(id)
        .populate('buyer seller', 'name email profilePicture phone')
        .populate('timeline.actor', 'name');
    }

    // If not found by _id, try by escrowId field (e.g., ESC123...)
    if (!escrow) {
      escrow = await Escrow.findOne({ escrowId: id })
        .populate('buyer seller', 'name email profilePicture phone')
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
 * Calculate fees for amount (preview before creating)
 */
exports.calculateFeePreview = async (req, res) => {
  try {
    const { amount } = req.query;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const feeBreakdown = await calculateFees(parseFloat(amount));

    res.json({
      success: true,
      data: feeBreakdown
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

    // Aggregate statistics
    const [buyingStats, sellingStats] = await Promise.all([
      // Buying stats
      Escrow.aggregate([
        { $match: { buyer: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]),
      // Selling stats
      Escrow.aggregate([
        { $match: { seller: userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
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

    res.json({
      success: true,
      data: {
        buying,
        selling,
        recentTransactions,
        totalTransactions: buying.total + selling.total,
        totalValue: buying.totalValue + selling.totalValue
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
