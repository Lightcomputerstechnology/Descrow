const express = require('express');
const { body } = require('express-validator');
const router = express.Router();

const authController = require('../controllers/auth.controller');

// ---------------- REGISTER ----------------
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  authController.register
);

// ---------------- LOGIN ----------------
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

// ---------------- VERIFY EMAIL ----------------
router.post('/verify-email', authController.verifyEmail);

// ---------------- RESEND VERIFICATION ----------------
router.post('/resend-verification', authController.resendVerification);

// ---------------- FORGOT PASSWORD ----------------
router.post('/forgot-password', authController.forgotPassword);

// ---------------- RESET PASSWORD ----------------
router.post('/reset-password', authController.resetPassword);

// ---------------- REFRESH TOKEN ----------------
router.post('/refresh-token', authController.refreshToken);

// ---------------- TEST EMAIL ----------------
router.get('/dev/test-email/:email', async (req, res) => {
  try {
    const testEmail = req.params.email;
    if (!testEmail) return res.status(400).json({ success: false, message: 'Email is required' });

    const html = `
      <h2>Test Email</h2>
      <p>This is a test email from Dealcross using the Resend API.</p>
    `;
    await require('../services/email.service').sendEmail(testEmail, 'Dealcross Test Email', html);

    res.status(200).json({ success: true, message: `Test email sent to ${testEmail}` });
  } catch (error) {
    console.error('❌ Email test failed:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email', error: error.message });
  }
});

module.exports = router;