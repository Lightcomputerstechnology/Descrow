// backend/services/email.service.js
const { Resend } = require('resend');

// Initialize Resend API
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Use verified Resend domain for now
const FROM_EMAIL = 'Dealcross <onboarding@resend.dev>';

// ✅ Your company logo URL (update when needed)
const LOGO_URL = 'https://dealcross.net/logo.png';

// Utility: common email wrapper (branding + layout)
function wrapTemplate(title, bodyContent) {
  return `
    <div style="background:#f4f7fa;padding:30px;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:520px;margin:auto;background:#fff;border-radius:12px;padding:30px;
                  box-shadow:0 4px 10px rgba(0,0,0,0.05)">
        <div style="text-align:center;margin-bottom:20px;">
          <img src="${LOGO_URL}" alt="Dealcross Logo"
               style="width:100px;height:auto;margin-bottom:10px;">
          <h2 style="color:#2563EB;margin:0;">${title}</h2>
        </div>

        <div style="font-size:15px;color:#333;">${bodyContent}</div>

        <hr style="border:none;border-top:1px solid #eee;margin:25px 0;">
        <p style="color:#999;font-size:12px;text-align:center;">
          © ${new Date().getFullYear()} Dealcross. All rights reserved.
        </p>
      </div>
    </div>
  `;
}

class EmailService {
  // Generic send email method
  async sendEmail(to, subject, html) {
    try {
      const response = await resend.emails.send({
        from: FROM_EMAIL,
        to,
        subject,
        html,
      });
      console.log(`📧 Email sent successfully to ${to} - ${subject}`);
      return response;
    } catch (error) {
      console.error('❌ Email send failed:', error);
      throw new Error('Email sending failed');
    }
  }

  // ✅ 1. Verification Email
  async sendVerificationEmail(email, name, verificationToken) {
    const subject = 'Verify Your Email - Dealcross';
    const body = `
      <p>Hello <b>${name}</b>,</p>
      <p>Thank you for joining <b>Dealcross</b>. Please verify your email address to activate your account.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}"
           style="background:#2563EB;color:#fff;padding:12px 28px;
                  text-decoration:none;border-radius:6px;font-weight:bold;">
          Verify Email
        </a>
      </div>
      <p>If you didn’t request this, you can safely ignore this email.</p>
    `;
    const html = wrapTemplate('Email Verification', body);
    await this.sendEmail(email, subject, html);
  }

  // ✅ 2. Welcome Email
  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to Dealcross';
    const body = `
      <p>Hello <b>${name}</b>,</p>
      <p>Your email has been verified successfully! 🎉</p>
      <p>Welcome to <b>Dealcross</b> — where secure business meets technology.</p>
      <div style="text-align:center;margin-top:20px;">
        <a href="${process.env.FRONTEND_URL}/dashboard"
           style="background:#16A34A;color:#fff;padding:12px 28px;text-decoration:none;border-radius:6px;">
          Go to Dashboard
        </a>
      </div>
    `;
    const html = wrapTemplate('Welcome to Dealcross', body);
    await this.sendEmail(email, subject, html);
  }

  // ✅ 3. Password Reset Email
  async sendPasswordResetEmail(email, name, resetToken) {
    const subject = 'Password Reset Request';
    const body = `
      <p>Hello <b>${name}</b>,</p>
      <p>We received a request to reset your password. Click below to continue (valid for 1 hour):</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}"
           style="background:#F59E0B;color:white;padding:12px 28px;text-decoration:none;border-radius:6px;">
          Reset Password
        </a>
      </div>
      <p>If you didn’t request a password reset, please ignore this email.</p>
    `;
    const html = wrapTemplate('Password Reset', body);
    await this.sendEmail(email, subject, html);
  }

  // ✅ 4. Password Changed Notification
  async sendPasswordChangedEmail(email, name) {
    const subject = 'Your Password Was Changed';
    const body = `
      <p>Hello <b>${name}</b>,</p>
      <p>Your password has been successfully changed.</p>
      <p>If this wasn’t you, please contact our support team immediately.</p>
    `;
    const html = wrapTemplate('Password Changed Successfully', body);
    await this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();
