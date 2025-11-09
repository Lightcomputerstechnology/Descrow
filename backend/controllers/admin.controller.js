const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const Escrow = require('../models/Escrow.model');
const Dispute = require('../models/Dispute.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (adminId) => {
  return jwt.sign(
    { id: adminId, type: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Admin Login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find admin and include password
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (admin.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Contact master admin.'
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last active
    admin.lastActive = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = {
      totalUsers: await User.countDocuments(),
      totalEscrows: await Escrow.countDocuments(),
      activeEscrows: await Escrow.countDocuments({ status: { $in: ['in_escrow', 'awaiting_delivery'] } }),
      completedEscrows: await Escrow.countDocuments({ status: 'completed' }),
      pendingDisputes: await Dispute.countDocuments({ status: 'open' }),
      todayEscrows: await Escrow.countDocuments({ createdAt: { $gte: today } }),
      todayUsers: await User.countDocuments({ createdAt: { $gte: today } })
    };

    // Calculate total platform revenue (admin fees)
    const revenueData = await Escrow.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$adminFee' } } }
    ]);
    stats.totalRevenue = revenueData[0]?.totalRevenue || 0;

    // Recent escrows
    const recentEscrows = await Escrow.find()
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent disputes
    const recentDisputes = await Dispute.find()
      .populate('escrow')
      .populate('initiatedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      stats,
      recentEscrows,
      recentDisputes
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

// Get All Transactions
const getTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { escrowId: { $regex: search, $options: 'i' } },
        { itemName: { $regex: search, $options: 'i' } }
      ];
    }

    const escrows = await Escrow.find(query)
      .populate('buyer', 'name email verified')
      .populate('seller', 'name email verified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Escrow.countDocuments(query);

    res.status(200).json({
      success: true,
      escrows,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions',
      error: error.message
    });
  }
};

// Get All Disputes
const getDisputes = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const disputes = await Dispute.find(query)
      .populate('escrow')
      .populate('initiatedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Dispute.countDocuments(query);

    res.status(200).json({
      success: true,
      disputes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });

  } catch (error) {
    console.error('Get disputes error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disputes',
      error: error.message
    });
  }
};

// Resolve Dispute
const resolveDispute = async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { resolution, winner, refundAmount, notes } = req.body;

    const dispute = await Dispute.findById(disputeId).populate('escrow');
    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Update dispute
    dispute.status = 'resolved';
    dispute.resolution = resolution;
    dispute.winner = winner;
    dispute.refundAmount = refundAmount;
    dispute.resolvedBy = req.admin._id;
    dispute.resolvedAt = new Date();
    dispute.adminNotes = notes;
    await dispute.save();

    // Update escrow based on resolution
    const escrow = await Escrow.findById(dispute.escrow._id);
    if (winner === 'buyer') {
      escrow.status = 'cancelled';
      // Refund logic handled separately
    } else if (winner === 'seller') {
      escrow.status = 'completed';
      // Release payment to seller
      const seller = await User.findById(escrow.seller);
      seller.totalEarned += escrow.netAmount;
      await seller.save();
    }
    await escrow.save();

    // Update admin action count
    const admin = await Admin.findById(req.admin._id);
    admin.actionsCount += 1;
    await admin.save();

    // TODO: Send notification emails when email service is updated
    console.log('Dispute resolved - email notification pending');

    res.status(200).json({
      success: true,
      message: 'Dispute resolved successfully',
      dispute
    });

  } catch (error) {
    console.error('Resolve dispute error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve dispute',
      error: error.message
    });
  }
};

// Get All Users
const getUsers = async (req, res) => {
  try {
    const { verified, kycStatus, tier, page = 1, limit = 20, search } = req.query;

    const query = {};
    if (verified !== undefined) query.verified = verified === 'true';
    if (kycStatus) query.kycStatus = kycStatus;
    if (tier) query.tier = tier;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalCount: count
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Verify User (Email/KYC)
const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { verificationType, status, notes } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (verificationType === 'email') {
      user.verified = true;
    } else if (verificationType === 'kyc') {
      user.kycStatus = status; // 'approved' or 'rejected'
    }

    await user.save();

    // Update admin action count
    const admin = await Admin.findById(req.admin._id);
    admin.actionsCount += 1;
    await admin.save();

    // TODO: Send notification email when email service is updated
    console.log('User verified - email notification pending');

    res.status(200).json({
      success: true,
      message: `User ${verificationType} ${status || 'verified'} successfully`,
      user
    });

  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify user',
      error: error.message
    });
  }
};

