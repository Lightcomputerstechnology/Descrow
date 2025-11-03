const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const emailService = require('../services/email.service');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Register new user
exports.register = async (req, res) => {
  try {
    console.log('📝 Registration attempt:', { 
      name: req.body.name, 
      email: req.body.email,
      hasPassword: !!req.body.password,
      passwordLength: req.body.password?.length 
    });

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already exists:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new user (NOT VERIFIED by default)
    const user = await User.create({
      name,
      email,
      password,
      role: 'dual',
      tier: 'free',
      verified: false // Must verify email
    });

    console.log('✅ User created successfully:', { id: user._id, email: user.email });

    // Generate verification token
    const verificationToken = generateToken(user._id);

    // Send verification email (NON-BLOCKING)
    emailService.sendVerificationEmail(user.email, user.name, verificationToken)
      .then(() => console.log('✅ Verification email sent to:', user.email))
      .catch(err => console.log('⚠️ Verification email failed:', err.message));

    // DON'T return JWT token - user must verify email first
    res.status(201).json({
      success: true,
      message: 'Registration successful! Please check your email to verify your account.',
      requiresVerification: true,
      email: user.email
    });

  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    console.log('🔐 Login attempt:', { email: req.body.email });

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Login validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if email is verified
    if (!user.verified) {
      console.log('⚠️ Email not verified:', email);
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        requiresVerification: true,
        email: user.email
      });
    }

    // Check if account is active
    if (!user.isActive) {
      console.log('❌ Account suspended:', email);
      return res.status(403).json({
        success: false,
        message: 'Account is suspended. Contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    console.log('✅ Login successful:', { id: user._id, email: user.email });

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
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    console.log('📧 Email verification attempt');

    const { token } = req.body;

    if (!token) {
      console.log('❌ No verification token provided');
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    // Verify token and get user ID
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token decoded:', { userId: decoded.id });
    
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ User not found for token');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if already verified
    if (user.verified) {
      console.log('⚠️ Email already verified:', user.email);
      return res.status(400).json({
        success: false,
        message: 'Email already verified. You can login now.'
      });
    }

    // Verify the user
    user.verified = true;
    await user.save();

    console.log('✅ Email verified successfully:', user.email);

    // Send welcome email after verification
    emailService.sendWelcomeEmail(user.email, user.name)
      .then(() => console.log('✅ Welcome email sent'))
      .catch(err => console.log('⚠️ Welcome email failed:', err.message));

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now login.'
    });

  } catch (error) {
    console.error('❌ Verify email error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired. Please request a new one.'
      });
    }
    
    res.status(400).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    console.log('🔄 Resend verification attempt:', req.body.email);

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({
        success: false,
        message: 'No account found with that email'
      });
    }

    if (user.verified) {
      console.log('⚠️ Email already verified:', email);
      return res.status(400).json({
        success: false,
        message: 'Email already verified. You can login now.'
      });
    }

    // Generate new verification token
    const verificationToken = generateToken(user._id);

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.name, verificationToken);

    console.log('✅ Verification email resent to:', email);

    res.status(200).json({
      success: true,
      message: 'Verification email sent! Please check your inbox.'
    });

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification email'
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    console.log('🔑 Forgot password request:', req.body.email);

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(404).json({
        success: false,
        message: 'No account found with that email'
      });
    }

    // Generate reset token
    const resetToken = generateToken(user._id);

    // Send reset email (NON-BLOCKING)
    emailService.sendPasswordResetEmail(user.email, user.name, resetToken)
      .then(() => console.log('✅ Password reset email sent'))
      .catch(err => console.log('⚠️ Password reset email failed:', err.message));

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });

  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send reset email'
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    console.log('🔐 Password reset attempt');

    const { token, password } = req.body;

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('❌ User not found for reset token');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = password;
    await user.save();

    console.log('✅ Password reset successful:', user.email);

    // Send password changed email (NON-BLOCKING)
    emailService.sendPasswordChangedEmail(user.email, user.name)
      .then(() => console.log('✅ Password changed email sent'))
      .catch(err => console.log('⚠️ Password changed email failed:', err.message));

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(400).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    console.log('🔄 Token refresh attempt');

    const { token } = req.body;

    // Verify old token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      console.log('❌ Invalid token or inactive user');
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    // Generate new token
    const newToken = generateToken(user._id);

    console.log('✅ Token refreshed for:', user.email);

    res.status(200).json({
      success: true,
      token: newToken
    });

  } catch (error) {
    console.error('❌ Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Token refresh failed'
    });
  }
};