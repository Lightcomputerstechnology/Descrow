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

    const { escrowId, paymentMethod } = req.body;

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

      case 'stripe':
        paymentData = await paymentService.initializeStripe(
          escrow.amount,
          escrow.currency,
          escrow.buyer.email,
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

      case 'bank_transfer':
        paymentData = paymentService.generateBankTransferInstructions(
          reference,
          escrow.amount,
          escrow.currency
        );
        break;

      case 'crypto':
        const cryptocurrency = req.body.cryptocurrency || 'BTC';
        paymentData = paymentService.generateCryptoAddress(cryptocurrency, reference);
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method'
        });
    }

    // Save payment reference to escrow
    escrow.paymentReference = reference;
    escrow.paymentMethod = paymentMethod;
    await escrow.save();

    res.status(200).json({
      success: true,
      message: 'Payment initialized successfully',
      paymentData,
      reference
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

// Verify Payment
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

    let verificationResult;

    switch (paymentMethod) {
      case 'paystack':
        verificationResult = await paymentService.verifyPaystack(reference);
        break;

      case 'stripe':
        verificationResult = await paymentService.verifyStripe(transactionId);
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
    if (verificationResult.amount !== escrow.amount) {
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

// Payment Webhook Handler (Paystack/Stripe/Flutterwave)
exports.paymentWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'] || 
                      req.headers['stripe-signature'] || 
                      req.headers['verif-hash'];

    // Determine payment provider
    let provider;
    if (req.headers['x-paystack-signature']) {
      provider = 'paystack';
    } else if (req.headers['stripe-signature']) {
      provider = 'stripe';
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

    // Handle Stripe webhook
    if (provider === 'stripe' && event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const escrowId = paymentIntent.metadata.escrowId;

      const escrow = await Escrow.findOne({ escrowId });
      if (escrow && escrow.status === 'pending_payment') {
        escrow.status = 'in_escrow';
        escrow.chatUnlocked = true;
        escrow.paymentVerifiedAt = new Date();
        await escrow.save();
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

    if (provider === 'stripe') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      try {
        stripe.webhooks.constructEvent(
          payload,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
        return true;
      } catch (err) {
        return false;
      }
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

// Manual Payment Confirmation (Admin only - for bank transfer/crypto)
exports.confirmManualPayment = async (req, res) => {
  try {
    const { escrowId, proofUrl } = req.body;

    const escrow = await Escrow.findOne({ escrowId });
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    escrow.status = 'in_escrow';
    escrow.chatUnlocked = true;
    escrow.paymentVerifiedAt = new Date();
    escrow.paymentProof = proofUrl;
    await escrow.save();

    res.status(200).json({
      success: true,
      message: 'Payment confirmed manually'
    });

  } catch (error) {
    console.error('Manual payment confirmation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};
