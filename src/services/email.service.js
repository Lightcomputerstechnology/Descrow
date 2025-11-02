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

// Send welcome email
exports.sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'Dealcross <noreply@dealcross.com>',
      to: email,
      subject: 'Welcome to Dealcross!',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining Dealcross - your secure escrow platform.</p>
        <p>You can now start buying and selling with confidence.</p>
      `
    });
    console.log('✅ Welcome email sent to:', email);
  } catch (error) {
    console.error('❌ Email send error:', error.message);
    // Don't throw - allow registration to continue even if email fails
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
        <h1>Hi ${name},</h1>
        <p>You requested to reset your password.</p>
        <p>Click the link below to reset it:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
      `
    });
    console.log('✅ Password reset email sent to:', email);
  } catch (error) {
    console.error('❌ Email send error:', error.message);
  }
};