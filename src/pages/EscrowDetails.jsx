import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  MessageSquare,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Upload,
  Send,
  Loader,
  TrendingUp,
  DollarSign,
  User,
  Calendar,
  Truck,
  X,
  Lock
} from 'lucide-react';
import { escrowService } from '../services/escrowService';
import { chatService } from '../services/chatService';
import { deliveryService } from '../services/deliveryService';
import { disputeService } from '../services/disputeService';
import { paymentService } from '../services/paymentService';
import { authService } from '../services/authService';

const EscrowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [escrow, setEscrow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details'); // details, chat, delivery, dispute
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Delivery state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    trackingNumber: '',
    carrier: '',
    estimatedDelivery: '',
    notes: ''
  });
  const [deliveryFiles, setDeliveryFiles] = useState([]);
  const [uploadingDelivery, setUploadingDelivery] = useState(false);

  // Dispute state
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeData, setDisputeData] = useState({
    reason: '',
    description: ''
  });
  const [disputeFiles, setDisputeFiles] = useState([]);
  const [creatingDispute, setCreatingDispute] = useState(false);

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [cryptocurrency, setCryptocurrency] = useState('BTC');
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    fetchEscrowDetails();
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [id]);

  useEffect(() => {
    if (activeTab === 'chat' && escrow?.chatUnlocked) {
      fetchChatMessages();
    }
  }, [activeTab, escrow]);

  const fetchEscrowDetails = async () => {
    try {
      setLoading(true);
      const response = await escrowService.getEscrow(id);
      setEscrow(response.escrow);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load escrow details');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await chatService.getChatMessages(id);
      setMessages(response.chat.messages || []);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await chatService.sendMessage(id, newMessage, []);
      setNewMessage('');
      fetchChatMessages();
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleInitializePayment = async () => {
    try {
      setInitializingPayment(true);
      const response = await paymentService.initializePayment(
        id,
        paymentMethod,
        paymentMethod === 'crypto' ? cryptocurrency : undefined
      );

      setPaymentInfo(response.paymentData);

      // Redirect to payment page
      if (paymentMethod === 'paystack') {
        window.location.href = response.paymentData.authorizationUrl;
      } else if (paymentMethod === 'flutterwave') {
        window.location.href = response.paymentData.paymentLink;
      } else if (paymentMethod === 'crypto') {
        // Show crypto payment instructions
        setShowPaymentModal(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to initialize payment');
    } finally {
      setInitializingPayment(false);
    }
  };

  const handleUploadDeliveryProof = async (e) => {
    e.preventDefault();
    try {
      setUploadingDelivery(true);
      await deliveryService.uploadDeliveryProof(id, deliveryData, deliveryFiles);
      alert('Delivery proof uploaded successfully');
      setShowDeliveryModal(false);
      fetchEscrowDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to upload delivery proof');
    } finally {
      setUploadingDelivery(false);
    }
  };

  const handleCreateDispute = async (e) => {
    e.preventDefault();
    try {
      setCreatingDispute(true);
      await disputeService.createDispute(id, disputeData, disputeFiles);
      alert('Dispute created successfully. Admin will review within 24-48 hours.');
      setShowDisputeModal(false);
      fetchEscrowDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create dispute');
    } finally {
      setCreatingDispute(false);
    }
  };

  const handleReleasePayment = async () => {
    if (!window.confirm('Are you sure you want to release payment to the seller? This action cannot be undone.')) {
      return;
    }

    try {
      await escrowService.releasePayment(id);
      alert('Payment released successfully!');
      fetchEscrowDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to release payment');
    }
  };

  const handleCancelEscrow = async () => {
    if (!window.confirm('Are you sure you want to cancel this escrow?')) {
      return;
    }

    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    try {
      await escrowService.cancelEscrow(id, reason);
      alert('Escrow cancelled successfully');
      fetchEscrowDetails();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel escrow');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending_payment: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
      in_escrow: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
      awaiting_delivery: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
      completed: 'text-green-600 bg-green-50 dark:bg-green-900/20',
      disputed: 'text-red-600 bg-red-50 dark:bg-red-900/20',
      cancelled: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    };
    return colors[status] || colors.in_escrow;
  };

  const getStatusText = (status) => {
    const texts = {
      pending_payment: 'Pending Payment',
      in_escrow: 'In Escrow',
      awaiting_delivery: 'Awaiting Delivery',
      completed: 'Completed',
      disputed: 'Disputed',
      cancelled: 'Cancelled'
    };
    return texts[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading escrow details...</p>
        </div>
      </div>
    );
  }

  if (error || !escrow) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Escrow Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The escrow you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isBuyer = user?.id === escrow.buyer._id;
  const isSeller = user?.id === escrow.seller._id;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            <div className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(escrow.status)}`}>
              {getStatusText(escrow.status)}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Escrow Info Card */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {escrow.itemName}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Escrow ID: <span className="font-mono font-semibold">{escrow.escrowId}</span>
              </p>

              {escrow.itemDescription && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">{escrow.itemDescription}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Buyer</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{escrow.buyer.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{escrow.buyer.email}</p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Seller</p>
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">{escrow.seller.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{escrow.seller.email}</p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-6">
                <p className="text-sm opacity-90 mb-2">Total Amount</p>
                <p className="text-4xl font-bold mb-4">
                  {escrow.currency} ${escrow.amount.toLocaleString()}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-90">Admin Fee:</span>
                    <span className="font-semibold">${escrow.adminFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="opacity-90">Seller Receives:</span>
                    <span className="font-semibold">${escrow.netAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 dark:text-gray-400">Created:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(escrow.createdAt)}
                  </span>
                </div>

                {escrow.deliveryProof?.estimatedDelivery && (
                  <div className="flex items-center gap-3 text-sm">
                    <Truck className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Est. Delivery:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatDate(escrow.deliveryProof.estimatedDelivery)}
                    </span>
                  </div>
                )}

                {escrow.paymentMethod && (
                  <div className="flex items-center gap-3 text-sm">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                    <span className="font-semibold text-gray-900 dark:text-white capitalize">
                      {escrow.paymentMethod}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            {/* Buyer Actions */}
            {isBuyer && escrow.status === 'pending_payment' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
              >
                <DollarSign className="w-5 h-5" />
                Complete Payment
              </button>
            )}

            {isBuyer && escrow.status === 'awaiting_delivery' && (
              <button
                onClick={handleReleasePayment}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Confirm Delivery & Release Payment
              </button>
            )}

            {isBuyer && escrow.status === 'in_escrow' && (
              <button
                onClick={handleCancelEscrow}
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Cancel Escrow
              </button>
            )}

            {/* Seller Actions */}
            {isSeller && escrow.status === 'in_escrow' && (
              <button
                onClick={() => setShowDeliveryModal(true)}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition flex items-center gap-2"
              >
                <Upload className="w-5 h-5" />
                Upload Delivery Proof
              </button>
            )}

            {/* Dispute Button */}
            {(isBuyer || isSeller) && !['completed', 'cancelled', 'disputed'].includes(escrow.status) && (
              <button
                onClick={() => setShowDisputeModal(true)}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition flex items-center gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                Open Dispute
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-800 mb-8">
          <div className="border-b border-gray-200 dark:border-gray-800">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                  activeTab === 'details'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <FileText className="w-5 h-5" />
                Details
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                  activeTab === 'chat'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
                disabled={!escrow.chatUnlocked}
              >
                <MessageSquare className="w-5 h-5" />
                Chat {!escrow.chatUnlocked && '(Locked)'}
              </button>

              <button
                onClick={() => setActiveTab('delivery')}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                  activeTab === 'delivery'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Package className="w-5 h-5" />
                Delivery
              </button>

              {escrow.status === 'disputed' && (
                <button
                  onClick={() => setActiveTab('dispute')}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold transition ${
                    activeTab === 'dispute'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <AlertCircle className="w-5 h-5" />
                  Dispute
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Transaction Timeline
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">Escrow Created</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(escrow.createdAt)}</p>
                      </div>
                    </div>

                    {escrow.paymentVerifiedAt && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">Payment Confirmed</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(escrow.paymentVerifiedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {escrow.deliveryProof && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">Item Shipped</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(escrow.deliveryProof.uploadedAt)}
                          </p>
                        </div>
                      </div>
                    )}

                    {escrow.status === 'awaiting_delivery' && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse">
                          <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">Awaiting Delivery Confirmation</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Pending buyer confirmation</p>
                        </div>
                      </div>
                    )}

                    {escrow.status === 'completed' && (
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">Transaction Completed</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Payment released to seller</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div>
                {escrow.chatUnlocked ? (
                  <div className="space-y-4">
                    {/* Messages */}
                    <div className="h-96 overflow-y-auto space-y-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      {messages.length > 0 ? (
                        messages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${msg.sender._id === user?.id ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                msg.sender._id === user?.id
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
                              }`}
                            >
                              <p className="text-sm font-semibold mb-1">{msg.sender.name}</p>
                              <p>{msg.message}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12">
                          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No messages yet. Start the conversation!</p>
                        </div>
                      )}
                    </div>

                    {/* Message Input */}
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                        disabled={sendingMessage}
                      />
                      <button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {sendingMessage ? (
                          <Loader className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">Chat is locked</p>
                    <p className="text-sm text-gray-500">
                      Chat will unlock once payment is confirmed
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ================= DELIVERY TAB ================= */}
{activeTab === 'delivery' && (
  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
      Delivery Proof
    </h2>

    {escrow?.deliveryProof ? (
      <div>
        {escrow.deliveryProof.images && escrow.deliveryProof.images.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Uploaded Images
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {escrow.deliveryProof.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Proof ${index + 1}`}
                  className="rounded-md border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-200"
                />
              ))}
            </div>
          </div>
        )}

        {escrow.deliveryProof.notes && (
          <div className="mt-4">
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">Notes</p>
            <p className="text-blue-900 dark:text-blue-100">
              {escrow.deliveryProof.notes}
            </p>
          </div>
        )}
      </div>
    ) : (
      <p className="text-gray-500 dark:text-gray-400 italic">
        No delivery proof submitted yet.
      </p>
    )}
  </div>
)}
            {/* Dispute Tab */}
            {activeTab === 'dispute' && (
              <div>
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-2">
                    Dispute Status: {escrow.dispute?.status || 'Open'}
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Our admin team is reviewing this dispute. You will be notified once it's resolved.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Payment</h2>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Amount to Pay:</strong> {escrow.currency} ${escrow.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Select Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                >
                  <option value="paystack">Paystack (Card, Bank Transfer)</option>
                  <option value="flutterwave">Flutterwave (Multi-currency)</option>
                  <option value="crypto">Cryptocurrency</option>
                </select>
              </div>

              {paymentMethod === 'crypto' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Cryptocurrency
                  </label>
                  <select
                    value={cryptocurrency}
                    onChange={(e) => setCryptocurrency(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="BTC">Bitcoin (BTC)</option>
                    <option value="ETH">Ethereum (ETH)</option>
                    <option value="USDT">Tether (USDT)</option>
                  </select>
                </div>
              )}

              {paymentInfo && paymentMethod === 'crypto' && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                    Payment Instructions
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">Wallet Address:</p>
                      <p className="font-mono text-xs bg-white dark:bg-gray-800 p-2 rounded border break-all">
                        {paymentInfo.walletAddress}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-1">QR Code:</p>
                      <img src={paymentInfo.qrCode} alt="QR Code" className="w-48 h-48 mx-auto" />
                    </div>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                      <p className="font-semibold mb-2">Instructions:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {paymentInfo.instructions?.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleInitializePayment}
                disabled={initializingPayment}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {initializingPayment ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Proceed to Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Upload Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Delivery Proof</h2>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUploadDeliveryProof} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tracking Number *
                </label>
                <input
                  type="text"
                  value={deliveryData.trackingNumber}
                  onChange={(e) => setDeliveryData({ ...deliveryData, trackingNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="TRACK123456"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Carrier *
                </label>
                <input
                  type="text"
                  value={deliveryData.carrier}
                  onChange={(e) => setDeliveryData({ ...deliveryData, carrier: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="FedEx, UPS, DHL..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estimated Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryData.estimatedDelivery}
                  onChange={(e) => setDeliveryData({ ...deliveryData, estimatedDelivery: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={deliveryData.notes}
                  onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Any additional information..."
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Proof Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setDeliveryFiles(Array.from(e.target.files))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <p className="text-sm text-gray-500 mt-2">You can upload up to 5 images</p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowDeliveryModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingDelivery}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploadingDelivery ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Proof'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Open Dispute</h2>
              <button
                onClick={() => setShowDisputeModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateDispute} className="p-6 space-y-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Important:</strong> Disputes are reviewed by our admin team within 24-48 hours. 
                  Please provide detailed information and evidence to support your claim.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for Dispute *
                </label>
                <select
                  value={disputeData.reason}
                  onChange={(e) => setDisputeData({ ...disputeData, reason: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="item_not_received">Item Not Received</option>
                  <option value="item_not_as_described">Item Not As Described</option>
                  <option value="damaged_item">Damaged Item</option>
                  <option value="wrong_item">Wrong Item Received</option>
                  <option value="seller_unresponsive">Seller Unresponsive</option>
                  <option value="buyer_unresponsive">Buyer Unresponsive</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={disputeData.description}
                  onChange={(e) => setDisputeData({ ...disputeData, description: e.target.value })}
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                  placeholder="Provide as much detail as possible about the issue..."
                  required
                  minLength={20}
                ></textarea>
                <p className="text-sm text-gray-500 mt-2">Minimum 20 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload Evidence (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) => setDisputeFiles(Array.from(e.target.files))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Upload images or documents to support your dispute (max 5 files)
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingDispute}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {creatingDispute ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Dispute'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EscrowDetails;
