const nodemailer = require('nodemailer');

/**
 * Send an email using environment variables for SMTP configuration.
 *
 * Required ENV variables:
 * SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL
 */
const sendEmail = async (to, subject, html) => {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 465,
      secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Send email
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || `"Dealcross" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Email could not be sent.');
  }
};

module.exports = sendEmail;
