// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const emailService = require('../services/email.service');
const jwt = require('jsonwebtoken');

// ---------------- DEV: Test Email ----------------
router.get('/dev/test-email', async (req, res) => {
  try {
    const email = req.query.email; // Pass email as query: ?email=someone@example.com
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Generate a dummy verification token for testing
    const testToken = jwt.sign(
      { id: 'test-user-id' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    await emailService.sendVerificationEmail(email, 'Test User', testToken);

    res.status(200).json({
      success: true,
      message: `Test verification email sent to ${email}`
    });

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