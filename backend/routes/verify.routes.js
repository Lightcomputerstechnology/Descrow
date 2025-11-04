// backend/routes/verify.routes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // adjust the path if your model is named differently
const router = express.Router();

/**
 * ✅ GET /api/verify-email/:token
 * Called when a user clicks the email verification link
 */
router.get('/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send(renderTemplate('Email Verification Failed', `
        <p>We couldn’t find your account. Please try registering again.</p>
      `));
    }

    if (user.isVerified) {
      return res.status(200).send(renderTemplate('Already Verified', `
        <p>Your email has already been verified. You can log in now.</p>
      `));
    }

    user.isVerified = true;
    await user.save();

    res.status(200).send(renderTemplate('Email Verified ✅', `
      <p>Your email has been successfully verified! You can now log in.</p>
      <div style="text-align:center;margin-top:20px;">
        <a href="${process.env.FRONTEND_URL}/login"
           style="background:#2563EB;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;">
          Go to Login
        </a>
      </div>
    `));
  } catch (err) {
    console.error('❌ Email verification failed:', err);
    return res.status(400).send(renderTemplate('Invalid or Expired Link', `
      <p>The verification link is invalid or has expired.</p>
      <p>Please request a new verification email.</p>
    `));
  }
});


// ✅ Inline simple HTML template
function renderTemplate(title, body) {
  return `
    <html>
      <head>
        <title>${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      </head>
      <body style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fa;padding:40px;text-align:center;">
        <div style="max-width:500px;margin:auto;background:#fff;padding:30px;border-radius:12px;
                    box-shadow:0 4px 10px rgba(0,0,0,0.1);">
          <img src="https://dealcross.net/logo.png" alt="Dealcross" style="width:90px;margin-bottom:10px;">
          <h2 style="color:#2563EB;">${title}</h2>
          <div style="color:#333;font-size:15px;">${body}</div>
          <hr style="border:none;border-top:1px solid #eee;margin:25px 0;">
          <p style="color:#999;font-size:12px;">© ${new Date().getFullYear()} Dealcross</p>
        </div>
      </body>
    </html>
  `;
}

module.exports = router;
