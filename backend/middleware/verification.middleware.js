// backend/middleware/verification.middleware.js - COMPLETE VERIFICATION CHECK

const User = require('../models/User.model');

const verificationMiddleware = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ✅ Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required to create transactions',
        requiredAction: 'verify_email',
        redirectTo: '/verify-email',
        verificationStatus: {
          email: false,
          phone: user.isPhoneVerified || false,
          kyc: user.isKYCVerified || false
        }
      });
    }

    // ✅ Check phone verification (for transactions > $100)
    const transactionAmount = req.body.amount ? parseFloat(req.body.amount) : 0;
    
    if (transactionAmount > 100 && !user.isPhoneVerified) {
      return res.status(403).json({
        success: false,
        message: 'Phone verification required for transactions above $100',
        requiredAction: 'verify_phone',
        redirectTo: '/verify-phone',
        verificationStatus: {
          email: true,
          phone: false,
          kyc: user.isKYCVerified || false
        }
      });
    }

    // ✅ Check KYC verification (for transactions > $1000)
    if (transactionAmount > 1000 && !user.isKYCVerified) {
      return res.status(403).json({
        success: false,
        message: 'KYC verification required for transactions above $1,000',
        requiredAction: 'verify_kyc',
        redirectTo: '/verify-kyc',
        verificationStatus: {
          email: true,
          phone: true,
          kyc: false
        }
      });
    }

    // ✅ All verifications passed
    req.verificationStatus = {
      email: user.isEmailVerified,
      phone: user.isPhoneVerified,
      kyc: user.isKYCVerified
    };

    next();
  } catch (error) {
    console.error('Verification middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Verification check failed'
    });
  }
};

module.exports = verificationMiddleware;
