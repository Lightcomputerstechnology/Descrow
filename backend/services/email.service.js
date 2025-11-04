// services/email.service.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Automatically use Resend domain until your own is verified
const FROM_EMAIL =
  process.env.EMAIL_FROM_VERIFIED ||
  'Dealcross <onboarding@resend.dev>'; // fallback verified domain

class EmailService {
  // Generic send email
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
      if (error.message?.includes('domain is not verified')) {
        console.warn('⚠️ Switching to resend.dev fallback domain...');
        // Retry once with resend.dev domain
        const fallbackResponse = await resend.emails.send({
          from: 'Dealcross <onboarding@resend.dev>',
          to,
          subject,
          html,
        });
        console.log(`✅ Fallback email sent via resend.dev to ${to}`);
        return fallbackResponse;
      }
      throw new Error('Email sending failed');
    }
  }

  // Email Verification
  async sendVerificationEmail(email, name, verificationToken) {
    const subject = 'Verify Your Email - Dealcross';
    const html = `
      <div style="font-family: Arial, sans-serif;">
        <h2>Welcome, ${name}</h2>
        <p>Click the link below to verify your email:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}"
           style="background:#2563EB;color:white;padding:10px 18px;text-decoration:none;border-radius:6px;">
          Verify Email
        </a>
        <p>If you didn’t request this, ignore this email.</p>
      </div>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Welcome Email
  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to Dealcross';
    const html = `<h2>Hello ${name},</h2><p>Your email is verified and your account is active!</p>`;
    await this.sendEmail(email, subject, html);
  }

  // Password Reset
  async sendPasswordResetEmail(email, name, resetToken) {
    const subject = 'Password Reset Request';
    const html = `
      <h2>Hello ${name},</h2>
      <p>Click below to reset your password (valid for 1 hour):</p>
      <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}"
         style="background:#F59E0B;color:white;padding:10px 18px;text-decoration:none;border-radius:6px;">
        Reset Password
      </a>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Password Changed
  async sendPasswordChangedEmail(email, name) {
    const subject = 'Password Changed Successfully';
    const html = `<h2>Hello ${name},</h2><p>Your password has been changed successfully.</p>`;
    await this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();