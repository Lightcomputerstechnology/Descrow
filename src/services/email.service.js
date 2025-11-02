const nodemailer = require('nodemailer');

// Create email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Email Verification (NEW - REQUIRED FOR SECURITY)
exports.sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Dealcross <noreply@dealcross.com>',
      to: email,
      subject: 'Verify Your Email - Dealcross',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Welcome to Dealcross, ${name}!</h2>
          <p>Thank you for registering. Please verify your email address to activate your account and start trading securely.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #666;">Or copy and paste this link into your browser:</p>
          <p style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all;">
            ${verificationLink}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>Note:</strong> This verification link expires in 24 hours.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            If you didn't create this account, please ignore this email.
          </p>
        </div>
      `
    });
    console.log('✅ Verification email sent to:', email);
  } catch (error) {
    console.error('❌ Verification email send error:', error.message);
    throw error; // Throw error so we know if verification email fails
  }
};

// Send welcome email (after verification)
exports.sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Dealcross <noreply@dealcross.com>',
      to: email,
      subject: 'Welcome to Dealcross!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #3B82F6;">Welcome ${name}!</h1>
          <p>Your email has been verified successfully. Thank you for joining Dealcross - your secure escrow platform.</p>
          
          <h3>What you can do now:</h3>
          <ul>
            <li>✅ Create secure escrow transactions</li>
            <li>✅ Buy and sell with confidence</li>
            <li>✅ Track your deliveries in real-time</li>
            <li>✅ Resolve disputes fairly</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Login to Dashboard
            </a>
          </div>
          
          <p style="color: #666; margin-top: 30px;">
            If you have any questions, feel free to contact our support team.
          </p>
        </div>
      `
    });
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Welcome email send error:', error.message);
    // Don't throw - allow process to continue even if welcome email fails
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, name, resetToken) => {
  try {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Dealcross <noreply@dealcross.com>',
      to: email,
      subject: 'Reset Your Password - Dealcross',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Password Reset Request</h2>
          <p>Hi ${name},</p>
          <p>You requested to reset your password for your Dealcross account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #666;">Or copy and paste this link into your browser:</p>
          <p style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all;">
            ${resetLink}
          </p>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>Note:</strong> This link expires in 1 hour.
          </p>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            If you didn't request this password reset, please ignore this email and your password will remain unchanged.
          </p>
        </div>
      `
    });
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Password reset email send error:', error.message);
  }
};

// Send password changed confirmation email
exports.sendPasswordChangedEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Dealcross <noreply@dealcross.com>',
      to: email,
      subject: 'Password Changed Successfully - Dealcross',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3B82F6;">Password Changed</h2>
          <p>Hi ${name},</p>
          <p>Your password has been changed successfully.</p>
          
          <p style="color: #666; margin-top: 20px;">
            If you didn't make this change, please contact our support team immediately.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/login" 
               style="background: #3B82F6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Login to Dashboard
            </a>
          </div>
        </div>
      `
    });
    console.log('✅ Password changed email sent to:', email);
  } catch (error) {
    console.error('❌ Password changed email send error:', error.message);
  }
};