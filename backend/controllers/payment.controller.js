const Escrow = require('../models/Escrow.model');
const User = require('../models/User.model');
const paymentService = require('../services/payment.service');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// Initialize Payment
exports.initializePayment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { escrowId, paymentMethod, cryptocurrency } = req.body;

    // Find escrow
    const escrow = await Escrow.findOne({ escrowId }).populate('buyer', 'email name');
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is the buyer
    if (escrow.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can initialize payment'
      });
    }

    // Check if already paid
    if (escrow.status !== 'pending_payment') {
      return res.status(400).json({
        success: false,
        message: 'Payment already processed or escrow not in pending state'
      });
    }

    // Generate payment reference
    const reference = `ESC_${escrowId}_${Date.now()}`;
    const metadata = {
      escrowId: escrow.escrowId,
      buyerId: escrow.buyer._id.toString(),
      buyerName: escrow.buyer.name,
      itemName: escrow.itemName
    };

    let paymentData;

    switch (paymentMethod) {
      case 'paystack':
        paymentData = await paymentService.initializePaystack(
          escrow.buyer.email,
          escrow.amount,
          reference,
          metadata
        );
        break;

      case 'flutterwave':
        paymentData = await paymentService.initializeFlutterwave(
          escrow.buyer.email,
          escrow.amount,
          escrow.currency,
          reference,
          metadata
        );
        break;

      case 'crypto':
        if (!cryptocurrency || !['BTC', 'ETH', 'USDT'].includes(cryptocurrency)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid cryptocurrency. Choose BTC, ETH, or USDT'
          });
        }
        paymentData = paymentService.generateCryptoPayment(
          cryptocurrency,
          escrow.amount,
          reference
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method. Choose: paystack, flutterwave, or crypto'
        });
    }

    // Save payment reference to escrow
    escrow.paymentReference = reference;
    escrow.paymentMethod = paymentMethod;
    if (paymentMethod === 'crypto') {
      escrow.cryptoCurrency = cryptocurrency;
    }
    await escrow.save();

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      paymentData,
      reference,
      escrowId: escrow.escrowId
    });

  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to initialize payment',
      error: error.message
    });
  }
};

// Verify Payment (Paystack/Flutterwave only)
exports.verifyPayment = async (req, res) => {
  try {
    const { reference, paymentMethod, transactionId } = req.body;

    // Find escrow by payment reference
    const escrow = await Escrow.findOne({ paymentReference: reference })
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Crypto payments require manual admin verification
    if (paymentMethod === 'crypto') {
      return res.status(400).json({
        success: false,
        message: 'Crypto payments require manual verification by admin'
      });
    }

    let verificationResult;

    switch (paymentMethod) {
      case 'paystack':
        verificationResult = await paymentService.verifyPaystack(reference);
        break;

      case 'flutterwave':
        verificationResult = await paymentService.verifyFlutterwave(transactionId);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method for verification'
        });
    }

    if (!verificationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Verify amount matches
    if (Math.abs(verificationResult.amount - escrow.amount) > 0.01) {
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch'
      });
    }

    // Update escrow status to in_escrow (payment confirmed)
    escrow.status = 'in_escrow';
    escrow.chatUnlocked = true;
    escrow.paymentVerifiedAt = new Date();
    await escrow.save();

    // Update buyer statistics
    const buyer = await User.findById(escrow.buyer._id);
    buyer.totalTransactions += 1;
    buyer.totalSpent += escrow.amount;
    await buyer.save();

    // Send confirmation emails
    const emailService = require('../services/email.service');
    await emailService.sendPaymentConfirmedEmail(
      escrow.buyer.email,
      escrow.seller.email,
      {
        escrowId: escrow.escrowId,
        itemName: escrow.itemName,
        amount: escrow.amount,
        currency: escrow.currency
      }
    );

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      escrow: {
        escrowId: escrow.escrowId,
        status: escrow.status,
        chatUnlocked: escrow.chatUnlocked
      }
    });

  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Upload Crypto Payment Proof (Buyer uploads transaction hash/screenshot)
exports.uploadCryptoProof = async (req, res) => {
  try {
    const { escrowId, transactionHash, proofImageUrl } = req.body;

    const escrow = await Escrow.findOne({ escrowId });
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is the buyer
    if (escrow.buyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can upload payment proof'
      });
    }

    // Check if payment method is crypto
    if (escrow.paymentMethod !== 'crypto') {
      return res.status(400).json({
        success: false,
        message: 'This escrow is not using crypto payment'
      });
    }

    // Save proof
    escrow.cryptoPaymentProof = {
      transactionHash,
      proofImageUrl,
      uploadedAt: new Date(),
      status: 'pending_verification'
    };
    await escrow.save();

    // Notify admin (will implement notification service later)
    console.log(`Admin notification: Crypto payment proof uploaded for escrow ${escrowId}`);

    res.status(200).json({
      success: true,
      message: 'Payment proof uploaded. Admin will verify within 1-2 hours.',
      escrow: {
        escrowId: escrow.escrowId,
        cryptoPaymentProof: escrow.cryptoPaymentProof
      }
    });

  } catch (error) {
    console.error('Upload crypto proof error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload payment proof',
      error: error.message
    });
  }
};

