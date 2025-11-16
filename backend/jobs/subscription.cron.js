// backend/jobs/subscription.cron.js - Automatic Subscription Management

const cron = require('node-cron');
const User = require('../models/User.model');
const feeConfig = require('../config/fee.config');

// ✅ Run daily at midnight to check expired subscriptions
const checkExpiredSubscriptions = async () => {
  try {
    console.log('🔄 Checking expired subscriptions...');

    const now = new Date();

    // Find users with expired subscriptions
    const expiredUsers = await User.find({
      tier: { $ne: 'starter' },
      'subscription.status': 'active',
      'subscription.endDate': { $lte: now }
    });

    console.log(`Found ${expiredUsers.length} expired subscriptions`);

    for (const user of expiredUsers) {
      // If auto-renew is enabled, attempt renewal
      if (user.subscription.autoRenew) {
        // TODO: Charge payment method on file
        // For now, mark as expired
        console.log(`⚠️ Auto-renew failed for user ${user._id} - no payment method`);
        
        user.subscription.status = 'expired';
        user.tier = 'starter'; // Downgrade to starter
        await user.save();

        // TODO: Send email notification
        console.log(`📧 Sent expiration notice to ${user.email}`);
      } else {
        // No auto-renew, downgrade to starter
        user.subscription.status = 'expired';
        user.tier = 'starter';
        await user.save();

        console.log(`⬇️ User ${user._id} downgraded to starter tier`);
      }
    }

    console.log('✅ Subscription check complete');
  } catch (error) {
    console.error('❌ Subscription check error:', error);
  }
};

// ✅ Check for upcoming renewals (7 days before)
const notifyUpcomingRenewals = async () => {
  try {
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const upcomingRenewals = await User.find({
      tier: { $ne: 'starter' },
      'subscription.status': 'active',
      'subscription.endDate': {
        $gte: now,
        $lte: sevenDaysFromNow
      }
    });

    console.log(`📬 Found ${upcomingRenewals.length} upcoming renewals`);

    for (const user of upcomingRenewals) {
      // TODO: Send renewal reminder email
      console.log(`📧 Sent renewal reminder to ${user.email}`);
    }
  } catch (error) {
    console.error('❌ Renewal notification error:', error);
  }
};

// ✅ Schedule jobs
const startSubscriptionCron = () => {
  // Check expired subscriptions daily at midnight
  cron.schedule('0 0 * * *', checkExpiredSubscriptions);

  // Send renewal reminders daily at 9 AM
  cron.schedule('0 9 * * *', notifyUpcomingRenewals);

  console.log('✅ Subscription cron jobs started');
};

module.exports = { startSubscriptionCron, checkExpiredSubscriptions, notifyUpcomingRenewals };
