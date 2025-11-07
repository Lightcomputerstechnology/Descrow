const mongoose = require('mongoose');
const User = require('../models/User.model');
require('dotenv').config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const email = process.argv[2];
    const newPassword = process.argv[3];

    if (!email || !newPassword) {
      console.log('Usage: node scripts/reset-password.js <email> <newPassword>');
      process.exit(1);
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log('Found user:', user.email);

    // Set new password (pre-save hook will hash it automatically)
    user.password = newPassword;
    await user.save();

    console.log('✅ Password updated successfully!');
    console.log('You can now login with:', newPassword);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPassword();
