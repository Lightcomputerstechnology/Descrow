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
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { escrowId, paymentMethod } = req.body;

    const escrow = await Escrow.findOne({ escrowId }).populate('buyer', 'email name');
    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow not found' });
    }

    if (escrow.buyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only buyer can initialize payment' });
    }

    if (escrow.status !== 'pending_payment') {
      return res.status(400).json({ success: false, message: 'Payment already processed' });
    }

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
        // CORRECTED: Use Nowpayments
        paymentData = await paymentService.initializeNowpayments(
          escrow.amount,
          escrow.currency,
          reference,
          `Payment for ${escrow.itemName}`
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid payment method. Choose: paystack, flutterwave, or crypto'
        });
    }

    escrow.paymentReference = reference;
    escrow.paymentMethod = paymentMethod;
    if (paymentMethod === 'crypto') {
      escrow.nowpaymentsId = paymentData.paymentId;
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
    res.status(500).json({ success: false, message: 'Failed to initialize payment', error: error.message });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const { reference, paymentMethod, transactionId, paymentId } = req.body;

    const escrow = await Escrow.findOne({ paymentReference: reference })
      .populate('buyer', 'name email')
      .populate('seller', 'name email');

    if (!escrow) {
      return res.status(404).json({ success: false, message: 'Escrow not found' });
    }

    let verificationResult;

    switch (paymentMethod) {
      case 'paystack':
        verificationResult = await paymentService.verifyPaystack(reference);
        break;

      case 'flutterwave':
        verificationResult = await paymentService.verifyFlutterwave(transactionId);
        break;

      case 'crypto':
        // CORRECTED: Verify with Nowpayments
        verificationResult = await paymentService.verifyNowpayments(paymentId || escrow.nowpaymentsId);
        break;

      default:
        return res.status(400).json({ success: false, message: 'Invalid payment method' });
    }

    if (!verificationResult.success) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    // Update escrow
    escrow.status = 'in_escrow';
    escrow.chatUnlocked = true;
    escrow.paymentVerifiedAt = new Date();
    await escrow.save();

    // Update buyer stats
    const buyer = await User.findById(escrow.buyer._id);
    buyer.totalTransactions += 1;
    buyer.totalSpent += escrow.amount;
    await buyer.save();

    // Send emails
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
    res.status(500).json({ success: false, message: 'Failed to verify payment', error: error.message });
  }
};

// Nowpayments Webhook (IPN)
exports.nowpaymentsWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-nowpayments-sig'];
    const payload = req.body;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha512', process.env.NOWPAYMENTS_IPN_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    if (payload.payment_status === 'finished') {
      const escrow = await Escrow.findOne({ paymentReference: payload.order_id });

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
    console.error('Nowpayments webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Paystack/Flutterwave Webhooks (existing code remains same)
exports.paymentWebhook = async (req, res) => {
  // ... existing code ...
};

exports.verifyWebhookSignature = (payload, signature, provider) => {
  // ... existing code ...
};