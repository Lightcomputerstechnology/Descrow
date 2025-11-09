import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone,
  Package,
  DollarSign,
  Calendar,
  Loader,
  ExternalLink,
  Copy,
  CheckCircle,
  CreditCard
} from 'lucide-react';
import StatusStepper from '../components/Escrow/StatusStepper';
import ActionButtons from '../components/Escrow/ActionButtons';
import PaymentModal from '../components/Escrow/PaymentModal';
import DeliveryModal from '../components/Escrow/DeliveryModal';
import DisputeModal from '../components/Escrow/DisputeModal';
import ChatBox from '../components/Escrow/ChatBox';
import escrowService from '../services/escrowService';
import { authService } from '../services/authService';
import { getStatusInfo, formatCurrency, formatDate } from '../utils/escrowHelpers';
import toast from 'react-hot-toast';

const EscrowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [escrow, setEscrow] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    fetchEscrowDetails();
  }, [id]);

  const fetchEscrowDetails = async () => {
    try {
      setLoading(true);

      const response = await escrowService.getEscrowById(id);

      if (response.success) {
        setEscrow(response.data.escrow);
        setUserRole(response.data.userRole);
      } else {
        toast.error('Escrow not found');
        navigate('/dashboard');
      }

    } catch (error) {
      console.error('Failed to fetch escrow:', error);
      toast.error('Failed to load escrow details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    switch (action) {
      case 'accept':
        await handleAccept();
        break;
      case 'fund':
        // Navigate to payment page - handled by banner now
        navigate(`/payment/${escrow._id}`);
        break;
      case 'deliver':
        setShowDeliveryModal(true);
        break;
      case 'confirm':
        await handleConfirm();
        break;
      case 'dispute':
        setShowDisputeModal(true);
        break;
      case 'cancel':
        await handleCancel();
        break;
      case 'reject':
        await handleReject();
        break;
      default:
        break;
    }
  };

  const handleAccept = async () => {
    try {
      const response = await escrowService.acceptEscrow(id);
      if (response.success) {
        toast.success('Deal accepted successfully!');
        fetchEscrowDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept deal');
    }
  };

  const handleConfirm = async () => {
    try {
      const response = await escrowService.confirmDelivery(id);
      if (response.success) {
        toast.success('Delivery confirmed! Payment is being released.');
        fetchEscrowDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to confirm delivery');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this escrow?')) {
      return;
    }

    try {
      const response = await escrowService.cancelEscrow(id, 'User requested cancellation');
      if (response.success) {
        toast.success('Escrow cancelled');
        fetchEscrowDetails();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel escrow');
    }
  };

  const handleReject = async () => {
    if (!window.confirm('Are you sure you want to decline this deal?')) {
      return;
    }

    try {
      const response = await escrowService.cancelEscrow(id, 'Seller declined the deal');
      if (response.success) {
        toast.success('Deal declined');
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to decline deal');
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(escrow._id);
    setCopied(true);
    toast.success('Escrow ID copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModalSuccess = () => {
    setShowPaymentModal(false);
    setShowDeliveryModal(false);
    setShowDisputeModal(false);
    fetchEscrowDetails();
  };

  // Check if buyer needs to pay
  const showPayNowButton = () => {
    if (!escrow || !currentUser || !userRole) return false;
    
    // Show "Pay Now" if buyer and status is pending or accepted (before funded)
    return (
      userRole === 'buyer' && 
      (escrow.status === 'pending' || escrow.status === 'accepted') &&
      !escrow.payment?.paidAt
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!escrow || !currentUser) {
    return null;
  }

  const statusInfo = getStatusInfo(escrow.status);
  const otherParty = userRole === 'buyer' ? escrow.seller : escrow.buyer;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {escrow.title}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  <span>ID: {escrow.escrowId || escrow._id.slice(-8)}</span>
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}>
                  <span>{statusInfo.icon}</span>
                  {statusInfo.text}
                </span>
                {userRole && (
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                    You are the {userRole}
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(escrow.amount, escrow.currency)}
              </p>
              {escrow.payment && userRole === 'seller' && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You receive: {formatCurrency(escrow.payment.sellerReceives, escrow.currency)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pay Now Banner - Show prominently for buyers who need to pay */}
            {showPayNowButton() && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Complete Your Payment
                    </h3>
                    <p className="text-blue-100 text-sm mb-4">
                      Secure your transaction by funding this escrow now
                    </p>
                    <button
                      onClick={() => navigate(`/payment/${escrow._id}`)}
                      className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 shadow-md"
                    >
                      <CreditCard className="w-5 h-5" />
                      Pay Now - {formatCurrency(escrow.amount, escrow.currency)}
                    </button>
                  </div>
                  <CreditCard className="w-16 h-16 text-white opacity-20 hidden md:block" />
                </div>
              </div>
            )}

            {/* Status Stepper */}
            <StatusStepper currentStatus={escrow.status} timeline={escrow.timeline} />

            {/* Description */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {escrow.description}
              </p>
            </div>

            {/* Delivery Info (if delivered) */}
            {escrow.delivery?.deliveredAt && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Delivery Information
                </h3>
                {escrow.delivery.trackingNumber && (
                  <div className="mb-3">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Tracking Number</label>
                    <p className="text-gray-900 dark:text-white font-medium">{escrow.delivery.trackingNumber}</p>
                  </div>
                )}
                {escrow.delivery.notes && (
                  <div className="mb-3">
                    <label className="text-sm text-gray-600 dark:text-gray-400">Notes</label>
                    <p className="text-gray-700 dark:text-gray-300">{escrow.delivery.notes}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Delivered At</label>
                  <p className="text-gray-900 dark:text-white">{formatDate(escrow.delivery.deliveredAt)}</p>
                </div>
              </div>
            )}

            {/* Chat */}
            <ChatBox escrowId={escrow._id} currentUser={currentUser} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Action Buttons - Hide "Fund Escrow" button since we have the banner now */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h3>
              <ActionButtons
                escrow={escrow}
                userRole={userRole}
                onAction={handleAction}
                hideFundButton={showPayNowButton()} // Pass prop to hide fund button when banner is shown
              />
            </div>

            {/* Other Party Info */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {userRole === 'buyer' ? 'Seller' : 'Buyer'} Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{otherParty.name}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-900 dark:text-white">{otherParty.email}</p>
                  </div>
                </div>

                {otherParty.phone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white">{otherParty.phone}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Transaction Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Category</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {escrow.category.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Method</span>
                  <span className="font-medium text-gray-900 dark:text-white capitalize">
                    {escrow.delivery?.method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatDate(escrow.createdAt)}
                  </span>
                </div>
                {escrow.payment && (
                  <>
                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Amount</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(escrow.payment.amount)}
                        </span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600 dark:text-gray-400">Platform Fee</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(escrow.payment.platformFee)}
                        </span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {userRole === 'buyer' ? 'You Paid' : 'You Receive'}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(
                            userRole === 'buyer' 
                              ? escrow.payment.buyerPays 
                              : escrow.payment.sellerReceives
                          )}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Dispute Info (if disputed) */}
            {escrow.dispute?.isDisputed && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-3">
                  Dispute Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-red-700 dark:text-red-300">Status:</span>
                    <span className="ml-2 font-medium text-red-900 dark:text-red-200 capitalize">
                      {escrow.dispute.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <span className="text-red-700 dark:text-red-300">Raised:</span>
                    <span className="ml-2 font-medium text-red-900 dark:text-red-200">
                      {formatDate(escrow.dispute.raisedAt)}
                    </span>
                  </div>
                  {escrow.dispute.reason && (
                    <div className="pt-2 border-t border-red-200 dark:border-red-700">
                      <span className="text-red-700 dark:text-red-300 block mb-1">Reason:</span>
                      <p className="text-red-900 dark:text-red-200">
                        {escrow.dispute.reason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPaymentModal && (
        <PaymentModal
          escrow={escrow}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showDeliveryModal && (
        <DeliveryModal
          escrow={escrow}
          onClose={() => setShowDeliveryModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}

      {showDisputeModal && (
        <DisputeModal
          escrow={escrow}
          onClose={() => setShowDisputeModal(false)}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default EscrowDetails;