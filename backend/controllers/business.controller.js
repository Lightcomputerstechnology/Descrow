// backend/controllers/business.controller.js - BUSINESS REGISTRATION

const Business = require('../models/Business.model');
const crypto = require('crypto');

// Register business
exports.registerBusiness = async (req, res) => {
  try {
    const {
      businessName,
      businessEmail,
      businessType,
      registrationNumber,
      taxId,
      address,
      phone,
      website,
      description
    } = req.body;

    // Check if user already has a business
    const existingBusiness = await Business.findOne({ owner: req.user._id });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: 'You already have a registered business'
      });
    }

    // Create business
    const business = new Business({
      owner: req.user._id,
      businessName,
      businessEmail,
      businessType,
      registrationNumber,
      taxId,
      address,
      phone,
      website,
      description,
      verification: {
        status: 'pending'
      }
    });

    await business.save();

    res.status(201).json({
      success: true,
      message: 'Business registered successfully. Awaiting verification.',
      data: { business }
    });
  } catch (error) {
    console.error('Register business error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register business'
    });
  }
};

// Upload business documents
exports.uploadDocuments = async (req, res) => {
  try {
    const { businessId } = req.params;
    const { documents } = req.body; // Array of { type, url }

    const business = await Business.findOne({
      businessId,
      owner: req.user._id
    });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    documents.forEach(doc => {
      business.documents.push({
        type: doc.type,
        url: doc.url,
        uploadedAt: new Date()
      });
    });

    business.verification.status = 'in_review';
    await business.save();

    res.status(200).json({
      success: true,
      message: 'Documents uploaded successfully',
      data: { business }
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload documents'
    });
  }
};

// Generate API keys (admin only after approval)
exports.generateApiKeys = async (req, res) => {
  try {
    const { businessId } = req.params;

    const business = await Business.findOne({ businessId });

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if business is verified
    if (business.verification.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Business must be verified before API access is granted'
      });
    }

    // Generate API key and secret
    const apiKey = `dk_live_${crypto.randomBytes(24).toString('hex')}`;
    const apiSecret = crypto.randomBytes(32).toString('hex');

    business.apiAccess.enabled = true;
    business.apiAccess.apiKey = apiKey;
    business.apiAccess.apiSecret = crypto.createHash('sha256').update(apiSecret).digest('hex');

    await business.save();

    res.status(200).json({
      success: true,
      message: 'API keys generated successfully',
      data: {
        apiKey,
        apiSecret, // Show only once
        warning: 'Store the API secret securely. It will not be shown again.'
      }
    });
  } catch (error) {
    console.error('Generate API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate API keys'
    });
  }
};

// Get business details
exports.getBusinessDetails = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.user._id })
      .populate('owner', 'name email');

    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'No business registered'
      });
    }

    res.status(200).json({
      success: true,
      data: { business }
    });
  } catch (error) {
    console.error('Get business error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business details'
    });
  }
};