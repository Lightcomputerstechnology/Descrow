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
      console.log(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  // Welcome Email
  async sendWelcomeEmail(email, name) {
    const subject = 'Welcome to Dealcross!';
    const html = `
      <h2>Welcome to Dealcross, ${name}!</h2>
      <p>Your account has been created successfully.</p>
      <p>You can now:</p>
      <ul>
        <li>Create secure escrow transactions</li>
        <li>Buy and sell with confidence</li>
        <li>Track your deliveries</li>
        <li>Resolve disputes fairly</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL}/login">Login to your dashboard</a></p>
      <p>Thank you for choosing Dealcross!</p>
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

  // Verification Email
  async sendVerificationEmail(user, verificationType, status, notes) {
    const subject = `${verificationType === 'email' ? 'Email' : 'KYC'} ${status === 'approved' ? 'Approved' : 'Verified'}`;
    const html = `
      <h2>${verificationType === 'email' ? 'Email Verified' : 'KYC Status Update'}</h2>
      <p>Hi ${user.name},</p>
      <p>Your ${verificationType} has been ${status || 'verified'}.</p>
      ${notes ? `<p><strong>Notes:</strong> ${notes}</p>` : ''}
      ${status === 'rejected' ? '<p>Please resubmit your documents or contact support.</p>' : ''}
      <p><a href="${process.env.FRONTEND_URL}/dashboard">View Dashboard</a></p>
    `;
    await this.sendEmail(user.email, subject, html);
  }
}

module.exports = new EmailService();
