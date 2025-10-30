const axios = require('axios');

class PaymentService {
  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
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
          callback_url: `${process.env.FRONTEND_URL}/payment/verify`,
          channels: ['card', 'bank', 'ussd', 'mobile_money']
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
          payment_options: 'card,banktransfer,ussd,mobilemoney',
          customer: {
            email,
            name: metadata.buyerName || 'Customer'
          },
          customizations: {
            title: 'Dealcross Escrow Payment',
            description: `Payment for ${metadata.itemName}`,
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
        paidAt: data.created_at,
        metadata: data.meta
      };
    } catch (error) {
      console.error('Flutterwave verification error:', error.response?.data || error.message);
      throw new Error('Failed to verify Flutterwave payment');
    }
  }

  // Generate Crypto Payment Instructions (Manual - No API)
  generateCryptoPayment(cryptocurrency, amount, reference) {
    const walletAddresses = {
      BTC: {
        address: process.env.BTC_WALLET_ADDRESS || '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
        network: 'Bitcoin Network',
        confirmations: 3
      },
      ETH: {
        address: process.env.ETH_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        network: 'Ethereum Network (ERC-20)',
        confirmations: 12
      },
      USDT: {
        address: process.env.USDT_WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
        network: 'Ethereum Network (ERC-20)',
        confirmations: 12
      }
    };

    const wallet = walletAddresses[cryptocurrency];
    if (!wallet) {
      throw new Error('Unsupported cryptocurrency');
    }

    return {
      success: true,
      cryptocurrency,
      walletAddress: wallet.address,
      network: wallet.network,
      amount,
      reference,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${wallet.address}`,
      instructions: [
        `1. Send exactly ${amount} ${cryptocurrency} to the address above`,
        `2. Network: ${wallet.network}`,
        `3. Include reference: ${reference} in transaction memo (if possible)`,
        `4. Wait for ${wallet.confirmations} confirmations`,
        `5. Upload transaction hash/screenshot as proof`,
        `6. Payment will be verified by admin within 1-2 hours`
      ],
      warning: 'IMPORTANT: Send only to the correct network. Wrong network = permanent loss of funds.',
      note: 'Manual verification required. Do not close this page until you upload proof.'
    };
  }
}

module.exports = new PaymentService();