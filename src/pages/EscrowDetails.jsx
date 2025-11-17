// src/pages/EscrowDetailsPage.jsx - COMPLETE PRODUCTION VERSION
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
  CreditCard,
  Clock,
  AlertTriangle,
  ShieldCheck,
  MessageCircle,
  FileText,
  TrendingUp,
  Ban,
  RefreshCw,
  Download,
  Star,
  Award,
  Truck,
  XCircle,
  Info,
  Eye,
  Send,
  MoreVertical,
  Flag,
  MapPin
} from 'lucide-react';
import StatusStepper from '../components/Escrow/StatusStepper';
import ActionButtons from '../components/Escrow/ActionButtons';
import DeliveryModal from '../components/Escrow/DeliveryModal';
import DisputeModal from '../components/Escrow/DisputeModal';
import ChatBox from '../components/Escrow/ChatBox';
import escrowService from '../services/escrowService';
import { authService } from '../services/authService';
import { getStatusInfo, formatCurrency, formatDate } from '../utils/escrowHelpers';
import toast from 'react-hot-toast';

const EscrowDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State Management
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [escrow, setEscrow] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [error, setError] = useState(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login');
      return;
    }
    setCurrentUser(user);
    fetchEscrowDetails();
  }, [id, navigate]);

  const fetchEscrowDetails = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const response = await escrowService.getEscrowById(id);

      if (response.success) {
        setEscrow(response.data.escrow);
        setUserRole(response.data.userRole);
      } else {
        throw new Error(response.message || 'Escrow not found');
      }
    } catch (error) {
      console.error('Failed to fetch escrow:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load escrow details';
      setError(errorMessage);
      toast.error(errorMessage);
      
      if (!escrow) {
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchEscrowDetails(true);
    toast.success('Refreshed successfully');
  };

  const handleAction = async (action) => {
    try {
      switch (action) {
        case 'accept':
          await handleAccept();
          break;
        case 'fund':
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
          toast.error('Unknown action');
      }
    } catch (error) {
      console.error('Action error:', error);
      toast.error(error.message || 'Action failed');
    }
  };

  const handleAccept = async () => {
    if (!window.confirm('Are you sure you want to accept this deal? The buyer will be notified to make payment.')) {
      return;
    }

    try {
      const response = await escrowService.acceptEscrow(id);
      if (response.success) {
        toast.success('✅ Deal accepted! Buyer can now make payment.');
        await fetchEscrowDetails(true);
      } else {
        throw new Error(response.message || 'Failed to accept deal');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to accept deal');
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('⚠️ IMPORTANT: Are you sure you want to confirm delivery?\n\nThis will:\n• Release payment to the seller\n• Complete the transaction\n• Cannot be undone\n\nOnly confirm if you have received and inspected the item.')) {
      return;
    }

    try {
      const response = await escrowService.confirmDelivery(id);
      if (response.success) {
        toast.success('✅ Delivery confirmed! Payment is being released to seller.');
        await fetchEscrowDetails(true);
      } else {
        throw new Error(response.message || 'Failed to confirm delivery');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to confirm delivery');
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt('Please provide a reason for cancellation (required):');
    if (!reason || reason.trim().length < 10) {
      toast.error('Cancellation reason must be at least 10 characters');
      return;
    }

    if (!window.confirm(`Are you sure you want to cancel this escrow?\n\nReason: ${reason}\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const response = await escrowService.cancelEscrow(id, reason);
      if (response.success) {
        toast.success('Escrow cancelled successfully');
        await fetchEscrowDetails(true);
      } else {
        throw new Error(response.message || 'Failed to cancel escrow');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel escrow');
    }
  };

  const handleReject = async () => {
    const reason = window.prompt('Please provide a reason for declining this deal (required):');
    if (!reason || reason.trim().length < 10) {
      toast.error('Decline reason must be at least 10 characters');
      return;
    }

    if (!window.confirm(`Are you sure you want to decline this deal?\n\nReason: ${reason}\n\nThe buyer will be notified.`)) {
      return;
    }

    try {
      const response = await escrowService.cancelEscrow(id, `Seller declined: ${reason}`);
      if (response.success) {
        toast.success('Deal declined');
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        throw new Error(response.message || 'Failed to decline deal');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to decline deal');
    }
  };

  const handleCopyId = () => {
    const textToCopy = escrow.escrowId || escrow._id;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      toast.success('Escrow ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy to clipboard');
    });
  };

  const handleModalSuccess = () => {
    setShowDeliveryModal(false);
    setShowDisputeModal(false);
    fetchEscrowDetails(true);
  };

  const shouldShowPaymentBanner = () => {
    if (!escrow || !currentUser || !userRole) return false;

    return (
      userRole === 'buyer' && 
      ['pending', 'accepted'].includes(escrow.status) &&
      !escrow.payment?.paidAt
    );
  };

  const getFinancialBreakdown = () => {
    if (!escrow) return null;

    const amount = parseFloat(escrow.amount?.toString() || 0);
    const buyerFee = parseFloat(escrow.payment?.buyerFee?.toString() || (amount * 0.02));
    const sellerFee = parseFloat(escrow.payment?.sellerFee?.toString() || (amount * 0.01));
    const platformFee = parseFloat(escrow.payment?.platformFee?.toString() || (buyerFee + sellerFee));
    const buyerPays = parseFloat(escrow.payment?.buyerPays?.toString() || (amount + buyerFee));
    const sellerReceives = parseFloat(escrow.payment?.sellerReceives?.toString() || (amount - sellerFee));

    return {
      amount,
      buyerFee,
      sellerFee,
      platformFee,
      buyerPays,
      sellerReceives
    };
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading escrow details…</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error && !escrow) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-800 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Escrow Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!escrow || !currentUser) {
    return null;
  }

  const statusInfo = getStatusInfo(escrow.status);
  const otherParty = userRole === 'buyer' ? escrow.seller : escrow.buyer;
  const financial = getFinancialBreakdown();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-12">
      {/* Enhanced Header with Gradient */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
              title="Refresh escrow details"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300">
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
          </div>

          {/* Title and Main Info */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left: Title and Status */}
            <div className="lg:col-span-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {escrow.title}
              </h1>
              
              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition text-sm font-mono"
                  title="Click to copy"
                >
                  <span className="text-gray-700 dark:text-gray-300">
                    #{escrow.escrowId || escrow._id.slice(-8).toUpperCase()}
                  </span>
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
                
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold ${statusInfo.color}`}>
                  <span className="text-base">{statusInfo.icon}</span>
                  <span>{statusInfo.text}</span>
                </span>
                
                {userRole && (
                  <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold border border-blue-200 dark:border-blue-800">
                    You: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </span>
                )}

                <span className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium border border-purple-200 dark:border-purple-800 capitalize">
                  {escrow.category?.replace('_', ' ') || 'General'}
                </span>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-4 mt-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>Created {formatDate(escrow.createdAt)}</span>
                </div>
                {escrow.payment?.paidAt && (
                  <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-4 h-4" />
                    <span>Paid {formatDate(escrow.payment.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Amount Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border-2 border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Transaction Amount</p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {formatCurrency(financial.amount, escrow.currency)}
              </p>
              
              {userRole === 'buyer' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Buyer fee (2%)</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      +{formatCurrency(financial.buyerFee, escrow.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                    <span className="font-semibold text-blue-700 dark:text-blue-300">You pay</span>
                    <span className="font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(financial.buyerPays, escrow.currency)}
                    </span>
                  </div>
                </div>
              )}

              {userRole === 'seller' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Platform fee (1%)</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      -{formatCurrency(financial.sellerFee, escrow.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-green-200 dark:border-green-800">
                    <span className="font-semibold text-green-700 dark:text-green-300">You receive</span>
                    <span className="font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(financial.sellerReceives, escrow.currency)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ultra-Prominent Payment Banner */}
        {shouldShowPaymentBanner() && (
          <div className="mb-8 relative overflow-hidden rounded-2xl shadow-2xl">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 animate-gradient-x"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djZoNnYtNmgtNnptLTEyIDB2Nmg2di02aC02em0yNCAwdjZoNnYtNmgtNnptLTM2IDB2Nmg2di02SDZ6bTEyLTEydjZoNnYtNmgtNnptMTIgMHY2aDZ2LTZoLTZ6bTEyIDB2Nmg2di02aC02em0tMzYgMHY2aDZ2LTZINnptMTItMTJ2Nmg2di02aC02em0xMiAwdjZoNnYtNmgtNnptMTIgMHY2aDZ2LTZoLTZ6bS0zNiAwdjZoNnYtNkg2eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
            
            <div className="relative p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Left Content */}
                <div className="flex-1 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-4 bg-white/20 rounded-2xl backdrop-blur-sm">
                      <CreditCard className="w-10 h-10" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">Payment Required</h2>
                      <p className="text-blue-100">Secure this transaction now</p>
                    </div>
                  </div>
                  
                  <p className="text-blue-50 mb-6 text-lg leading-relaxed">
                    Complete your payment to activate escrow protection. Your funds will be held securely until you confirm delivery.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                      <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">100% Protected</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                      <Clock className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">Instant Confirm</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
                      <TrendingUp className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-medium">3 Methods</span>
                    </div>
                  </div>
                </div>

                {/* Right CTA */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => navigate(`/payment/${escrow._id}`)}
                    className="group relative px-10 py-5 bg-white text-blue-600 hover:bg-blue-50 rounded-2xl font-bold text-xl transition shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 hover:-translate-y-1"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-7 h-7" />
                        <span>Pay Now</span>
                      </div>
                      <div className="text-lg font-semibold text-gray-700">
                        {formatCurrency(financial.buyerPays, escrow.currency)}
                      </div>
                    </div>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-10 transition"></div>
                  </button>
                  <p className="text-center text-white/80 text-xs mt-3">
                    Multiple payment methods available
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="mb-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-1 shadow-sm">
          <div className="flex gap-1">
            {[
              { id: 'details', label: 'Details', icon: FileText },
              { id: 'timeline', label: 'Timeline', icon: Clock },
              { id: 'chat', label: 'Chat', icon: MessageCircle, badge: escrow.chatUnlocked }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 font-medium text-sm rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.badge && !escrow.chatUnlocked && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                      Locked
                    </span>
                  )}
                  {tab.badge && escrow.chatUnlocked && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <>
                {/* Status Progress */}
                <StatusStepper 
                  currentStatus={escrow.status} 
                  timeline={escrow.timeline}
                />

                {/* Description Card */}
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Transaction Description
                    </h3>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {escrow.description || 'No description provided'}
                    </p>
                  </div>
                </div>

                {/* NEW: Enhanced Delivery Information Section */}
                {escrow.delivery?.proof && (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Delivery Information
                    </h3>

                    <div className="space-y-4">
                      {/* Delivery Method */}
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Method</label>
                        <p className="font-semibold text-gray-900 dark:text-white capitalize">
                          {escrow.delivery.proof.method}
                        </p>
                      </div>

                      {/* Courier Info */}
                      {escrow.delivery.proof.method === 'courier' && (
                        <>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Courier</label>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {escrow.delivery.proof.courierName}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Tracking Number</label>
                            <p className="font-mono font-semibold text-blue-600">
                              {escrow.delivery.proof.trackingNumber}
                            </p>
                          </div>
                        </>
                      )}

                      {/* Personal Delivery Info */}
                      {escrow.delivery.proof.method === 'personal' && (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm text-gray-600 dark:text-gray-400">Vehicle</label>
                              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                                {escrow.delivery.proof.vehicleType}
                              </p>
                            </div>
                            <div>
                              <label className="text-sm text-gray-600 dark:text-gray-400">Plate Number</label>
                              <p className="font-mono font-semibold text-gray-900 dark:text-white">
                                {escrow.delivery.proof.plateNumber}
                              </p>
                            </div>
                          </div>
                          <div>
                            <label className="text-sm text-gray-600 dark:text-gray-400">Driver</label>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {escrow.delivery.proof.driverName}
                            </p>
                          </div>

                          {/* GPS Tracking */}
                          {escrow.delivery.proof.gpsEnabled && escrow.delivery.proof.gpsTrackingId && (
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                <p className="font-semibold text-blue-900 dark:text-blue-100">
                                  Live GPS Tracking Available
                                </p>
                              </div>
                              <a
                                href={`/track/${escrow.delivery.proof.gpsTrackingId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:text-blue-700 underline"
                              >
                                Track delivery in real-time →
                              </a>
                            </div>
                          )}
                        </>
                      )}

                      {/* Expected Delivery */}
                      <div>
                        <label className="text-sm text-gray-600 dark:text-gray-400">Expected Delivery</label>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(escrow.delivery.proof.estimatedDelivery).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Package Photos */}
                      {escrow.delivery.proof.packagePhotos?.length > 0 && (
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400 block mb-2">
                            Package Photos
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {escrow.delivery.proof.packagePhotos.map((photo, index) => (
                              <img
                                key={index}
                                src={photo}
                                alt={`Package ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {escrow.delivery.proof.additionalNotes && (
                        <div>
                          <label className="text-sm text-gray-600 dark:text-gray-400">Notes</label>
                          <p className="text-gray-900 dark:text-white">
                            {escrow.delivery.proof.additionalNotes}
                          </p>
                        </div>
                      )}

                      {/* Auto-release Warning */}
                      {escrow.delivery.autoReleaseAt && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <p className="text-sm text-yellow-800 dark:text-yellow-200">
                            ⏰ <strong>Auto-release:</strong> Payment will be automatically released to seller on{' '}
                            {new Date(escrow.delivery.autoReleaseAt).toLocaleDateString()} if no action is taken.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Legacy Delivery Information (if exists without proof) */}
                {escrow.delivery?.deliveredAt && !escrow.delivery?.proof && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                        <Truck className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        Delivery Information
                      </h3>
                    </div>
                    
                    <div className="space-y-4">
                      {escrow.delivery.trackingNumber && (
                        <div>
                          <label className="text-sm font-medium text-green-700 dark:text-green-400 mb-1 block">
                            Tracking Number
                          </label>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-4 py-3 bg-white/70 dark:bg-black/20 rounded-lg font-mono text-sm text-green-900 dark:text-green-100">
                              {escrow.delivery.trackingNumber}
                            </code>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(escrow.delivery.trackingNumber);
                                toast.success('Tracking number copied');
                              }}
                              className="p-3 bg-white/70 dark:bg-black/20 rounded-lg hover:bg-white dark:hover:bg-black/30 transition"
                            >
                              <Copy className="w-4 h-4 text-green-600" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {escrow.delivery.notes && (
                        <div>
                          <label className="text-sm font-medium text-green-700 dark:text-green-400 mb-1 block">
                            Delivery Notes
                          </label>
                          <p className="px-4 py-3 bg-white/70 dark:bg-black/20 rounded-lg text-green-800 dark:text-green-200">
                            {escrow.delivery.notes}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <label className="text-sm font-medium text-green-700 dark:text-green-400 mb-1 block">
                          Delivered At
                        </label>
                        <p className="px-4 py-3 bg-white/70 dark:bg-black/20 rounded-lg text-green-900 dark:text-green-100 font-medium">
                          {formatDate(escrow.delivery.deliveredAt)}
                        </p>
                      </div>

                      {escrow.delivery.method && (
                        <div>
                          <label className="text-sm font-medium text-green-700 dark:text-green-400 mb-1 block">
                            Delivery Method
                          </label>
                          <p className="px-4 py-3 bg-white/70 dark:bg-black/20 rounded-lg text-green-900 dark:text-green-100 font-medium capitalize">
                            {escrow.delivery.method.replace('_', ' ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Payment Confirmation */}
                {escrow.payment?.paidAt && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        Payment Confirmed
                      </h3>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-400 block mb-1">
                          Payment Method
                        </label>
                        <p className="px-3 py-2 bg-white/70 dark:bg-black/20 rounded-lg text-blue-900 dark:text-blue-100 font-medium capitalize">
                          {escrow.payment.method || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-blue-700 dark:text-blue-400 block mb-1">
                          Paid At
                        </label>
                        <p className="px-3 py-2 bg-white/70 dark:bg-black/20 rounded-lg text-blue-900 dark:text-blue-100 font-medium">
                          {formatDate(escrow.payment.paidAt)}
                        </p>
                      </div>
                      
                      {escrow.payment.transactionId && (
                        <div className="col-span-full">
                          <label className="text-sm font-medium text-blue-700 dark:text-blue-400 block mb-1">
                            Transaction ID
                          </label>
                          <code className="block px-3 py-2 bg-white/70 dark:bg-black/20 rounded-lg text-blue-900 dark:text-blue-100 font-mono text-xs break-all">
                            {escrow.payment.transactionId}
                          </code>
                        </div>
                      )}

                      {escrow.payment.reference && (
                        <div className="col-span-full">
                          <label className="text-sm font-medium text-blue-700 dark:text-blue-400 block mb-1">
                            Payment Reference
                          </label>
                          <code className="block px-3 py-2 bg-white/70 dark:bg-black/20 rounded-lg text-blue-900 dark:text-blue-100 font-mono text-xs break-all">
                            {escrow.payment.reference}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Timeline Tab */}
            {activeTab === 'timeline' && (
              <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Transaction Timeline
                  </h3>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {escrow.timeline?.length || 0} events
                  </span>
                </div>
                
                {escrow.timeline && escrow.timeline.length > 0 ? (
                  <div className="space-y-6">
                    {escrow.timeline.map((event, index) => {
                      const eventStatus = getStatusInfo(event.status);
                      const isLatest = index === escrow.timeline.length - 1;
                      
                      return (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${eventStatus.color} ${isLatest ? 'ring-4 ring-offset-2 ring-blue-100 dark:ring-blue-900/50' : ''}`}>
                              <span className="text-xl">{eventStatus.icon}</span>
                            </div>
                            {index < escrow.timeline.length - 1 && (
                              <div className="w-0.5 h-16 bg-gradient-to-b from-gray-300 to-gray-200 dark:from-gray-700 dark:to-gray-800 my-2"></div>
                            )}
                          </div>
                          
                          <div className="flex-1 pb-2">
                            <div className="flex items-start justify-between mb-1">
                              <p className="font-semibold text-gray-900 dark:text-white capitalize text-lg">
                                {event.status.replace('_', ' ')}
                              </p>
                              {isLatest && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
                                  Current
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {formatDate(event.timestamp)}
                            </p>
                            {event.note && (
                              <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/50 px-4 py-2 rounded-lg mt-2">
                                {event.note}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No timeline events yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                      Events will appear here as the transaction progresses
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <>
                {escrow.chatUnlocked ? (
                  <ChatBox escrowId={escrow._id} currentUser={currentUser} />
                ) : (
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 shadow-sm text-center">
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Chat Locked
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {userRole === 'buyer' 
                          ? 'Complete payment to unlock chat with the seller'
                          : 'Chat will be available once buyer completes payment'}
                      </p>
                      {userRole === 'buyer' && shouldShowPaymentBanner() && (
                        <button
                          onClick={() => navigate(`/payment/${escrow._id}`)}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Complete Payment
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <ActionButtons
                escrow={escrow}
                userRole={userRole}
                onAction={handleAction}
                hideFundButton={shouldShowPaymentBanner()}
              />
            </div>

            {/* Other Party Information */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {userRole === 'buyer' ? 'Seller' : 'Buyer'} Information
              </h3>
              
              {otherParty ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-lg">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {otherParty.name || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg">
                      <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Email Address</p>
                      <p className="font-medium text-gray-900 dark:text-white text-sm break-all">
                        {otherParty.email || 'Not provided'}
                      </p>
                    </div>
                  </div>

                  {otherParty.phone && (
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                        <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Phone Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {otherParty.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* User Stats */}
                  {otherParty.totalTransactions !== undefined && otherParty.totalTransactions > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Completed Deals</span>
                        <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-500" />
                          {otherParty.totalTransactions}
                        </span>
                      </div>
                      {otherParty.successRate && (
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                          <span className="font-semibold text-green-600 dark:text-green-400">
                            {otherParty.successRate}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                  User information not available
                </p>
              )}
            </div>

            {/* Financial Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Summary
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Item Amount</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(financial.amount, escrow.currency)}
                  </span>
                </div>

                {userRole === 'buyer' && (
                  <>
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Buyer Protection Fee (2%)
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        +{formatCurrency(financial.buyerFee, escrow.currency)}
                      </span>
                    </div>
                    <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 dark:text-white">Total You Pay</span>
                        <span className="font-bold text-2xl text-blue-600 dark:text-blue-400">
                          {formatCurrency(financial.buyerPays, escrow.currency)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {userRole === 'seller' && (
                  <>
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Platform Service Fee (1%)
                      </span>
                      <span className="text-gray-700 dark:text-gray-300">
                        -{formatCurrency(financial.sellerFee, escrow.currency)}
                      </span>
                    </div>
                    <div className="pt-3 border-t-2 border-gray-300 dark:border-gray-600">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900 dark:text-white">You Receive</span>
                        <span className="font-bold text-2xl text-green-600 dark:text-green-400">
                          {formatCurrency(financial.sellerReceives, escrow.currency)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                  <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                    <p>• Platform fee: {formatCurrency(financial.platformFee, escrow.currency)}</p>
                    <p>• Delivery method: {escrow.delivery?.method ? escrow.delivery.method.charAt(0).toUpperCase() + escrow.delivery.method.slice(1) : 'Not specified'}</p>
                    <p>• Category: {escrow.category ? escrow.category.replace('_', ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'General'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Protection Badge */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl">
                  <ShieldCheck className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-bold text-green-900 dark:text-green-100 mb-1">
                    Escrow Protected
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Your transaction is secured
                  </p>
                </div>
              </div>
              
              <ul className="space-y-2.5 text-sm text-green-800 dark:text-green-200">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>Funds held in secure escrow until delivery confirmed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>Release controlled by buyer confirmation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>Dispute resolution available 24/7</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                  <span>Full refund if seller doesn't deliver</span>
                </li>
              </ul>
            </div>

            {/* Dispute Warning (if disputed) */}
            {escrow.dispute?.isDisputed && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl">
                    <AlertTriangle className="w-7 h-7 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-900 dark:text-red-200">
                      Dispute Active
                    </h3>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Under review
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-red-200 dark:border-red-700">
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Status</span>
                    <span className="font-semibold text-red-900 dark:text-red-200 capitalize">
                      {escrow.dispute.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-red-200 dark:border-red-700">
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">Raised On</span>
                    <span className="font-medium text-red-900 dark:text-red-200">
                      {formatDate(escrow.dispute.raisedAt)}
                    </span>
                  </div>
                  
                  {escrow.dispute.reason && (
                    <div className="pt-2">
                      <label className="text-sm font-medium text-red-700 dark:text-red-300 block mb-2">
                        Dispute Reason
                      </label>
                      <div className="bg-white/70 dark:bg-black/20 p-4 rounded-lg">
                        <p className="text-sm text-red-900 dark:text-red-200 leading-relaxed">
                          {escrow.dispute.reason}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-red-200 dark:border-red-700">
                    <div className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                      <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p>
                        Our support team is investigating this matter. Both parties will be contacted for additional information if needed. Resolution typically takes 3-5 business days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Help & Support */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Need Help?
              </h4>
              
              <div className="space-y-2">
                {escrow.chatUnlocked && (
                  <button
                    onClick={() => setActiveTab('chat')}
                    className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition border border-blue-100 dark:border-blue-900 group"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Message {userRole === 'buyer' ? 'Seller' : 'Buyer'}
                    </span>
                    <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                {escrow.status === 'delivered' && userRole === 'buyer' && !escrow.dispute?.isDisputed && (
                  <button
                    onClick={() => setShowDisputeModal(true)}
                    className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-gray-700 rounded-lg transition border border-blue-100 dark:border-blue-900 group"
                  >
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Report an Issue
                    </span>
                    <Flag className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:translate-x-1 transition-transform" />
                  </button>
                )}

                <a
                  href="mailto:support@dealcross.net"
                  className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition border border-blue-100 dark:border-blue-900 group"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Contact Support
                  </span>
                  <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                </a>

                <a
                  href="/help"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between p-3 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 rounded-lg transition border border-blue-100 dark:border-blue-900 group"
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Help Center
                  </span>
                  <ExternalLink className="w-4 h-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
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

export default EscrowDetailsPage;