// Payment Webhook Handler (Paystack/Flutterwave only)
exports.paymentWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'] || req.headers['verif-hash'];

    // Determine payment provider
    let provider;
    if (req.headers['x-paystack-signature']) {
      provider = 'paystack';
    } else if (req.headers['verif-hash']) {
      provider = 'flutterwave';
    } else {
      return res.status(400).json({ success: false, message: 'Unknown provider' });
    }

    // Verify webhook signature
    const isValid = this.verifyWebhookSignature(req.body, signature, provider);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;

    // Handle Paystack webhook
    if (provider === 'paystack' && event.event === 'charge.success') {
      const reference = event.data.reference;
      const escrow = await Escrow.findOne({ paymentReference: reference });

      if (escrow && escrow.status === 'pending_payment') {
        escrow.status = 'in_escrow';
        escrow.chatUnlocked = true;
        escrow.paymentVerifiedAt = new Date();
        await escrow.save();

        // Update buyer stats
        const buyer = await User.findById(escrow.buyer);
        buyer.totalTransactions += 1;
        buyer.totalSpent += escrow.amount;
        await buyer.save();
      }
    }

    // Handle Flutterwave webhook
    if (provider === 'flutterwave' && event.event === 'charge.completed') {
      const reference = event.data.tx_ref;
      const escrow = await Escrow.findOne({ paymentReference: reference });

      if (escrow && escrow.status === 'pending_payment') {
        escrow.status = 'in_escrow';
        escrow.chatUnlocked = true;
        escrow.paymentVerifiedAt = new Date();
        await escrow.save();

        // Update buyer stats
        const buyer = await User.findById(escrow.buyer);
        buyer.totalTransactions += 1;
        buyer.totalSpent += escrow.amount;
        await buyer.save();
      }
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify Webhook Signature
exports.verifyWebhookSignature = (payload, signature, provider) => {
  try {
    if (provider === 'paystack') {
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
        .update(JSON.stringify(payload))
        .digest('hex');
      return hash === signature;
    }

    if (provider === 'flutterwave') {
      return signature === process.env.FLUTTERWAVE_SECRET_HASH;
    }

    return false;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
};

// Admin: Confirm Crypto Payment Manually
exports.confirmCryptoPayment = async (req, res) => {
  try {
    const { escrowId } = req.body;

    const escrow = await Escrow.findOne({ escrowId })
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if crypto payment
    if (escrow.paymentMethod !== 'crypto') {
      return res.status(400).json({
        success: false,
        message: 'This is not a crypto payment'
      });
    }

    // Update escrow
    escrow.status = 'in_escrow';
    escrow.chatUnlocked = true;
    escrow.paymentVerifiedAt = new Date();
    if (escrow.cryptoPaymentProof) {
      escrow.cryptoPaymentProof.status = 'verified';
    }
    await escrow.save();

    // Update buyer stats
    const buyer = await User.findById(escrow.buyer._id);
    buyer.totalTransactions += 1;
    buyer.totalSpent += escrow.amount;
    await buyer.save();

    // Send confirmation email
    const emailService = require('../services/email.service');
    await emailService.sendPaymentConfirmedEmail(
      escrow.buyer.email,
      escrow.seller.email,
      {
        escrowId: escrow.escrowId,
        itemName: escrow.itemName,
        amount: escrow.amount,
        currency: escrow.cryptoCurrency
      }
    );

    res.status(200).json({
      success: true,
      message: 'Crypto payment confirmed successfully',
      escrow
    });

  } catch (error) {
    console.error('Confirm crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm crypto payment',
      error: error.message
    });
  }
};

// Admin: Reject Crypto Payment
exports.rejectCryptoPayment = async (req, res) => {
  try {
    const { escrowId, reason } = req.body;

    const escrow = await Escrow.findOne({ escrowId }).populate('buyer', 'email name');
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    if (escrow.cryptoPaymentProof) {
      escrow.cryptoPaymentProof.status = 'rejected';
      escrow.cryptoPaymentProof.rejectionReason = reason;
    }
    await escrow.save();

    // Notify buyer
    const emailService = require('../services/email.service');
    await emailService.sendEmail(
      escrow.buyer.email,
      'Crypto Payment Rejected',
      `Your crypto payment proof for escrow ${escrowId} was rejected. Reason: ${reason}. Please upload valid proof.`
    );

    res.status(200).json({
      success: true,
      message: 'Crypto payment rejected'
    });

  } catch (error) {
    console.error('Reject crypto payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject crypto payment',
      error: error.message
    });
  }
};