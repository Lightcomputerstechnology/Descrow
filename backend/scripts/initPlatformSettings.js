const mongoose = require('mongoose');
require('dotenv').config();
const PlatformSettings = require('../models/PlatformSettings');

async function initSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if settings already exist
    let settings = await PlatformSettings.findOne();

    if (!settings) {
      settings = await PlatformSettings.create({
        fees: {
          percentage: 2.5,
          buyerShare: 50,
          sellerShare: 50,
          minimumFee: 0.50,
          maximumPercentage: 2.5,
          currency: 'USD'
        },
        maintenance: {
          enabled: false,
          message: 'We are currently under maintenance. Please check back soon.'
        }
      });

      console.log('✅ Platform settings initialized:', settings.fees);
    } else {
      console.log('ℹ️ Platform settings already exist');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initSettings();
