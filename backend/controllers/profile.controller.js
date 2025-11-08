const User = require('../models/User');
const KYCVerification = require('../models/KYCVerification');
const multer = require('multer');
const path = require('path');

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('kycVerification');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
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
    ).select('-password');

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
      ).select('-password');

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
 * Submit KYC verification
 */
exports.submitKYC = async (req, res) => {
  try {
    const {
      personalInfo,
      businessInfo,
      tier
    } = req.body;

    // Check if KYC already exists
    let kyc = await KYCVerification.findOne({ user: req.user.id });

    if (kyc && kyc.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Your KYC is already approved'
      });
    }

    if (kyc && kyc.status === 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Your KYC is already under review'
      });
    }

    if (kyc) {
      // Update existing KYC
      kyc.personalInfo = personalInfo;
      kyc.businessInfo = businessInfo;
      kyc.tier = tier || 'basic';
      kyc.status = 'pending';
      await kyc.save();
    } else {
      // Create new KYC
      kyc = await KYCVerification.create({
        user: req.user.id,
        personalInfo,
        businessInfo,
        tier: tier || 'basic',
        status: 'pending'
      });
    }

    // Update user's KYC reference
    await User.findByIdAndUpdate(req.user.id, {
      kycVerification: kyc._id
    });

    res.json({
      success: true,
      message: 'KYC submitted successfully. We will review within 24-48 hours.',
      data: kyc
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
 * Get KYC status
 */
exports.getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYCVerification.findOne({ user: req.user.id });

    if (!kyc) {
      return res.json({
        success: true,
        data: {
          status: 'unverified',
          tier: 'basic'
        }
      });
    }

    res.json({
      success: true,
      data: kyc
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

    const user = await User.findById(req.user.id);

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

    const user = await User.findById(req.user.id);

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Check for active escrows
    const activeEscrows = await Escrow.countDocuments({
      $or: [{ buyer: req.user.id }, { seller: req.user.id }],
      status: { $nin: ['completed', 'paid_out', 'cancelled'] }
    });

    if (activeEscrows > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete account with ${activeEscrows} active transaction(s)`
      });
    }

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
