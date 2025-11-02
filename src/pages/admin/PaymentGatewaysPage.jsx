import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Bitcoin,
  CheckCircle,
  XCircle,
  Loader,
  Save,
  AlertCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const PaymentGatewaysPage = ({ admin }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cryptoPayments, setCryptoPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [action, setAction] = useState(''); // 'confirm' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchCryptoPayments();
  }, []);

  const fetchCryptoPayments = async () => {
    try {
      setLoading(true);
      // Fetch pending crypto payments
      const response = await adminService.getTransactions({
        status: 'pending_payment',
        paymentMethod: 'crypto'
      });
      setCryptoPayments(response.escrows || []);
    } catch (error) {
      console.error('Failed to fetch crypto payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setSaving(true);
      await adminService.confirmCryptoPayment(selectedPayment.escrowId);
      alert('Crypto payment confirmed successfully');
      setShowActionModal(false);
      setSelectedPayment(null);
      fetchCryptoPayments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setSaving(false);
    }
  };

  const handleRejectPayment = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setSaving(true);
      await adminService.rejectCryptoPayment(selectedPayment.escrowId, rejectionReason);
      alert('Crypto payment rejected');
      setShowActionModal(false);
      setSelectedPayment(null);
      setRejectionReason('');
      fetchCryptoPayments();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to reject payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Payment Gateway Management</h1>
              <p className="text-sm text-gray-400">Manage payment methods and verify crypto transactions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Payment Methods Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Paystack</p>
                <p className="text-lg font-semibold text-white">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">Card, Bank Transfer, USSD</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Flutterwave</p>
                <p className="text-lg font-semibold text-white">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">Multi-currency Support</span>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Bitcoin className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Nowpayments (Crypto)</p>
                <p className="text-lg font-semibold text-white">Active</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-gray-300">BTC, ETH, USDT</span>
            </div>
          </div>
        </div>

        {/* Pending Crypto Payments */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Pending Crypto Payments</h2>
            <p className="text-sm text-gray-400 mt-1">Review and verify cryptocurrency transactions</p>
          </div>

          <div className="divide-y divide-gray-700">
            {loading ? (
              <div className="p-12 text-center">
                <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto" />
              </div>
            ) : cryptoPayments.length > 0 ? (
              cryptoPayments.map((payment) => (
                <div key={payment._id} className="p-6 hover:bg-gray-700/50 transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-white mb-1">Escrow: {payment.escrowId}</p>
                      <p className="text-sm text-gray-400">{payment.itemName}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Buyer: {payment.buyer?.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">
                        ${payment.amount.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-400">
                        {payment.cryptoCurrency || 'Crypto'}
                      </p>
                    </div>
                  </div>

                  {payment.cryptoPaymentProof && (
                    <div className="bg-gray-900 rounded-lg p-4 mb-4 border border-gray-700">
                      <h3 className="text-sm font-semibold text-white mb-2">Payment Proof</h3>
                      <div className="space-y-2">
                        {payment.cryptoPaymentProof.transactionHash && (
                          <div>
                            <p className="text-xs text-gray-400">Transaction Hash:</p>
                            <p className="font-mono text-xs text-yellow-400 break-all">
                              {payment.cryptoPaymentProof.transactionHash}
                            </p>
                          </div>
                        )}
                        {payment.cryptoPaymentProof.proofImageUrl && (
                          <div>
                            <p className="text-xs text-gray-400 mb-2">Proof Image:</p>
                            <img
                              src={payment.cryptoPaymentProof.proofImageUrl}
                              alt="Payment proof"
                              className="max-w-xs rounded-lg border border-gray-700"
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-500">
                          Uploaded: {new Date(payment.cryptoPaymentProof.uploadedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setAction('confirm');
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-semibold flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm Payment
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPayment(payment);
                        setAction('reject');
                        setShowActionModal(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-semibold flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Payment
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500">
                <Bitcoin className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p>No pending crypto payments</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Gateway Configuration (Placeholder) */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Gateway Configuration</h2>
          <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-200 font-semibold mb-1">Environment Variables</p>
              <p className="text-xs text-yellow-300">
                Payment gateway API keys are configured in environment variables for security. 
                Contact system administrator to update credentials.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Action Modal */}
      {showActionModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">
                {action === 'confirm' ? 'Confirm Payment' : 'Reject Payment'}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <p className="text-sm text-gray-400 mb-2">
                  <strong>Escrow:</strong> {selectedPayment.escrowId}
                </p>
                <p className="text-sm text-gray-400 mb-2">
                  <strong>Amount:</strong> ${selectedPayment.amount.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">
                  <strong>Buyer:</strong> {selectedPayment.buyer?.email}
                </p>
              </div>

              {action === 'confirm' ? (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <p className="text-sm text-green-200">
                    Are you sure you want to confirm this crypto payment? 
                    This will activate the escrow and unlock the chat.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rejection Reason *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    placeholder="Explain why the payment is being rejected..."
                    required
                  ></textarea>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowActionModal(false);
                    setSelectedPayment(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={action === 'confirm' ? handleConfirmPayment : handleRejectPayment}
                  disabled={saving}
                  className={`flex-1 px-6 py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2 ${
                    action === 'confirm'
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {action === 'confirm' ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Confirm
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          Reject
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentGatewaysPage;