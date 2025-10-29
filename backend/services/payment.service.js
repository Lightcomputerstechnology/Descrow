const axios = require('axios');

class PaymentService {
  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    this.stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    this.flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
  }

  // Initialize Paystack Payment
  async initializePaystack(email, amount, reference, metadata) {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amount * 100, // Convert to kobo
          reference,
          metadata,
          callback_url: `${process.env.FRONTEND_URL}/payment/verify`
        },
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference
      };
    } catch (error) {
      console.error('Paystack initialization error:', error.response?.data || error.message);
      throw new Error('Failed to initialize Paystack payment');
    }
  }

  // Verify Paystack Payment
  async verifyPaystack(reference) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${this.paystackSecretKey}`
          }
        }
      );

      const data = response.data.data;
      return {
        success: data.status === 'success',
        amount: data.amount / 100, // Convert from kobo
        currency: data.currency,
        reference: data.reference,
        paidAt: data.paid_at,
        channel: data.channel,
        metadata: data.metadata
      };
    } catch (error) {
      console.error('Paystack verification error:', error.response?.data || error.message);
      throw new Error('Failed to verify Paystack payment');
    }
  }

  // Initialize Stripe Payment
  async initializeStripe(amount, currency, email, metadata) {
    try {
      const stripe = require('stripe')(this.stripeSecretKey);

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: currency.toLowerCase(),
        receipt_email: email,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Stripe initialization error:', error.message);
      throw new Error('Failed to initialize Stripe payment');
    }
  }

  // Verify Stripe Payment
  async verifyStripe(paymentIntentId) {
    try {
      const stripe = require('stripe')(this.stripeSecretKey);
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: paymentIntent.status === 'succeeded',
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency.toUpperCase(),
        paymentIntentId: paymentIntent.id,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      console.error('Stripe verification error:', error.message);
      throw new Error('Failed to verify Stripe payment');
    }
  }

  // Initialize Flutterwave Payment
  async initializeFlutterwave(email, amount, currency, reference, metadata) {
    try {
      const response = await axios.post(
        'https://api.flutterwave.com/v3/payments',
        {
          tx_ref: reference,
          amount,
          currency,
          redirect_url: `${process.env.FRONTEND_URL}/payment/verify`,
          customer: {
            email
          },
          customizations: {
            title: 'Dealcross Escrow Payment',
            description: 'Secure escrow payment',
            logo: `${process.env.FRONTEND_URL}/logo.png`
          },
          meta: metadata
        },
        {
          headers: {
            Authorization: `Bearer ${this.flutterwaveSecretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        paymentLink: response.data.data.link,
        reference: reference
      };
    } catch (error) {
      console.error('Flutterwave initialization error:', error.response?.data || error.message);
      throw new Error('Failed to initialize Flutterwave payment');
    }
  }

  // Verify Flutterwave Payment
  async verifyFlutterwave(transactionId) {
    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${this.flutterwaveSecretKey}`
          }
        }
      );

      const data = response.data.data;
      return {
        success: data.status === 'successful',
        amount: data.amount,
        currency: data.currency,
        reference: data.tx_ref,
        transactionId: data.id,
        metadata: data.meta
      };
    } catch (error) {
      console.error('Flutterwave verification error:', error.response?.data || error.message);
      throw new Error('Failed to verify Flutterwave payment');
    }
  }

  // Bank Transfer Instructions
  generateBankTransferInstructions(reference, amount, currency) {
    const bankDetails = {
      USD: {
        bankName: 'Chase Bank',
        accountNumber: '1234567890',
        accountName: 'Dealcross Escrow Ltd',
        swiftCode: 'CHASUS33',
        reference
      },
      NGN: {
        bankName: 'GTBank',
        accountNumber: '0123456789',
        accountName: 'Dealcross Escrow Ltd',
        reference
      },
      GBP: {
        bankName: 'Barclays Bank',
        accountNumber: '12345678',
        sortCode: '20-00-00',
        accountName: 'Dealcross Escrow Ltd',
        reference
      }
    };

    return {
      success: true,
      instructions: bankDetails[currency] || bankDetails.USD,
      amount,
      currency,
      note: `Please include reference: ${reference} in your transfer description`
    };
  }

  // Crypto Payment Address Generation
  generateCryptoAddress(cryptocurrency, reference) {
    // In production, integrate with crypto payment gateway (e.g., Coinbase Commerce, BTCPay)
    const addresses = {
      BTC: process.env.BTC_WALLET_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      ETH: process.env.ETH_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      USDT: process.env.USDT_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
    };

    return {
      success: true,
      address: addresses[cryptocurrency],
      cryptocurrency,
      reference,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${addresses[cryptocurrency]}`,
      note: 'Send exact amount and include reference in transaction memo'
    };
  }
}

module.exports = new PaymentService();
