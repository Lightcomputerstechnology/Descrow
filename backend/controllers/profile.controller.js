const User = require('../models/User.model');
const multer = require('multer');
const path = require('path');

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    // ✅ FIXED: Remove populate for kycVerification since it doesn't exist
    const user = await User.findById(req.user.id)
      .select('-password -twoFactorSecret -apiAccess.apiSecret');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Ensure kycStatus has proper structure
    const userData = user.toObject ? user.toObject() : user;
    
    // Add virtual fields for compatibility
    const profile = {
      ...userData,
      kycStatus: userData.kycStatus || {
        status: 'unverified',
        tier: 'basic',
        documents: [],
        personalInfo: {},
        businessInfo: {}
      }
    };

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
};

/**
 * Update profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, bio, address, socialLinks, businessInfo } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (phone) updates.phone = phone;
    if (bio) updates.bio = bio;
    if (address) updates.address = address;
    if (socialLinks) updates.socialLinks = socialLinks;
    if (businessInfo) updates.businessInfo = businessInfo;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password -twoFactorSecret -apiAccess.apiSecret');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update profile'
    });
  }
};

/**
 * Upload profile picture
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `avatar-${req.user.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
}).single('avatar');

exports.uploadAvatar = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    try {
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { profilePicture: avatarUrl },
        { new: true }
      ).select('-password -twoFactorSecret -apiAccess.apiSecret');

      res.json({
        success: true,
        message: 'Avatar uploaded successfully',
        data: {
          avatarUrl,
          user
        }
      });

    } catch (error) {
      console.error('Upload avatar error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload avatar'
      });
    }
  });
};

/**
 * Submit KYC verification - UPDATED for embedded kycStatus
 */
exports.submitKYC = async (req, res) => {
  try {
    const {
      personalInfo,
      businessInfo,
      tier
    } = req.body;

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if KYC is already approved
    if (user.kycStatus && user.kycStatus.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Your KYC is already approved'
      });
    }

    // Check if KYC is already pending
    if (user.kycStatus && user.kycStatus.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Your KYC is already under review'
      });
    }

    // Update user's embedded kycStatus
    user.kycStatus = {
      status: 'pending',
      tier: tier || 'basic',
      submittedAt: new Date(),
      reviewedAt: null,
      rejectionReason: null,
      resubmissionAllowed: true,
      verificationId: null,
      documents: user.kycStatus?.documents || [],
      personalInfo: personalInfo || {},
      businessInfo: businessInfo || {}
    };

    await user.save();

    res.json({
      success: true,
      message: 'KYC submitted successfully. We will review within 24-48 hours.',
      data: { kycStatus: user.kycStatus }
    });

  } catch (error) {
    console.error('Submit KYC error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit KYC'
    });
  }
};

/**
 * Get KYC status - UPDATED for embedded kycStatus
 */
exports.getKYCStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('kycStatus isKYCVerified');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return embedded kycStatus
    res.json({
      success: true,
      data: {
        status: user.kycStatus?.status || 'unverified',
        tier: user.kycStatus?.tier || 'basic',
        submittedAt: user.kycStatus?.submittedAt,
        reviewedAt: user.kycStatus?.reviewedAt,
        rejectionReason: user.kycStatus?.rejectionReason,
        documents: user.kycStatus?.documents || [],
        personalInfo: user.kycStatus?.personalInfo || {},
        businessInfo: user.kycStatus?.businessInfo || {},
        isKYCVerified: user.isKYCVerified
      }
    });

  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch KYC status'
    });
  }
};

/**
 * Upload KYC documents - NEW METHOD for embedded kycStatus
 */
exports.uploadKYCDocuments = async (req, res) => {
  try {
    const { documentType } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Initialize kycStatus if it doesn't exist
    if (!user.kycStatus) {
      user.kycStatus = {
        status: 'unverified',
        tier: 'basic',
        documents: [],
        personalInfo: {},
        businessInfo: {}
      };
    }

    // Ensure documents array exists
    if (!Array.isArray(user.kycStatus.documents)) {
      user.kycStatus.documents = [];
    }

    // Add new document
    const documentUrl = `/uploads/kyc/${req.file.filename}`;
    user.kycStatus.documents.push({
      type: documentType,
      url: documentUrl,
      uploadedAt: new Date(),
      verified: false
    });

    // Update status to pending if documents are uploaded
    if (user.kycStatus.status === 'unverified') {
      user.kycStatus.status = 'pending';
    }

    await user.save();

    res.json({
      success: true,
      message: 'KYC document uploaded successfully',
      data: { 
        document: {
          type: documentType,
          url: documentUrl,
          uploadedAt: new Date()
        },
        kycStatus: user.kycStatus
      }
    });

  } catch (error) {
    console.error('Upload KYC document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload KYC document'
    });
  }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

/**
 * Delete account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const { password, reason } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Check for active escrows (you'll need to import Escrow model)
    // const activeEscrows = await Escrow.countDocuments({
    //   $or: [{ buyer: req.user.id }, { seller: req.user.id }],
    //   status: { $nin: ['completed', 'paid_out', 'cancelled'] }
    // });

    // if (activeEscrows > 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: `Cannot delete account with ${activeEscrows} active transaction(s)`
    //   });
    // }

    // Soft delete (mark as deleted instead of removing)
    user.status = 'deleted';
    user.deletedAt = new Date();
    user.deletionReason = reason;
    await user.save();

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });

  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};