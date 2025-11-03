// utils/sendEmail.js
const fetch = require('node-fetch');

/**
 * Send an email using the Resend API.
 *
 * Required ENV variables:
 * RESEND_API_KEY, EMAIL_FROM
 */
const sendEmail = async (to, subject, html) => {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY not configured.');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Dealcross <noreply@dealcross.com>',
        to,
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Resend API Error:', error);
      throw new Error('Email could not be sent.');
    }

    const data = await response.json();
    console.log(`📧 Email sent to ${to}: ${data.id || 'No ID returned'}`);
    return data;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw new Error('Email could not be sent.');
  }
};

module.exports = sendEmail;