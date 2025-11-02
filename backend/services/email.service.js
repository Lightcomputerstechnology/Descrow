const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // Generic send email
  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: `"Dealcross" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      });
      console.log(`✅ Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw error;
    }
  }

  // 🔐 NEW: Email Verification (REGISTRATION)
  async sendVerificationEmail(email, name, verificationToken) {
    const subject = 'Verify Your Email - Dealcross';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">🛡️ Dealcross</h1>
        </div>
        
        <h2 style="color: #1F2937;">Welcome to Dealcross, ${name}!</h2>
        
        <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
          Thank you for registering with Dealcross - your secure escrow platform. 
          To complete your registration and start trading securely, please verify your email address.
        </p>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}" 
             style="background: #3B82F6; color: white; padding: 16px 32px; text-decoration: none; 
                    border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            ✓ Verify Email Address
          </a>
        </div>
        
        <p style="color: #6B7280; font-size: 14px;">
          Or copy and paste this link into your browser:
        </p>
        <p style="background: #F3F4F6; padding: 12px; border-radius: 6px; word-break: break-all; 
                  font-size: 13px; color: #374151;">
          ${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}
        </p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #EF4444; font-size: 14px; font-weight: 600;">
            ⏰ Important: This verification link expires in 24 hours.
          </p>
          
          <p style="color: #9CA3AF; font-size: 13px; margin-top: 20px;">
            If you didn't create an account with Dealcross, please ignore this email.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #9CA3AF; font-size: 12px;">
            © ${new Date().getFullYear()} Dealcross. All rights reserved.
          </p>
        </div>
      </div>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Welcome Email (AFTER EMAIL VERIFICATION)
  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to Dealcross - Let\'s Get Started!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #3B82F6; margin: 0;">🛡️ Dealcross</h1>
        </div>
        
        <h2 style="color: #10B981;">🎉 Welcome to Dealcross, ${name}!</h2>
        
        <p style="color: #4B5563; font-size: 16px; line-height: 1.6;">
          Your email has been verified and your account is now active! You're all set to start trading securely.
        </p>
        
        <div style="background: #F0F9FF; border-left: 4px solid #3B82F6; padding: 20px; margin: 30px 0; border-radius: 4px;">
          <h3 style="color: #1F2937; margin-top: 0;">What You Can Do Now:</h3>
          <ul style="color: #4B5563; line-height: 1.8;">
            <li>✅ Create secure escrow transactions</li>
            <li>💰 Buy and sell with confidence</li>
            <li>📦 Track your deliveries with GPS</li>
            <li>⚖️ Resolve disputes fairly with our team</li>
            <li>💬 Chat with buyers and sellers in real-time</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 40px 0;">
          <a href="${process.env.FRONTEND_URL}/login" 
             style="background: #3B82F6; color: white; padding: 16px 32px; text-decoration: none; 
                    border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
            🚀 Login to Your Dashboard
          </a>
        </div>
        
        <div style="background: #FFFBEB; border-left: 4px solid #F59E0B; padding: 16px; margin: 30px 0; border-radius: 4px;">
          <p style="color: #92400E; margin: 0; font-size: 14px;">
            <strong>💡 Pro Tip:</strong> Complete your KYC verification to unlock higher transaction limits!
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
          <p style="color: #6B7280; font-size: 14px;">
            Need help? Contact our support team anytime.
          </p>
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 20px;">
            © ${new Date().getFullYear()} Dealcross. All rights reserved.
          </p>
        </div>
      </div>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Escrow Created Email
  async sendEscrowCreatedEmail(buyerEmail, sellerEmail, escrowData) {
    // To Buyer
    const buyerSubject = 'Escrow Created Successfully';
    const buyerHtml = `
      <h2>Escrow Created</h2>
      <p>Your escrow transaction has been created successfully.</p>
      <p><strong>Escrow ID:</strong> ${escrowData.escrowId}</p>
      <p><strong>Item:</strong> ${escrowData.itemName}</p>
      <p><strong>Amount:</strong> ${escrowData.currency} ${escrowData.amount}</p>
      <p><strong>Admin Fee:</strong> ${escrowData.currency} ${escrowData.adminFee}</p>
      <p><strong>Seller Receives:</strong> ${escrowData.currency} ${escrowData.netAmount}</p>
      <p>Please complete payment to activate the escrow.</p>
      <p><a href="${process.env.FRONTEND_URL}/escrow/${escrowData.escrowId}">View Escrow</a></p>
    `;
    await this.sendEmail(buyerEmail, buyerSubject, buyerHtml);

    // To Seller
    const sellerSubject = 'New Escrow Transaction';
    const sellerHtml = `
      <h2>New Escrow Transaction</h2>
      <p>A buyer has created an escrow transaction for your item.</p>
      <p><strong>Escrow ID:</strong> ${escrowData.escrowId}</p>
      <p><strong>Item:</strong> ${escrowData.itemName}</p>
      <p><strong>Amount:</strong> ${escrowData.currency} ${escrowData.netAmount}</p>
      <p>Once the buyer completes payment, you can ship the item.</p>
      <p><a href="${process.env.FRONTEND_URL}/escrow/${escrowData.escrowId}">View Escrow</a></p>
    `;
    await this.sendEmail(sellerEmail, sellerSubject, sellerHtml);
  }

  // Payment Confirmed Email
  async sendPaymentConfirmedEmail(buyerEmail, sellerEmail, escrowData) {
    // To Buyer
    const buyerSubject = 'Payment Confirmed';
    const buyerHtml = `
      <h2>Payment Confirmed</h2>
      <p>Your payment for escrow ${escrowData.escrowId} has been confirmed.</p>
      <p><strong>Item:</strong> ${escrowData.itemName}</p>
      <p><strong>Amount Paid:</strong> ${escrowData.currency} ${escrowData.amount}</p>
      <p>The seller will now ship your item. You'll receive tracking details soon.</p>
      <p><a href="${process.env.FRONTEND_URL}/escrow/${escrowData.escrowId}">View Escrow</a></p>
    `;
    await this.sendEmail(buyerEmail, buyerSubject, buyerHtml);

    // To Seller
    const sellerSubject = 'Payment Received - Ship Item';
    const sellerHtml = `
      <h2>Payment Received</h2>
      <p>Payment confirmed for escrow ${escrowData.escrowId}.</p>
      <p><strong>Item:</strong> ${escrowData.itemName}</p>
      <p><strong>You will receive:</strong> ${escrowData.currency} ${escrowData.amount}</p>
      <p>Please ship the item and upload delivery proof with tracking number.</p>
      <p><a href="${process.env.FRONTEND_URL}/escrow/${escrowData.escrowId}">Upload Delivery Proof</a></p>
    `;
    await this.sendEmail(sellerEmail, sellerSubject, sellerHtml);
  }

  // Delivery Proof Email
  async sendDeliveryProofEmail(buyerEmail, deliveryData) {
    const subject = 'Item Shipped - Tracking Available';
    const html = `
      <h2>Your Item Has Been Shipped</h2>
      <p>The seller has shipped your item.</p>
      <p><strong>Escrow ID:</strong> ${deliveryData.escrowId}</p>
      <p><strong>Item:</strong> ${deliveryData.itemName}</p>
      <p><strong>Tracking Number:</strong> ${deliveryData.trackingNumber}</p>
      <p><strong>Carrier:</strong> ${deliveryData.carrier}</p>
      <p><strong>Estimated Delivery:</strong> ${deliveryData.estimatedDelivery || 'Not specified'}</p>
      <p>Once you receive the item, please confirm delivery to release payment to the seller.</p>
      <p><a href="${process.env.FRONTEND_URL}/escrow/${deliveryData.escrowId}">Track Delivery</a></p>
    `;
    await this.sendEmail(buyerEmail, subject, html);
  }

  // Payment Released Email
  async sendPaymentReleasedEmail(sellerEmail, escrowData) {
    const subject = 'Payment Released';
    const html = `
      <h2>Payment Released</h2>
      <p>The buyer has confirmed delivery. Payment has been released!</p>
      <p><strong>Escrow ID:</strong> ${escrowData.escrowId}</p>
      <p><strong>Amount Received:</strong> ${escrowData.currency} ${escrowData.netAmount}</p>
      <p>Thank you for using Dealcross!</p>
      <p><a href="${process.env.FRONTEND_URL}/dashboard">View Dashboard</a></p>
    `;
    await this.sendEmail(sellerEmail, subject, html);
  }

  // Dispute Created Email
  async sendDisputeCreatedEmail(initiatorEmail, otherPartyEmail, disputeData) {
    const subject = 'Dispute Created';
    const htmlInitiator = `
      <h2>Dispute Created</h2>
      <p>Your dispute for escrow ${disputeData.escrowId} has been submitted.</p>
      <p><strong>Reason:</strong> ${disputeData.reason}</p>
      <p>Our admin team will review and resolve within 24-48 hours.</p>
      <p><a href="${process.env.FRONTEND_URL}/disputes/${disputeData.escrowId}">View Dispute</a></p>
    `;
    await this.sendEmail(initiatorEmail, subject, htmlInitiator);

    const htmlOther = `
      <h2>Dispute Opened</h2>
      <p>A dispute has been opened for escrow ${disputeData.escrowId}.</p>
      <p><strong>Reason:</strong> ${disputeData.reason}</p>
      <p>You can respond to the dispute with your evidence.</p>
      <p><a href="${process.env.FRONTEND_URL}/disputes/${disputeData.escrowId}">Respond to Dispute</a></p>
    `;
    await this.sendEmail(otherPartyEmail, 'Dispute Notification', htmlOther);
  }

  // Dispute Resolved Email
  async sendDisputeResolvedEmail(dispute, escrow) {
    const subject = 'Dispute Resolved';
    const html = `
      <h2>Dispute Resolved</h2>
      <p>The dispute for escrow ${escrow.escrowId} has been resolved.</p>
      <p><strong>Resolution:</strong> ${dispute.resolution}</p>
      <p><strong>Winner:</strong> ${dispute.winner}</p>
      <p><a href="${process.env.FRONTEND_URL}/disputes/${escrow.escrowId}">View Details</a></p>
    `;
    
    const buyerEmail = escrow.buyer.email;
    const sellerEmail = escrow.seller.email;
    
    await this.sendEmail(buyerEmail, subject, html);
    await this.sendEmail(sellerEmail, subject, html);
  }

  // Password Reset Email
  async sendPasswordResetEmail(email, name, resetToken) {
    const subject = 'Password Reset Request';
    const html = `
      <h2>Password Reset</h2>
      <p>Hi ${name},</p>
      <p>You requested a password reset for your Dealcross account.</p>
      <p>Click the link below to reset your password (valid for 1 hour):</p>
      <p><a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">Reset Password</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Password Changed Email
  async sendPasswordChangedEmail(email, name) {
    const subject = 'Password Changed Successfully';
    const html = `
      <h2>Password Changed</h2>
      <p>Hi ${name},</p>
      <p>Your password has been changed successfully.</p>
      <p>If you didn't make this change, contact support immediately.</p>
    `;
    await this.sendEmail(email, subject, html);
  }

  // Tier Upgrade Email
  async sendTierUpgradeEmail(email, name, tier) {
    const subject = `Upgraded to ${tier.toUpperCase()} Tier`;
    const html = `
      <h2>Tier Upgrade Successful</h2>
      <p>Hi ${name},</p>
      <p>Your account has been upgraded to <strong>${tier.toUpperCase()}</strong> tier!</p>
      <p>You now have access to:</p>
      <ul>
        ${tier === 'basic' ? '<li>$5,000 max per transaction</li><li>50 transactions per month</li><li>3% transaction fee</li>' : ''}
        ${tier === 'pro' ? '<li>$50,000 max per transaction</li><li>Unlimited transactions</li><li>2% transaction fee</li><li>API access</li>' : ''}
        ${tier === 'enterprise' ? '<li>Unlimited transaction amount</li><li>Unlimited transactions</li><li>1.5% transaction fee</li><li>Dedicated support</li>' : ''}
      </ul>
      <p><a href="${process.env.FRONTEND_URL}/dashboard">View Dashboard</a></p>
    `;
    await this.sendEmail(email, subject, html);
  }
}

module.exports = new EmailService();
