const Dispute = require('../models/Dispute.model');
const Escrow = require('../models/Escrow.model');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');

// Create Dispute
exports.createDispute = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { escrowId, reason, description, evidence } = req.body;

    // Find escrow
    const escrow = await Escrow.findOne({ escrowId })
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if user is part of this escrow
    const userId = req.user._id.toString();
    if (escrow.buyer._id.toString() !== userId && escrow.seller._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create dispute for this escrow'
      });
    }

    // Check if escrow can be disputed
    const disputableStatuses = ['in_escrow', 'awaiting_delivery', 'completed'];
    if (!disputableStatuses.includes(escrow.status)) {
      return res.status(400).json({
        success: false,
        message: 'This escrow cannot be disputed at this stage'
      });
    }

    // Check if dispute already exists
    if (escrow.dispute) {
      return res.status(400).json({
        success: false,
        message: 'Dispute already exists for this escrow'
      });
    }

    // Create dispute
    const dispute = await Dispute.create({
      escrow: escrow._id,
      initiatedBy: req.user._id,
      reason,
      description,
      evidence: evidence || []
    });

    // Update escrow
    escrow.status = 'disputed';
    escrow.dispute = dispute._id;
    await escrow.save();

    // Notify other party and admin
    const otherParty = escrow.buyer._id.toString() === userId ? escrow.seller : escrow.buyer;
    await emailService.sendDisputeCreatedEmail(
      req.user.email,
      otherParty.email,
      {
        escrowId: escrow.escrowId,
        reason,
        description
      }
    );

    res.status(201).json({
      success: true,
      message: 'Dispute created successfully. Admin will review within 24-48 hours.',
      dispute
    });

  } catch (error) {
    console.error('Create dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create dispute',
      error: error.message
    });
  }
};

// Get Dispute by Escrow ID
exports.getDispute = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findOne({ escrowId });
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is part of this escrow
    const userId = req.user._id.toString();
    if (escrow.buyer.toString() !== userId && escrow.seller.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this dispute'
      });
    }

    if (!escrow.dispute) {
      return res.status(404).json({
        success: false,
        message: 'No dispute exists for this escrow'
      });
    }

    const dispute = await Dispute.findById(escrow.dispute)
      .populate('escrow')
      .populate('initiatedBy', 'name email')
      .populate('resolvedBy', 'name email');

    res.status(200).json({
      success: true,
      dispute
    });

  } catch (error) {
    console.error('Get dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispute',
      error: error.message
    });
  }
};

// Respond to Dispute
exports.respondToDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { message, evidence } = req.body;

    const dispute = await Dispute.findById(disputeId).populate('escrow');
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const escrow = await Escrow.findById(dispute.escrow._id);

    // Verify user is part of this escrow
    const userId = req.user._id.toString();
    if (escrow.buyer.toString() !== userId && escrow.seller.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this dispute'
      });
    }

    // Check if already resolved
    if (dispute.status !== 'open') {
      return res.status(400).json({
        success: false,
        message: 'Dispute is already resolved'
      });
    }

    // Add response
    dispute.responses.push({
      user: req.user._id,
      message,
      evidence: evidence || [],
      timestamp: new Date()
    });

    await dispute.save();

    res.status(200).json({
      success: true,
      message: 'Response submitted successfully',
      dispute
    });

  } catch (error) {
    console.error('Respond to dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to dispute',
      error: error.message
    });
  }
};

// Get User Disputes
exports.getUserDisputes = async (req, res) => {
  try {
    const userId = req.user._id;

    const disputes = await Dispute.find({ initiatedBy: userId })
      .populate('escrow')
      .populate('resolvedBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes
    });

  } catch (error) {
    console.error('Get user disputes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disputes',
      error: error.message
    });
  }
};