// Suspend/Activate User
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Update admin action count
    const admin = await Admin.findById(req.admin._id);
    admin.actionsCount += 1;
    await admin.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'suspended'} successfully`,
      user
    });

  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// Get Analytics
const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const startDate = new Date();
    if (period === '7d') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === '30d') {
      startDate.setDate(startDate.getDate() - 30);
    } else if (period === '90d') {
      startDate.setDate(startDate.getDate() - 90);
    } else if (period === '1y') {
      startDate.setFullYear(startDate.getFullYear() - 1);
    }

    // Transactions over time
    const transactionsOverTime = await Escrow.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$adminFee' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by tier
    const revenueByTier = await Escrow.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: startDate } } },
      {
        $lookup: {
          from: 'users',
          localField: 'buyer',
          foreignField: '_id',
          as: 'buyerData'
        }
      },
      { $unwind: '$buyerData' },
      {
        $group: {
          _id: '$buyerData.tier',
          totalRevenue: { $sum: '$adminFee' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Payment method distribution
    const paymentMethods = await Escrow.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Dispute statistics
    const disputeStats = await Dispute.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // User growth
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        transactionsOverTime,
        revenueByTier,
        paymentMethods,
        disputeStats,
        userGrowth
      }
    });

  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message
    });
  }
};

// Get All Admins (Master admin only)
const getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find()
      .select('-password')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      admins
    });

  } catch (error) {
    console.error('Get admins error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admins',
      error: error.message
    });
  }
};

// Create Sub-Admin (Master admin only)
const createSubAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { name, email, password, permissions } = req.body;

    // Check if email already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create sub-admin
    const subAdmin = await Admin.create({
      name,
      email,
      password,
      role: 'sub_admin',
      permissions,
      createdBy: req.admin._id,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: 'Sub-admin created successfully',
      admin: {
        id: subAdmin._id,
        name: subAdmin.name,
        email: subAdmin.email,
        role: subAdmin.role,
        permissions: subAdmin.permissions
      }
    });

  } catch (error) {
    console.error('Create sub-admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sub-admin',
      error: error.message
    });
  }
};

// Update Sub-Admin Permissions (Master admin only)
const updateSubAdminPermissions = async (req, res) => {
  try {
    const { adminId } = req.params;
    const { permissions } = req.body;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.role === 'master') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify master admin permissions'
      });
    }

    admin.permissions = permissions;
    await admin.save();

    res.status(200).json({
      success: true,
      message: 'Permissions updated successfully',
      admin
    });

  } catch (error) {
    console.error('Update permissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update permissions',
      error: error.message
    });
  }
};

// Suspend/Activate Admin (Master admin only)
const toggleAdminStatus = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.role === 'master') {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend master admin'
      });
    }

    admin.status = admin.status === 'active' ? 'suspended' : 'active';
    await admin.save();

    res.status(200).json({
      success: true,
      message: `Admin ${admin.status === 'active' ? 'activated' : 'suspended'} successfully`,
      admin
    });

  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update admin status',
      error: error.message
    });
  }
};

// Delete Sub-Admin (Master admin only)
const deleteSubAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    if (admin.role === 'master') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete master admin'
      });
    }

    await Admin.findByIdAndDelete(adminId);

    res.status(200).json({
      success: true,
      message: 'Sub-admin deleted successfully'
    });

  } catch (error) {
    console.error('Delete sub-admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete sub-admin',
      error: error.message
    });
  }
};

// Export all functions
module.exports = {
  login,
  getDashboardStats,
  getTransactions,
  getDisputes,
  resolveDispute,
  getUsers,
  verifyUser,
  toggleUserStatus,
  getAnalytics,
  getAdmins,
  createSubAdmin,
  updateSubAdminPermissions,
  toggleAdminStatus,
  deleteSubAdmin
};