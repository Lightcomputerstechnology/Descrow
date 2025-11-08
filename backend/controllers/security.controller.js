const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const TwoFactor = require('../models/TwoFactor');
const Session = require('../models/Session');
const crypto = require('crypto');

/**
 * Setup 2FA - Generate secret and QR code
 */
exports.setup2FA = async (req, res) => {
  try {
    // Check if 2FA already enabled
    const existing = await TwoFactor.findOne({ user: req.user.id });
    if (existing && existing.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is already enabled'
      });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Dealcross (${req.user.email})`,
      issuer: 'Dealcross'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = [];
    for (let i = 0; i < 10; i++) {
      backupCodes.push({
        code: crypto.randomBytes(4).toString('hex').toUpperCase(),
        used: false
      });
    }

    // Save to database (but don't enable yet)
    if (existing) {
      existing.secret = secret.base32;
      existing.backupCodes = backupCodes;
      await existing.save();
    } else {
      await TwoFactor.create({
        user: req.user.id,
        secret: secret.base32,
        backupCodes,
        enabled: false
      });
    }

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        manualEntry: secret.base32,
        backupCodes: backupCodes.map(bc => bc.code)
      }
    });

  } catch (error) {
    console.error('Setup 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to setup 2FA'
    });
  }
};

/**
 * Verify and enable 2FA
 */
exports.verify2FA = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Verification code is required'
      });
    }

    const twoFactor = await TwoFactor.findOne({ user: req.user.id });

    if (!twoFactor) {
      return res.status(404).json({
        success: false,
        message: '2FA setup not found. Please setup 2FA first.'
      });
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: twoFactor.secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Enable 2FA
    twoFactor.enabled = true;
    twoFactor.lastVerified = new Date();
    await twoFactor.save();

    res.json({
      success: true,
      message: '2FA enabled successfully'
    });

  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify 2FA'
    });
  }
};

/**
 * Disable 2FA
 */
exports.disable2FA = async (req, res) => {
  try {
    const { code, password } = req.body;

    if (!code || !password) {
      return res.status(400).json({
        success: false,
        message: 'Code and password are required'
      });
    }

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    const twoFactor = await TwoFactor.findOne({ user: req.user.id });

    if (!twoFactor || !twoFactor.enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled'
      });
    }

    // Verify code
    const verified = speakeasy.totp.verify({
      secret: twoFactor.secret,
      encoding: 'base32',
      token: code,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Disable 2FA
    await TwoFactor.findByIdAndDelete(twoFactor._id);

    res.json({
      success: true,
      message: '2FA disabled successfully'
    });

  } catch (error) {
    console.error('Disable 2FA error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to disable 2FA'
    });
  }
};

/**
 * Get 2FA status
 */
exports.get2FAStatus = async (req, res) => {
  try {
    const twoFactor = await TwoFactor.findOne({ user: req.user.id });

    res.json({
      success: true,
      data: {
        enabled: twoFactor ? twoFactor.enabled : false,
        lastVerified: twoFactor?.lastVerified || null
      }
    });

  } catch (error) {
    console.error('Get 2FA status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch 2FA status'
    });
  }
};

/**
 * Get active sessions
 */
exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({
      user: req.user.id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).sort({ lastActivity: -1 });

    res.json({
      success: true,
      data: sessions
    });

  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions'
    });
  }
};

/**
 * Revoke session
 */
exports.revokeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findOne({
      _id: sessionId,
      user: req.user.id
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    session.isActive = false;
    await session.save();

    res.json({
      success: true,
      message: 'Session revoked successfully'
    });

  } catch (error) {
    console.error('Revoke session error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke session'
    });
  }
};

/**
 * Revoke all sessions except current
 */
exports.revokeAllSessions = async (req, res) => {
  try {
    const currentToken = req.header('Authorization')?.replace('Bearer ', '');

    await Session.updateMany(
      {
        user: req.user.id,
        token: { $ne: currentToken },
        isActive: true
      },
      {
        isActive: false
      }
    );

    res.json({
      success: true,
      message: 'All other sessions revoked successfully'
    });

  } catch (error) {
    console.error('Revoke all sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to revoke sessions'
    });
  }
};
