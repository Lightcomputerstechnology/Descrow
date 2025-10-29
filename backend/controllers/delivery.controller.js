const Escrow = require('../models/Escrow.model');
const path = require('path');

// Upload delivery proof
exports.uploadDeliveryProof = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const {
      method,
      courierName,
      trackingNumber,
      vehicleType,
      plateNumber,
      driverName,
      methodDescription,
      estimatedDelivery,
      enableGPS
    } = req.body;

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
        message: 'Only the seller can upload delivery proof'
      });
    }

    // Check if escrow is in correct status
    if (escrow.status !== 'in_escrow') {
      return res.status(400).json({
        success: false,
        message: 'Delivery proof can only be uploaded for escrows in "in_escrow" status'
      });
    }

    // Get uploaded file URLs
    const photoUrls = req.files ? req.files.map(file => `/uploads/delivery-proof/${file.filename}`) : [];

    // Build delivery proof object based on method
    const deliveryProof = {
      method: method,
      estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null,
      photos: photoUrls,
      gpsEnabled: enableGPS === 'true' || enableGPS === true
    };

    if (method === 'courier') {
      deliveryProof.courierName = courierName;
      deliveryProof.trackingNumber = trackingNumber;
    } else if (method === 'personal') {
      deliveryProof.vehicleType = vehicleType;
      deliveryProof.plateNumber = plateNumber;
      deliveryProof.driverName = driverName;
    } else if (method === 'other') {
      deliveryProof.methodDescription = methodDescription;
    }

    // Update escrow
    escrow.deliveryProof = deliveryProof;
    escrow.status = 'awaiting_delivery';
    
    // Set auto-release date (3 days after estimated delivery)
    escrow.setAutoReleaseDate();
    
    await escrow.save();

    res.status(200).json({
      success: true,
      message: 'Delivery proof uploaded successfully',
      escrow: {
        escrowId: escrow.escrowId,
        status: escrow.status,
        deliveryProof: escrow.deliveryProof,
        autoReleaseDate: escrow.autoReleaseDate
      }
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

// Get delivery tracking info
exports.getDeliveryTracking = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findOne({ escrowId })
      .select('escrowId deliveryProof status autoReleaseDate');

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
        message: 'Not authorized to access this information'
      });
    }

    res.status(200).json({
      success: true,
      tracking: {
        escrowId: escrow.escrowId,
        status: escrow.status,
        deliveryProof: escrow.deliveryProof,
        autoReleaseDate: escrow.autoReleaseDate
      }
    });

  } catch (error) {
    console.error('Get delivery tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tracking information',
      error: error.message
    });
  }
};

// Update GPS location (for personal delivery with GPS tracking)
exports.updateGPSLocation = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

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
        message: 'Only the seller can update GPS location'
      });
    }

    // Check if GPS is enabled for this delivery
    if (!escrow.deliveryProof || !escrow.deliveryProof.gpsEnabled) {
      return res.status(400).json({
        success: false,
        message: 'GPS tracking is not enabled for this delivery'
      });
    }

    // Add GPS coordinate
    if (!escrow.deliveryProof.gpsCoordinates) {
      escrow.deliveryProof.gpsCoordinates = [];
    }

    escrow.deliveryProof.gpsCoordinates.push({
      lat: parseFloat(latitude),
      lng: parseFloat(longitude),
      timestamp: new Date()
    });

    await escrow.save();

    res.status(200).json({
      success: true,
      message: 'GPS location updated',
      location: {
        lat: parseFloat(latitude),
        lng: parseFloat(longitude),
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Update GPS location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update GPS location',
      error: error.message
    });
  }
};
