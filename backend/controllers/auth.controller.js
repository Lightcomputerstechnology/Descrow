// controllers/auth.controller.js
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');

// -------------------- Helper: Generate JWT --------------------
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1d' } // shorter expiry for verification
  );
};

// ------------------------- REGISTER -------------------------
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    const user = await User.create({
      name,
      email,
      password,
      role: 'dual',
      tier: 'free',
      verified: false
    });

    const verificationToken = generateToken(user._id);

    // ✅ Send verification email with await
    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true,
      email: user.email
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

// ------------------------- LOGIN -------------------------
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    if (!user.verified)
      return res.status(403).json({ success: false, message: 'Please verify your email first', requiresVerification: true, email: user.email });
    if (!user.isActive)
      return res.status(403).json({ success: false, message: 'Account is suspended. Contact support.' });

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tier: user.tier,
        verified: user.verified,
        kycStatus: user.kycStatus
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

// ------------------------- VERIFY EMAIL (POST) -------------------------
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token)
      return res.status(400).json({ success: false, message: 'Verification token is required' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });
    if (user.verified)
      return res.status(400).json({ success: false, message: 'Email already verified' });

    user.verified = true;
    await user.save();

    await emailService.sendWelcomeEmail(user.email, user.name);

    res.status(200).json({ success: true, message: 'Email verified successfully! You can now login.' });

  } catch (error) {
    console.error('❌ Verify email error:', error);
    if (error.name === 'TokenExpiredError')
      return res.status(400).json({ success: false, message: 'Verification token expired. Please request a new one.' });
    if (error.name === 'JsonWebTokenError')
      return res.status(400).json({ success: false, message: 'Invalid verification token' });

    res.status(500).json({ success: false, message: 'Email verification failed' });
  }
};

// ------------------------- VERIFY EMAIL (GET) - For click link -------------------------
exports.verifyEmailRedirect = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return res.redirect(`${process.env.FRONTEND_URL}/verify-error?reason=user-not-found`);
    if (user.verified)
      return res.redirect(`${process.env.FRONTEND_URL}/verify-success?already=true`);

    user.verified = true;
    await user.save();

    await emailService.sendWelcomeEmail(user.email, user.name);

    return res.redirect(`${process.env.FRONTEND_URL}/verify-success`);
  } catch (error) {
    console.error('❌ Verify redirect error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/verify-error?reason=invalid-token`);
  }
};

// ------------------------- RESEND VERIFICATION -------------------------
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ success: false, message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    if (user.verified)
      return res.status(400).json({ success: false, message: 'Email already verified' });

    const verificationToken = generateToken(user._id);
    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    res.status(200).json({ success: true, message: 'Verification email resent successfully' });

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({ success: false, message: 'Failed to resend verification email' });
  }
};

// ------------------------- FORGOT PASSWORD -------------------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: 'No account found with that email' });

    const resetToken = generateToken(user._id);
    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);

    res.status(200).json({ success: true, message: 'Password reset link sent to your email' });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to send reset email' });
  }
};

// ------------------------- RESET PASSWORD -------------------------
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    user.password = password;
    await user.save();

    await emailService.sendPasswordChangedEmail(user.email, user.name);

    res.status(200).json({ success: true, message: 'Password reset successful' });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ------------------------- REFRESH TOKEN -------------------------
exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'Invalid token' });

    const newToken = generateToken(user._id);
    res.status(200).json({ success: true, token: newToken });

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(401).json({ success: false, message: 'Token refresh failed' });
  }
};