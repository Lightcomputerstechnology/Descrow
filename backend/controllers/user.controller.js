const User = require('../models/User.model');
const Escrow = require('../models/Escrow.model');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');

// Get User Profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get tier limits
    const tierLimits = user.getTierLimits();

    res.status(200).json({
      success: true,
      user,
      tierLimits
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, phone, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Send email notification
    await emailService.sendPasswordChangedEmail(user.email, user.name);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Upload KYC Documents
exports.uploadKYC = async (req, res) => {
  try {
    const { documentUrls } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add documents
    user.kycDocuments = documentUrls;
    user.kycStatus = 'pending';
    await user.save();

    // Notify admin
    console.log(`Admin notification: KYC documents uploaded by user ${user._id}`);

    res.status(200).json({
      success: true,
      message: 'KYC documents uploaded successfully. Verification in progress.',
      user: {
        kycStatus: user.kycStatus,
        kycDocuments: user.kycDocuments
      }
    });

  } catch (error) {
    console.error('Upload KYC error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload KYC documents',
      error: error.message
    });
  }
};

// Upgrade Tier
exports.upgradeTier = async (req, res) => {
  try {
    const { tier, paymentReference } = req.body;

    const validTiers = ['basic', 'pro', 'enterprise'];
    if (!validTiers.includes(tier)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tier. Choose: basic, pro, or enterprise'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already on higher or same tier
    const tierHierarchy = { free: 0, basic: 1, pro: 2, enterprise: 3 };
    if (tierHierarchy[user.tier] >= tierHierarchy[tier]) {
      return res.status(400).json({
        success: false,
        message: 'Cannot downgrade or upgrade to same tier'
      });
    }

    // Verify payment (simplified - in production, verify with payment gateway)
    // For now, just upgrade if payment reference provided
    if (!paymentReference) {
      return res.status(400).json({
        success: false,
        message: 'Payment reference required'
      });
    }

    // Upgrade tier
    user.tier = tier;
    await user.save();

    // Send confirmation email
    await emailService.sendTierUpgradeEmail(user.email, user.name, tier);

    res.status(200).json({
      success: true,
      message: `Successfully upgraded to ${tier} tier`,
      user: {
        tier: user.tier,
        tierLimits: user.getTierLimits()
      }
    });

  } catch (error) {
    console.error('Upgrade tier error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upgrade tier',
      error: error.message
    });
  }
};

// Get User Statistics
exports.getUserStatistics = async (req, res) => {
  try {
    const userId = req.user._id;

    // Buying statistics
    const buyingEscrows = await Escrow.find({ buyer: userId });
    const buyingStats = {
      total: buyingEscrows.length,
      inEscrow: buyingEscrows.filter(e => e.status === 'in_escrow').length,
      inTransit: buyingEscrows.filter(e => e.status === 'awaiting_delivery').length,
      completed: buyingEscrows.filter(e => e.status === 'completed').length,
      disputed: buyingEscrows.filter(e => e.status === 'disputed').length,
      cancelled: buyingEscrows.filter(e => e.status === 'cancelled').length,
      totalSpent: req.user.totalSpent
    };

    // Selling statistics
    const sellingEscrows = await Escrow.find({ seller: userId });
    const sellingStats = {
      total: sellingEscrows.length,
      pending: sellingEscrows.filter(e => e.status === 'in_escrow').length,
      shipped: sellingEscrows.filter(e => e.status === 'awaiting_delivery').length,
      completed: sellingEscrows.filter(e => e.status === 'completed').length,
      disputed: sellingEscrows.filter(e => e.status === 'disputed').length,
      totalEarned: req.user.totalEarned
    };

    // Monthly transaction count (for tier limits)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyCount = await Escrow.countDocuments({
      buyer: userId,
      createdAt: {
        $gte: new Date(currentYear, currentMonth, 1),
        $lt: new Date(currentYear, currentMonth + 1, 1)
      }
    });

    const tierLimits = req.user.getTierLimits();

    res.status(200).json({
      success: true,
      statistics: {
        buying: buyingStats,
        selling: sellingStats,
        monthlyTransactions: {
          count: monthlyCount,
          limit: tierLimits.maxTransactionsPerMonth,
          remaining: tierLimits.maxTransactionsPerMonth === -1 ? 'Unlimited' : tierLimits.maxTransactionsPerMonth - monthlyCount
        },
        tier: req.user.tier,
        tierLimits
      }
    });

  } catch (error) {
    console.error('Get user statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// Enable 2FA
exports.enable2FA = async (req, res) => {
  try {
    const speakeasy = require('speakeasy');
    const QRCode = require('qrcode');

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Dealcross (${user.email})`
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret (temporarily)
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA setup initiated',
      qrCode: qrCodeUrl,
      secret: secret.base32,
      instructions: 'Scan QR code with Google Authenticator or enter secret manually'
    });

  } catch (error) {
    console.error('Enable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enable 2FA',
      error: error.message
    });
  }
};

// Verify 2FA and Enable
exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const speakeasy = require('speakeasy');

    const user = await User.findById(req.user._id).select('+twoFactorSecret');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA enabled successfully'
    });

  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA',
      error: error.message
    });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  try {
    const { password } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA',
      error: error.message
    });
  }
};
