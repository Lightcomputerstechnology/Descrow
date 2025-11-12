// src/pages/PaymentVerificationPage.jsx - NEW FILE
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const PaymentVerificationPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [message, setMessage] = useState('Verifying your payment...');

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    verifyPayment();
  }, []);

  const verifyPayment = async () => {
    try {
      const reference = searchParams.get('reference') || localStorage.getItem('pendingPaymentReference');
      const method = searchParams.get('method');
      const transactionId = searchParams.get('transaction_id');
      const paymentId = searchParams.get('payment_id');

      if (!reference) {
        setStatus('failed');
        setMessage('No payment reference found');
        toast.error('Payment reference missing');
        setTimeout(() => navigate('/dashboard'), 3000);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/payments/verify`,
        {
          reference,
          paymentMethod: method,
          transactionId,
          paymentId
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setStatus('success');
        setMessage('Payment verified successfully!');
        toast.success('Payment confirmed! Escrow is now funded.');
        
        // Clear pending payment data
        localStorage.removeItem('pendingPaymentReference');
        const escrowId = localStorage.getItem('pendingPaymentEscrowId');
        localStorage.removeItem('pendingPaymentEscrowId');
        
        // Redirect to escrow details
        setTimeout(() => {
          if (escrowId) {
            navigate(`/escrow/${escrowId}`);
          } else {
            navigate('/dashboard');
          }
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Verification failed');
      }

    } catch (error) {
      console.error('Verification error:', error);
      setStatus('failed');
      setMessage(error.response?.data?.message || 'Payment verification failed');
      toast.error('Failed to verify payment');
      
      setTimeout(() => navigate('/dashboard'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800">
        <div className="text-center">
          {status === 'verifying' && (
            <>
              <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying Payment
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we confirm your payment...
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Redirecting to your escrow...
              </p>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-600 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {message}
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Go to Dashboard
              </button>
            </>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> Don't close this page until verification is complete.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentVerificationPage;
