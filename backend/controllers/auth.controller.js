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
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// -------------------- Helper: Get Clean Frontend URL --------------------
const getFrontendUrl = () => {
  const url = process.env.FRONTEND_URL || 'http://localhost:3000';
  return url.replace(/\/$/, ''); // Remove trailing slash if present
};

// ------------------------- REGISTER -------------------------
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'dual',
      tier: 'free',
      verified: false
    });

    const verificationToken = generateToken(user._id);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
      console.log('✅ Verification email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send verification email:', emailError.message);
      // Don't fail registration if email fails
    }

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

// ------------------------- LOGIN -------------------------
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    if (!user.verified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Please verify your email first', 
        requiresVerification: true, 
        email: user.email 
      });
    }

    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'Account is suspended. Contact support.' 
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

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
    res.status(500).json({ 
      success: false, 
      message: 'Login failed', 
      error: error.message 
    });
  }
};

// ------------------------- VERIFY EMAIL (POST) -------------------------
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Verification token is required' 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(400).json({ 
          success: false, 
          message: 'Verification token expired. Please request a new one.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid verification token' 
      });
    }

    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (user.verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    user.verified = true;
    await user.save();

    // Send welcome email (don't await - non-critical)
    emailService.sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.status(200).json({ 
      success: true, 
      message: 'Email verified successfully! You can now login.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        verified: true
      }
    });

  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Email verification failed' 
    });
  }
};

// ------------------------- VERIFY EMAIL (GET) - For email link clicks -------------------------
exports.verifyEmailRedirect = async (req, res) => {
  try {
    const { token } = req.params;
    const frontendUrl = getFrontendUrl(); // ✅ FIXED: Use helper function
    
    console.log('🔍 Verification redirect called with token:', token);

    if (!token) {
      console.log('❌ No token provided');
      return res.redirect(`${frontendUrl}/verify-email?status=error&reason=no-token`);
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded successfully:', decoded);
    } catch (jwtError) {
      console.error('❌ Token verification failed:', jwtError.message);
      if (jwtError.name === 'TokenExpiredError') {
        return res.redirect(`${frontendUrl}/verify-email?status=error&reason=expired-token`);
      }
      return res.redirect(`${frontendUrl}/verify-email?status=error&reason=invalid-token`);
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      console.log('❌ User not found for ID:', decoded.id);
      return res.redirect(`${frontendUrl}/verify-email?status=error&reason=user-not-found`);
    }

    if (user.verified) {
      console.log('ℹ️ User already verified:', user.email);
      return res.redirect(`${frontendUrl}/verify-email?status=already-verified`);
    }

    user.verified = true;
    await user.save();
    console.log('✅ User verified successfully:', user.email);

    // Send welcome email
    emailService.sendWelcomeEmail(user.email, user.name).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    return res.redirect(`${frontendUrl}/verify-email?status=success`);
    
  } catch (error) {
    console.error('❌ Verify redirect error:', error);
    const frontendUrl = getFrontendUrl();
    return res.redirect(`${frontendUrl}/verify-email?status=error&reason=server-error`);
  }
};

// ------------------------- RESEND VERIFICATION -------------------------
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with that email' 
      });
    }

    if (user.verified) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email already verified' 
      });
    }

    const verificationToken = generateToken(user._id);
    
    try {
      await emailService.sendVerificationEmail(user.email, user.name, verificationToken);
      console.log('✅ Verification email resent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to resend verification email:', emailError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send verification email. Please try again later.' 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: 'Verification email resent successfully' 
    });

  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to resend verification email' 
    });
  }
};

// ------------------------- FORGOT PASSWORD -------------------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'No account found with that email' 
      });
    }

    const resetToken = generateToken(user._id);
    
    try {
      await emailService.sendPasswordResetEmail(user.email, user.name, resetToken);
      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Failed to send password reset email:', emailError.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send reset email. Please try again later.' 
      });
    }

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

// ------------------------- RESET PASSWORD -------------------------
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and password are required' 
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(400).json({ 
          success: false, 
          message: 'Reset token expired. Please request a new one.' 
        });
      }
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset token' 
      });
    }

    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.password = password;
    await user.save();

    // Send password changed email
    emailService.sendPasswordChangedEmail(user.email, user.name).catch(err => {
      console.error('Failed to send password changed email:', err);
    });

    res.status(200).json({ 
      success: true, 
      message: 'Password reset successful' 
    });

  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Password reset failed' 
    });
  }
};

// ------------------------- REFRESH TOKEN -------------------------
exports.refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    const user = await User.findById(decoded.id);
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token' 
      });
    }

    const newToken = generateToken(user._id);
    
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
