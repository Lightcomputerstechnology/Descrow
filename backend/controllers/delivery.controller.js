const Escrow = require('../models/Escrow.model');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');

// Upload Delivery Proof
exports.uploadDeliveryProof = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { escrowId, trackingNumber, carrier, estimatedDelivery, notes } = req.body;

    const escrow = await Escrow.findOne({ escrowId })
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is the seller
    if (escrow.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can upload delivery proof'
      });
    }

    // Check if escrow is in correct status
    if (escrow.status !== 'in_escrow') {
      return res.status(400).json({
        success: false,
        message: 'Can only upload delivery proof after payment is confirmed'
      });
    }

    // Get uploaded file URLs
    const proofImages = req.fileUrls || [];

    // Update escrow with delivery proof
    escrow.deliveryProof = {
      trackingNumber,
      carrier,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      proofImages,
      notes,
      uploadedAt: new Date()
    };

    escrow.status = 'awaiting_delivery';

    // Set auto-release date (7 days after estimated delivery or 14 days from now)
    const autoReleaseDate = new Date();
    if (estimatedDelivery) {
      autoReleaseDate.setTime(new Date(estimatedDelivery).getTime() + (7 * 24 * 60 * 60 * 1000));
    } else {
      autoReleaseDate.setDate(autoReleaseDate.getDate() + 14);
    }
    escrow.autoReleaseDate = autoReleaseDate;

    await escrow.save();

    // Send notification to buyer
    await emailService.sendDeliveryProofEmail(
      escrow.buyer.email,
      {
        escrowId: escrow.escrowId,
        itemName: escrow.itemName,
        trackingNumber,
        carrier,
        estimatedDelivery
      }
    );

    res.status(200).json({
      success: true,
      message: 'Delivery proof uploaded successfully',
      deliveryProof: escrow.deliveryProof,
      autoReleaseDate: escrow.autoReleaseDate
    });

  } catch (error) {
    console.error('Upload delivery proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload delivery proof',
      error: error.message
    });
  }
};

// Get Delivery Details
exports.getDeliveryDetails = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findOne({ escrowId })
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

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
        message: 'Not authorized to view delivery details'
      });
    }

    res.status(200).json({
      success: true,
      deliveryProof: escrow.deliveryProof,
      status: escrow.status,
      autoReleaseDate: escrow.autoReleaseDate
    });

  } catch (error) {
    console.error('Get delivery details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch delivery details',
      error: error.message
    });
  }
};

// Update Tracking Info
exports.updateTracking = async (req, res) => {
  try {
    const { escrowId, trackingNumber, carrier, status, location } = req.body;

    const escrow = await Escrow.findOne({ escrowId });

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is the seller
    if (escrow.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the seller can update tracking'
      });
    }

    // Update tracking info
    if (!escrow.deliveryProof) {
      escrow.deliveryProof = {};
    }

    if (trackingNumber) escrow.deliveryProof.trackingNumber = trackingNumber;
    if (carrier) escrow.deliveryProof.carrier = carrier;
    
    // Add tracking update
    if (!escrow.deliveryProof.trackingUpdates) {
      escrow.deliveryProof.trackingUpdates = [];
    }
    
    escrow.deliveryProof.trackingUpdates.push({
      status: status || 'in_transit',
      location,
      timestamp: new Date()
    });

    await escrow.save();

    res.status(200).json({
      success: true,
      message: 'Tracking updated successfully',
      deliveryProof: escrow.deliveryProof
    });

  } catch (error) {
    console.error('Update tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update tracking',
      error: error.message
    });
  }
};
