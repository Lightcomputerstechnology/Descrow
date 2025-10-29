const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Send welcome email
exports.sendWelcomeEmail = async (email, name) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Welcome to Dealcross!',
      html: `
        <h1>Welcome to Dealcross, ${name}!</h1>
        <p>Your account has been created successfully.</p>
        <p>You can now buy and sell securely using our escrow platform.</p>
        <p>Get started: <a href="${process.env.FRONTEND_URL}/dashboard">Go to Dashboard</a></p>
        <br>
        <p>Best regards,<br>The Dealcross Team</p>
      `
    });
    console.log('Welcome email sent to:', email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, name, token) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hi ${name},</p>
        <p>You requested to reset your password. Click the link below to reset it:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>The Dealcross Team</p>
      `
    });
    console.log('Password reset email sent to:', email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

// Send escrow created notification
exports.sendEscrowCreatedEmail = async (buyerEmail, sellerEmail, escrowData) => {
  try {
    // Email to buyer
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: buyerEmail,
      subject: 'Escrow Created Successfully',
      html: `
        <h1>Escrow Created</h1>
        <p>Your escrow (${escrowData.escrowId}) has been created successfully.</p>
        <p><strong>Item:</strong> ${escrowData.itemName}</p>
        <p><strong>Amount:</strong> ${escrowData.currency} $${escrowData.amount}</p>
        <p><strong>Admin Fee:</strong> $${escrowData.adminFee} (deducted)</p>
        <p><strong>Net Amount in Escrow:</strong> $${escrowData.netAmount}</p>
        <p><a href="${process.env.FRONTEND_URL}/escrow/${escrowData.escrowId}">View Escrow</a></p>
      `
    });

    // Email to seller
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: sellerEmail,
      subject: 'New Escrow Payment Received',
      html: `
        <h1>New Escrow Payment</h1>
        <p>You have received a new escrow payment (${escrowData.escrowId}).</p>
        <p><strong>Item:</strong> ${escrowData.itemName}</p>
        <p><strong>Amount:</strong> ${escrowData.currency} $${escrowData.netAmount}</p>
        <p>Please ship the item and upload delivery proof.</p>
        <p><a href="${process.env.FRONTEND_URL}/escrow/${escrowData.escrowId}">View Escrow</a></p>
      `
    });

    console.log('Escrow emails sent');
  } catch (error) {
    console.error('Error sending escrow emails:', error);
  }
};

// Send payment released notification
exports.sendPaymentReleasedEmail = async (sellerEmail, escrowData) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: sellerEmail,
      subject: 'Payment Released',
      html: `
        <h1>Payment Released!</h1>
        <p>The payment for escrow ${escrowData.escrowId} has been released to you.</p>
        <p><strong>Amount:</strong> ${escrowData.currency} $${escrowData.netAmount}</p>
        <p>The funds will be transferred to your account within 1-3 business days.</p>
      `
    });
    console.log('Payment released email sent');
  } catch (error) {
    console.error('Error sending payment released email:', error);
  }
};

// Send dispute notification
exports.sendDisputeNotification = async (emails, disputeData) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: emails,
      subject: 'Dispute Opened',
      html: `
        <h1>Dispute Opened</h1>
        <p>A dispute has been opened for escrow ${disputeData.escrowId}.</p>
        <p><strong>Dispute ID:</strong> ${disputeData.disputeId}</p>
        <p><strong>Reason:</strong> ${disputeData.reason}</p>
        <p>Our team will review and resolve this within 24-48 hours.</p>
        <p><a href="${process.env.FRONTEND_URL}/escrow/${disputeData.escrowId}">View Details</a></p>
      `
    });
    console.log('Dispute notification sent');
  } catch (error) {
    console.error('Error sending dispute notification:', error);
  }
};

module.exports = exports;
