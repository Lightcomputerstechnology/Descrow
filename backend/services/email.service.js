// backend/services/email.service.js
const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = 'Dealcross <onboarding@resend.dev>';

// ---------- COMMON TEMPLATE BUILDER ----------
function generateTemplate(title, content, cta = null) {
  const buttonHTML = cta
    ? `<div style="margin-top:30px;">
         <a href="${cta.url}"
            style="background:#2563EB;color:#fff;padding:12px 28px;
                   text-decoration:none;border-radius:6px;font-weight:bold;">
            ${cta.text}
         </a>
       </div>`
    : '';

  return `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fa;
                padding:40px 20px;text-align:center;">
      <div style="max-width:520px;margin:auto;background:#fff;padding:40px;
                  border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.08);">
        <img src="https://dealcross.net/logo.png"
             alt="Dealcross Logo"
             style="width:100px;margin-bottom:20px;"/>
        <h2 style="color:#2563EB;margin-bottom:15px;">${title}</h2>
        <div style="color:#333;font-size:15px;line-height:1.6;">${content}</div>
        ${buttonHTML}
        <hr style="border:none;border-top:1px solid #eee;margin:25px 0;">
        <p style="color:#999;font-size:12px;">© ${new Date().getFullYear()} Dealcross</p>
      </div>
    </div>
  `;
}

// ---------- EMAIL SERVICE CLASS ----------
class EmailService {
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

  // ✅ Verification Email
  async sendVerificationEmail(email, name, verificationToken) {
    const subject = 'Verify Your Email - Dealcross';
    const content = `
      <p>Hi ${name},</p>
      <p>Welcome to <strong>Dealcross</strong>! Please confirm your email address to activate your account.</p>
      <p>If you didn’t create this account, you can safely ignore this email.</p>
    `;
    const cta = {
      text: 'Verify Email',
      url: `${process.env.BACKEND_URL}/api/verify-email/${verificationToken}`,
    };
    const html = generateTemplate('Verify Your Email', content, cta);
    await this.sendEmail(email, subject, html);
  }

  // ✅ Welcome Email
  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to Dealcross 🎉';
    const content = `
      <p>Hello ${name},</p>
      <p>We’re excited to have you on board! Your email has been successfully verified.</p>
      <p>You can now explore deals, grow your business, and connect securely.</p>
    `;
    const cta = {
      text: 'Go to Dashboard',
      url: `${process.env.FRONTEND_URL}/dashboard`,
    };
    const html = generateTemplate('Welcome to Dealcross', content, cta);
    await this.sendEmail(email, subject, html);
  }

  // ✅ Password Reset Email
  async sendPasswordResetEmail(email, name, resetToken) {
    const subject = 'Password Reset Request';
    const content = `
      <p>Hello ${name},</p>
      <p>We received a request to reset your password. Click below to set a new one.</p>
      <p>This link will expire in 1 hour.</p>
    `;
    const cta = {
      text: 'Reset Password',
      url: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    };
    const html = generateTemplate('Reset Your Password', content, cta);
    await this.sendEmail(email, subject, html);
  }

  // ✅ Password Changed Email
  async sendPasswordChangedEmail(email, name) {
    const subject = 'Password Changed Successfully';
    const content = `
      <p>Hello ${name},</p>
      <p>Your password has been successfully changed.</p>
      <p>If this wasn’t you, please reset your password immediately.</p>
    `;
    const cta = {
      text: 'Secure My Account',
      url: `${process.env.FRONTEND_URL}/reset-password`,
    };
    const html = generateTemplate('Password Changed', content, cta);
    await this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();
