const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    // ✅ Safe transporter for Gmail or custom SMTP
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: {
        rejectUnauthorized: false // prevent render SSL issues
      }
    });

    // ✅ Log connection verification
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email transporter verification failed:', error);
      } else {
        console.log('✅ Email server ready to send messages');
      }
    });
  }

  // Generic email sender
  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || `"Dealcross" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      });
      console.log(`📧 Email sent successfully to ${to} - ${subject}`);
    } catch (error) {
      console.error('❌ Email send failed:', error.message);
      throw new Error('Email sending failed');
    }
  }

  // --- All your existing methods remain unchanged below ---
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

  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to Dealcross';
    const html = `<h2>Hello ${name},</h2><p>Your email is verified and account is active!</p>`;
    await this.sendEmail(email, subject, html);
  }

  // (keep all your other functions exactly as they are)
}

module.exports = new EmailService();