// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const emailService = require('../services/email.service');
const jwt = require('jsonwebtoken');

// ------------------------- TEST EMAIL (DEV ONLY) -------------------------
router.get('/dev/test-email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Generate a dummy verification token for testing
    const testToken = jwt.sign(
      { id: 'test-user-id' }, // Replace with a real user ID if needed
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send test verification email
    await emailService.sendVerificationEmail(email, 'Test User', testToken);

    res.status(200).json({ success: true, message: `Test email sent to ${email}` });
  } catch (error) {
    console.error('❌ Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
});

module.exports = router;