const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const User = require('../models/User.model');
const sendEmail = require('../utils/sendEmail'); // ✅ Resend version

// ============================================
// AUTH ROUTES
// ============================================

// Register new user
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Name is required')
      .isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),

    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Valid email is required')
      .normalizeEmail(),

    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Valid email is required'),

    body('password')
      .notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// Verify email
router.post('/verify-email', authController.verifyEmail);

// Resend verification email
router.post(
  '/resend-verification',
  [body('email').isEmail().withMessage('Valid email is required')],
  authController.resendVerification
);

// Request password reset
router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required')],
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  authController.resetPassword
);

// Refresh token
router.post('/refresh-token', authController.refreshToken);

// ============================================
// DEV TOOL: Force-verify user (for testing)
// ============================================

router.get('/dev/force-verify/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase();
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${email} has been force-verified.`,
    });
  } catch (error) {
    console.error('❌ Force verify error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ============================================
// DEV TOOL: Test Email Sending
// ============================================

router.get('/dev/test-email/:email', async (req, res) => {
  try {
    const { email } = req.params;

    const subject = '✅ Email Test Successful';
    const message = `
      <h2>Hello from Dealcross!</h2>
      <p>This is a test email sent using your Resend API integration.</p>
      <p>If you're seeing this, your new email setup is working 🎉</p>
    `;

    await sendEmail(email, subject, message);

    res.status(200).json({
      success: true,
      message: `✅ Test email sent successfully to ${email}`,
    });
  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
    });
  }
});

module.exports = router;