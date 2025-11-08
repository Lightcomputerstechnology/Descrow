const PlatformSettings = require('../models/PlatformSettings');
const Escrow = require('../models/Escrow');

/**
 * Get current platform settings
 */
exports.getSettings = async (req, res) => {
  try {
    const settings = await PlatformSettings.getSettings();

    res.json({
      success: true,
      data: settings
    });

  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings'
    });
  }
};

/**
 * Update fee settings (Admin only)
 */
exports.updateFeeSettings = async (req, res) => {
  try {
    const { percentage, buyerShare, sellerShare, minimumFee, maximumPercentage } = req.body;

    // Validation
    if (percentage < 0 || percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Fee percentage must be between 0 and 100'
      });
    }

    if (buyerShare + sellerShare !== 100) {
      return res.status(400).json({
        success: false,
        message: 'Buyer and seller share must total 100%'
      });
    }

    if (minimumFee < 0) {
      return res.status(400).json({
        success: false,
        message: 'Minimum fee cannot be negative'
      });
    }

    const settings = await PlatformSettings.getSettings();

    // Store old settings for history
    const oldSettings = {
      percentage: settings.fees.percentage,
      buyerShare: settings.fees.buyerShare,
      sellerShare: settings.fees.sellerShare,
      minimumFee: settings.fees.minimumFee,
      maximumPercentage: settings.fees.maximumPercentage
    };

    // Update settings
    settings.fees.percentage = percentage;
    settings.fees.buyerShare = buyerShare;
    settings.fees.sellerShare = sellerShare;
    settings.fees.minimumFee = minimumFee;
    settings.fees.maximumPercentage = maximumPercentage;
    settings.lastUpdated = new Date();
    settings.updatedBy = req.admin.id;

    await settings.save();

    // Log the change (you can create a FeeHistory model for this)
    console.log('Fee settings updated:', {
      admin: req.admin.email,
      old: oldSettings,
      new: settings.fees,
      timestamp: new Date()
    });

    res.json({
      success: true,
      message: 'Fee settings updated successfully',
      data: settings
    });

  } catch (error) {
    console.error('Update fee settings error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update fee settings'
    });
  }
};

/**
 * Preview fee impact on revenue
 */
exports.previewFeeImpact = async (req, res) => {
  try {
    const { newPercentage, buyerShare, sellerShare } = req.body;

    // Get last 30 days of completed transactions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEscrows = await Escrow.find({
      status: { $in: ['completed', 'paid_out'] },
      'payment.paidAt': { $gte: thirtyDaysAgo }
    });

    // Calculate current revenue
    const currentRevenue = recentEscrows.reduce((sum, escrow) => {
      return sum + (escrow.payment?.platformFee || 0);
    }, 0);

    // Calculate projected revenue with new fee
    const projectedRevenue = recentEscrows.reduce((sum, escrow) => {
      const amount = escrow.amount;
      const newFee = (amount * newPercentage) / 100;
      return sum + newFee;
    }, 0);

    const difference = projectedRevenue - currentRevenue;
    const percentageChange = currentRevenue > 0 
      ? ((difference / currentRevenue) * 100).toFixed(2)
      : 0;

    // Calculate average transaction fee
    const avgCurrentFee = recentEscrows.length > 0
      ? currentRevenue / recentEscrows.length
      : 0;

    const avgProjectedFee = recentEscrows.length > 0
      ? projectedRevenue / recentEscrows.length
      : 0;

    res.json({
      success: true,
      data: {
        timeframe: 'Last 30 days',
        transactionCount: recentEscrows.length,
        currentRevenue: parseFloat(currentRevenue.toFixed(2)),
        projectedRevenue: parseFloat(projectedRevenue.toFixed(2)),
        difference: parseFloat(difference.toFixed(2)),
        percentageChange: parseFloat(percentageChange),
        avgCurrentFee: parseFloat(avgCurrentFee.toFixed(2)),
        avgProjectedFee: parseFloat(avgProjectedFee.toFixed(2)),
        suggestion: difference > 0 
          ? `Fee increase will generate an additional $${Math.abs(difference).toFixed(2)}/month`
          : `Fee decrease will reduce revenue by $${Math.abs(difference).toFixed(2)}/month`
      }
    });

  } catch (error) {
    console.error('Preview fee impact error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fee impact'
    });
  }
};

/**
 * Get fee history/audit log
 */
exports.getFeeHistory = async (req, res) => {
  try {
    // For now, we'll return the last update info
    // In production, create a FeeHistory model to track all changes
    const settings = await PlatformSettings.getSettings()
      .populate('updatedBy', 'name email');

    res.json({
      success: true,
      data: {
        current: settings.fees,
        lastUpdated: settings.lastUpdated,
        updatedBy: settings.updatedBy
      }
    });

  } catch (error) {
    console.error('Get fee history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch fee history'
    });
  }
};

/**
 * Calculate fees for test amount (public endpoint for users)
 */
exports.calculateTestFee = async (req, res) => {
  try {
    const { amount } = req.query;

    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }

    const settings = await PlatformSettings.getSettings();
    const { percentage, minimumFee, maximumPercentage, buyerShare, sellerShare } = settings.fees;

    const testAmount = parseFloat(amount);
    let totalFee = (testAmount * percentage) / 100;

    // Apply minimum
    if (totalFee < minimumFee) {
      totalFee = minimumFee;
    }

    // Apply maximum cap
    const maxFee = (testAmount * maximumPercentage) / 100;
    if (totalFee > maxFee) {
      totalFee = maxFee;
    }

    const buyerFee = (totalFee * buyerShare) / 100;
    const sellerFee = (totalFee * sellerShare) / 100;

    res.json({
      success: true,
      data: {
        amount: testAmount,
        feePercentage: percentage,
        buyerShare,
        sellerShare,
        totalFee: parseFloat(totalFee.toFixed(2)),
        buyerFee: parseFloat(buyerFee.toFixed(2)),
        sellerFee: parseFloat(sellerFee.toFixed(2)),
        buyerPays: parseFloat((testAmount + buyerFee).toFixed(2)),
        sellerReceives: parseFloat((testAmount - sellerFee).toFixed(2)),
        platformEarns: parseFloat(totalFee.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Calculate test fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate fee'
    });
  }
};

/**
 * Toggle maintenance mode
 */
exports.toggleMaintenance = async (req, res) => {
  try {
    const { enabled, message } = req.body;

    const settings = await PlatformSettings.getSettings();
    settings.maintenance.enabled = enabled;
    settings.maintenance.message = message || 'We are currently under maintenance. Please check back soon.';
    
    await settings.save();

    res.json({
      success: true,
      message: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}`,
      data: settings.maintenance
    });

  } catch (error) {
    console.error('Toggle maintenance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle maintenance mode'
    });
  }
};
