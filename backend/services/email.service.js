// backend/services/email.service.js - PRODUCTION READY WITH RESEND
const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@dealcross.net';
    
    // ✅ FIX: Remove trailing slash from frontend URL
    const baseUrl = process.env.FRONTEND_URL || 'https://dealcross.net';
    this.frontendUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️ RESEND_API_KEY not configured - emails will fail');
    }
  }

  // ═════════════════════════════════════════════════════════════
  // PAYMENT CONFIRMATION EMAILS
  // ═════════════════════════════════════════════════════════════

  async sendPaymentConfirmedEmail(buyerEmail, buyerName, sellerEmail, sellerName, escrowDetails) {
    try {
      const { escrowId, title, amount, currency, buyerPaid } = escrowDetails;

      // Email to Buyer
      await this.resend.emails.send({
        from: this.fromEmail,
        to: buyerEmail,
        subject: `✅ Payment Confirmed - Escrow #${escrowId}`,
        html: this.getBuyerPaymentConfirmationTemplate(buyerName, escrowId, title, amount, currency, buyerPaid)
      });

      // Email to Seller
      await this.resend.emails.send({
        from: this.fromEmail,
        to: sellerEmail,
        subject: `💰 Payment Received - Escrow #${escrowId}`,
        html: this.getSellerPaymentNotificationTemplate(sellerName, escrowId, title, amount, currency)
      });

      console.log(`✅ Payment confirmation emails sent for escrow ${escrowId}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send payment confirmation emails:', error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // DELIVERY CONFIRMATION EMAILS
  // ═════════════════════════════════════════════════════════════

  async sendDeliveryNotificationEmail(buyerEmail, buyerName, sellerName, escrowDetails) {
    try {
      const { escrowId, title, trackingNumber } = escrowDetails;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: buyerEmail,
        subject: `📦 Item Delivered - Escrow #${escrowId}`,
        html: this.getDeliveryNotificationTemplate(buyerName, sellerName, escrowId, title, trackingNumber)
      });

      console.log(`✅ Delivery notification sent for escrow ${escrowId}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send delivery notification:', error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // COMPLETION EMAILS
  // ═════════════════════════════════════════════════════════════

  async sendCompletionEmail(sellerEmail, sellerName, buyerName, escrowDetails) {
    try {
      const { escrowId, title, amount, currency, sellerReceives } = escrowDetails;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: sellerEmail,
        subject: `🎉 Transaction Complete - Escrow #${escrowId}`,
        html: this.getCompletionTemplate(sellerName, buyerName, escrowId, title, sellerReceives, currency)
      });

      console.log(`✅ Completion email sent for escrow ${escrowId}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send completion email:', error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // DISPUTE EMAILS
  // ═════════════════════════════════════════════════════════════

  async sendDisputeNotificationEmail(emails, escrowDetails) {
    try {
      const { escrowId, title, raisedBy } = escrowDetails;

      for (const email of emails) {
        await this.resend.emails.send({
          from: this.fromEmail,
          to: email,
          subject: `⚠️ Dispute Raised - Escrow #${escrowId}`,
          html: this.getDisputeTemplate(escrowId, title, raisedBy)
        });
      }

      console.log(`✅ Dispute notifications sent for escrow ${escrowId}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send dispute notifications:', error);
      throw error;
    }
  }

  // ═════════════════════════════════════════════════════════════
  // EMAIL TEMPLATES
  // ═════════════════════════════════════════════════════════════

  getBuyerPaymentConfirmationTemplate(buyerName, escrowId, title, amount, currency, buyerPaid) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Payment Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi ${buyerName},</p>
      
      <p>Great news! Your payment has been successfully received and is now safely held in escrow.</p>
      
      <div class="details">
        <h3>Transaction Details</h3>
        <p><strong>Escrow ID:</strong> ${escrowId}</p>
        <p><strong>Item:</strong> ${title}</p>
        <p><strong>Amount Paid:</strong> ${currency} ${buyerPaid.toLocaleString()}</p>
        <p><strong>Item Price:</strong> ${currency} ${amount.toLocaleString()}</p>
      </div>
      
      <p><strong>What happens next?</strong></p>
      <ul>
        <li>The seller has been notified to prepare your item</li>
        <li>You can now chat with the seller directly</li>
        <li>Once delivered, confirm receipt to release payment</li>
        <li>Your money is protected until you confirm delivery</li>
      </ul>
      
      <a href="${this.frontendUrl}/escrow/${escrowId}" class="button">View Escrow Details</a>
      
      <p>Need help? Contact our support team anytime.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  getSellerPaymentNotificationTemplate(sellerName, escrowId, title, amount, currency) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Payment Received!</h1>
    </div>
    <div class="content">
      <p>Hi ${sellerName},</p>
      
      <p>Excellent news! The buyer has paid and their funds are now safely held in escrow.</p>
      
      <div class="details">
        <h3>Transaction Details</h3>
        <p><strong>Escrow ID:</strong> ${escrowId}</p>
        <p><strong>Item:</strong> ${title}</p>
        <p><strong>Amount:</strong> ${currency} ${amount.toLocaleString()}</p>
      </div>
      
      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Prepare the item for delivery</li>
        <li>Communicate with the buyer through the escrow chat</li>
        <li>Mark as delivered once you've shipped/delivered</li>
        <li>Receive your payment after buyer confirms delivery</li>
      </ol>
      
      <a href="${this.frontendUrl}/escrow/${escrowId}" class="button">Manage Delivery</a>
      
      <p>The buyer is counting on you! Please deliver promptly.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  getDeliveryNotificationTemplate(buyerName, sellerName, escrowId, title, trackingNumber) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Item Delivered!</h1>
    </div>
    <div class="content">
      <p>Hi ${buyerName},</p>
      
      <p>${sellerName} has marked your item as delivered!</p>
      
      <div class="details">
        <h3>Delivery Details</h3>
        <p><strong>Escrow ID:</strong> ${escrowId}</p>
        <p><strong>Item:</strong> ${title}</p>
        ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
      </div>
      
      <p><strong>Important:</strong> Please confirm once you've received and inspected the item.</p>
      
      <p>⚠️ Your confirmation will release the payment to the seller. Only confirm if:</p>
      <ul>
        <li>You've received the item</li>
        <li>The item matches the description</li>
        <li>You're satisfied with the quality</li>
      </ul>
      
      <a href="${this.frontendUrl}/escrow/${escrowId}" class="button">Confirm Delivery</a>
      
      <p>If there's an issue, please raise a dispute before confirming.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  getCompletionTemplate(sellerName, buyerName, escrowId, title, sellerReceives, currency) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Transaction Complete!</h1>
    </div>
    <div class="content">
      <p>Hi ${sellerName},</p>
      
      <p>Congratulations! ${buyerName} has confirmed delivery and your payment is being processed.</p>
      
      <div class="details">
        <h3>Payout Details</h3>
        <p><strong>Escrow ID:</strong> ${escrowId}</p>
        <p><strong>Item:</strong> ${title}</p>
        <p><strong>You Receive:</strong> ${currency} ${sellerReceives.toLocaleString()}</p>
        <p><strong>Status:</strong> Payment Released</p>
      </div>
      
      <p>Your funds will be transferred to your account within 1-3 business days.</p>
      
      <p>Thank you for using Dealcross! We hope to see you again soon.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  getDisputeTemplate(escrowId, title, raisedBy) {
    return `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 2px solid #fecaca; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Dispute Raised</h1>
    </div>
    <div class="content">
      <p>A dispute has been raised for one of your escrow transactions.</p>
      
      <div class="details">
        <h3>Dispute Details</h3>
        <p><strong>Escrow ID:</strong> ${escrowId}</p>
        <p><strong>Item:</strong> ${title}</p>
        <p><strong>Raised By:</strong> ${raisedBy}</p>
      </div>
      
      <p><strong>What happens now?</strong></p>
      <ul>
        <li>Our support team has been notified</li>
        <li>Funds are frozen until resolution</li>
        <li>Please provide evidence to support your case</li>
        <li>A resolution will be provided within 3-5 business days</li>
      </ul>
      
      <a href="${this.frontendUrl}/escrow/${escrowId}" class="button">View Dispute Details</a>
      
      <p>Please remain professional and provide accurate information.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }

  // ═════════════════════════════════════════════════════════════
  // WELCOME & AUTH EMAILS
  // ═════════════════════════════════════════════════════════════

  async sendWelcomeEmail(email, name, verificationToken) {
    try {
      const verificationUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: '🎉 Welcome to Dealcross - Verify Your Email',
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Dealcross! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      
      <p>Thanks for joining Dealcross - the secure escrow platform that protects both buyers and sellers!</p>
      
      <p>To get started, please verify your email address:</p>
      
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
      
      <p>Or copy this link: ${verificationUrl}</p>
      
      <p><strong>What you can do with Dealcross:</strong></p>
      <ul>
        <li>Buy and sell with complete protection</li>
        <li>Funds held securely until delivery confirmed</li>
        <li>Dispute resolution support</li>
        <li>Multiple payment methods</li>
      </ul>
      
      <p>Need help? Our support team is here for you!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `
      });

      console.log(`✅ Welcome email sent to ${email}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email, name, resetToken) {
    try {
      const resetUrl = `${this.frontendUrl}/reset-password?token=${resetToken}`;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: '🔐 Reset Your Dealcross Password',
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      
      <p>We received a request to reset your Dealcross password.</p>
      
      <a href="${resetUrl}" class="button">Reset Password</a>
      
      <p>Or copy this link: ${resetUrl}</p>
      
      <p>⚠️ This link expires in 1 hour.</p>
      
      <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `
      });

      console.log(`✅ Password reset email sent to ${email}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      throw error;
    }
  }

  async sendVerificationEmail(email, name, verificationToken) {
    try {
      const verificationUrl = `${this.frontendUrl}/verify-email?token=${verificationToken}`;

      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: '✉️ Verify Your Email - Dealcross',
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Dealcross! 🎉</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      
      <p>Thanks for joining Dealcross! Please verify your email address to get started:</p>
      
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
      
      <p>Or copy this link into your browser:</p>
      <p style="word-break: break-all; background: #e5e7eb; padding: 10px; border-radius: 5px;">${verificationUrl}</p>
      
      <p>⏰ This link will expire in 7 days.</p>
      
      <p><strong>What you can do with Dealcross:</strong></p>
      <ul>
        <li>✅ Buy and sell with complete protection</li>
        <li>💰 Funds held securely until delivery confirmed</li>
        <li>⚖️ Dispute resolution support</li>
        <li>💳 Multiple payment methods</li>
      </ul>
      
      <p>If you didn't create this account, please ignore this email.</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
        `
      });

      console.log(`✅ Verification email sent to ${email}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      throw error;
    }
  }

  async sendPasswordChangedEmail(email, name) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: '🔐 Password Changed - Dealcross',
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔐 Password Changed</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      
      <p>Your Dealcross password was successfully changed.</p>
      
      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
      
      <p>⚠️ If you didn't make this change, please contact our support team immediately.</p>
      
      <p>For security, we recommend:</p>
      <ul>
        <li>Using a unique, strong password</li>
        <li>Enabling two-factor authentication</li>
        <li>Never sharing your password</li>
      </ul>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `
      });

      console.log(`✅ Password changed email sent to ${email}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send password changed email:', error);
      throw error;
    }
  }

  async sendTierUpgradeEmail(email, name, tierName) {
    try {
      await this.resend.emails.send({
        from: this.fromEmail,
        to: email,
        subject: `🎉 Welcome to ${tierName} Tier - Dealcross`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
     <h1>🎉 Tier Upgrade Complete!</h1>
    </div>
    <div class="content">
      <p>Hi ${name},</p>
      
      <p>Congratulations! You've successfully upgraded to <strong>${tierName}</strong> tier.</p>
      
      <p><strong>Your new benefits include:</strong></p>
      <ul>
        <li>✅ Lower transaction fees</li>
        <li>💰 Higher transaction limits</li>
        <li>⚡ Priority support</li>
        <li>📊 Advanced analytics</li>
      </ul>
      
      <a href="${this.frontendUrl}/dashboard" class="button">Go to Dashboard</a>
      
      <p>Thank you for choosing Dealcross!</p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Dealcross. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
        `
      });

      console.log(`✅ Tier upgrade email sent to ${email}`);
      return { success: true };

    } catch (error) {
      console.error('❌ Failed to send tier upgrade email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();