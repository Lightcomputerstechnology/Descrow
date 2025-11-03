// routes/auth.routes.js
const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authController = require('../controllers/auth.controller');
const emailService = require('../services/email.service');

// ------------------------- REGISTER -------------------------
router.post(
  '/register',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  authController.register
);

// ------------------------- LOGIN -------------------------
router.post(
  '/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  authController.login
);

// ------------------------- VERIFY EMAIL -------------------------
router.post(
  '/verify-email',
  body('token').notEmpty().withMessage('Verification token is required'),
  authController.verifyEmail
);

// ------------------------- RESEND VERIFICATION -------------------------
router.post(
  '/resend-verification',
  body('email').isEmail().withMessage('Valid email is required'),
  authController.resendVerification
);

// ------------------------- FORGOT PASSWORD -------------------------
router.post(
  '/forgot-password',
  body('email').isEmail().withMessage('Valid email is required'),
  authController.forgotPassword
);

// ------------------------- RESET PASSWORD -------------------------
router.post(
  '/reset-password',
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  authController.resetPassword
);

// ------------------------- REFRESH TOKEN -------------------------
router.post(
  '/refresh-token',
  body('token').notEmpty().withMessage('Token is required'),
  authController.refreshToken
);

// ------------------------- DEV TEST EMAIL -------------------------
// Example: GET /api/auth/dev/test-email/your@email.com
router.get('/dev/test-email/:email', async (req, res) => {
  try {
    const toEmail = req.params.email;
    if (!toEmail) return res.status(400).json({ success: false, message: 'Email is required' });

    // Send a test email
    await emailService.sendEmail(toEmail, 'Test Email - Dealcross', `<p>This is a test email from Dealcross backend.</p>`);

    res.status(200).json({ success: true, message: `Test email sent to ${toEmail}` });
  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email', error: error.message });
  }
});

module.exports = router;