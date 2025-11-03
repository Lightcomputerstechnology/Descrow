// routes/auth.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// ------------------------- REGISTER -------------------------
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.register
);

// ------------------------- LOGIN -------------------------
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

// ------------------------- VERIFY EMAIL -------------------------
router.post(
  '/verify-email',
  [
    body('token').notEmpty().withMessage('Verification token is required'),
  ],
  authController.verifyEmail
);

// ------------------------- RESEND VERIFICATION -------------------------
router.post(
  '/resend-verification',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  authController.resendVerification
);

// ------------------------- FORGOT PASSWORD -------------------------
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Valid email is required'),
  ],
  authController.forgotPassword
);

// ------------------------- RESET PASSWORD -------------------------
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  authController.resetPassword
);

// ------------------------- REFRESH TOKEN -------------------------
router.post(
  '/refresh-token',
  [
    body('token').notEmpty().withMessage('Token is required'),
  ],
  authController.refreshToken
);

module.exports = router;