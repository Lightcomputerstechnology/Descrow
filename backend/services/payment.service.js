const axios = require('axios');

class PaymentService {
  constructor() {
    this.paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    this.flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    this.nowpaymentsApiKey = process.env.NOWPAYMENTS_API_KEY;
  }

  // Initialize Paystack Payment
  async initializePaystack(email, amount, reference, metadata) {
    try {
      const response = await axios.post(
        'https://api.paystack.co/transaction/initialize',
        {
          email,
          amount: amount * 100,
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
      console.error('Paystack error:', error.response?.data || error.message);
      throw new Error('Failed to initialize Paystack payment');
    }
  }

  async verifyPaystack(reference) {
    try {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${this.paystackSecretKey}` }
        }
      );

      const data = response.data.data;
      return {
        success: data.status === 'success',
        amount: data.amount / 100,
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
          customer: { email, name: metadata.buyerName || 'Customer' },
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
      console.error('Flutterwave error:', error.response?.data || error.message);
      throw new Error('Failed to initialize Flutterwave payment');
    }
  }

  async verifyFlutterwave(transactionId) {
    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: { Authorization: `Bearer ${this.flutterwaveSecretKey}` }
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

  // ============== NOWPAYMENTS CRYPTO (CORRECTED) ==============

  // Initialize Nowpayments Crypto Payment
  async initializeNowpayments(amount, currency, orderId, orderDescription) {
    try {
      const response = await axios.post(
        'https://api.nowpayments.io/v1/payment',
        {
          price_amount: amount,
          price_currency: currency,
          pay_currency: 'btc', // User can change on payment page
          order_id: orderId,
          order_description: orderDescription,
          ipn_callback_url: `${process.env.BACKEND_URL}/api/payments/nowpayments/webhook`,
          success_url: `${process.env.FRONTEND_URL}/payment/success`,
          cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`
        },
        {
          headers: {
            'x-api-key': this.nowpaymentsApiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        paymentId: response.data.payment_id,
        paymentUrl: response.data.invoice_url,
        payAddress: response.data.pay_address,
        payCurrency: response.data.pay_currency,
        payAmount: response.data.pay_amount,
        orderId: response.data.order_id
      };
    } catch (error) {
      console.error('Nowpayments error:', error.response?.data || error.message);
      throw new Error('Failed to initialize Nowpayments');
    }
  }

  // Verify Nowpayments Payment Status
  async verifyNowpayments(paymentId) {
    try {
      const response = await axios.get(
        `https://api.nowpayments.io/v1/payment/${paymentId}`,
        {
          headers: { 'x-api-key': this.nowpaymentsApiKey }
        }
      );

      const data = response.data;
      return {
        success: data.payment_status === 'finished',
        paymentId: data.payment_id,
        paymentStatus: data.payment_status,
        payAddress: data.pay_address,
        payCurrency: data.pay_currency,
        payAmount: data.pay_amount,
        priceAmount: data.price_amount,
        priceCurrency: data.price_currency,
        orderId: data.order_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Nowpayments verification error:', error.response?.data || error.message);
      throw new Error('Failed to verify Nowpayments');
    }
  }
}

module.exports = new PaymentService();