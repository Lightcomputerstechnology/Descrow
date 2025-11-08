import React, { useState } from 'react';
import { X, CreditCard, Loader, AlertCircle } from 'lucide-react';
import escrowService from '../../services/escrowService';
import toast from 'react-hot-toast';

const PaymentModal = ({ escrow, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  const handlePayment = async () => {
    try {
      setLoading(true);

      // In production, integrate with actual payment gateway
      const response = await escrowService.fundEscrow(escrow._id, {
        paymentMethod,
        transactionId: `TXN_${Date.now()}` // Placeholder
      });

      if (response.success) {
        toast.success('Payment successful! Funds are now in escrow.');
        onSuccess && onSuccess();
      } else {
        toast.error(response.message || 'Payment failed');
      }

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const feeBreakdown = escrow.payment || {};

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Complete Payment
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Summary */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
              Payment Summary
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Transaction Amount:</span>
                <span className="font-medium">${escrow.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Platform Fee:</span>
                <span className="font-medium">${feeBreakdown.buyerFee?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                <div className="flex justify-between font-semibold text-blue-900 dark:text-blue-200 text-lg">
                  <span>Total to Pay:</span>
                  <span>${feeBreakdown.buyerPays?.toFixed(2) || escrow.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Select Payment Method
            </label>
            <div className="space-y-2">
              {['stripe', 'paypal', 'flutterwave'].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-2 rounded-lg transition ${
                    paymentMethod === method
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    paymentMethod === method
                      ? 'border-blue-600 bg-blue-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {paymentMethod === method && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {method}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium mb-1">Secure Payment</p>
                <p className="text-gray-600 dark:text-gray-400">
                  Your funds will be held securely in escrow until you confirm receipt of the item.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  Pay Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
