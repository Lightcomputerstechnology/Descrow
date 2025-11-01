import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  LogOut,
  ShoppingCart,
  Store,
  DollarSign,
  Loader
} from 'lucide-react';
import CreateEscrowModal from '../components/CreateEscrowModal';
import { authService } from '../services/authService';
import { escrowService } from '../services/escrowService';
import { userService } from '../services/userService';

const UnifiedDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buying'); // 'buying' or 'selling'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [buyingTransactions, setBuyingTransactions] = useState([]);
  const [sellingTransactions, setSellingTransactions] = useState([]);
  const [statistics, setStatistics] = useState(null);

  // Fetch user data and transactions on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get current user from localStorage
      const currentUser = authService.getCurrentUser();
      if (!currentUser) {
        navigate('/login');
        return;
      }
      setUser(currentUser);

      // Fetch user profile (updated info)
      const profileResponse = await userService.getProfile();
      setUser(profileResponse.user);
      localStorage.setItem('user', JSON.stringify(profileResponse.user));

      // Fetch buying transactions
      const buyingResponse = await escrowService.getUserEscrows(currentUser.id, 'buying');
      setBuyingTransactions(buyingResponse.escrows || []);

      // Fetch selling transactions
      const sellingResponse = await escrowService.getUserEscrows(currentUser.id, 'selling');
      setSellingTransactions(sellingResponse.escrows || []);

      // Fetch user statistics
      const statsResponse = await userService.getStatistics();
      setStatistics(statsResponse.statistics);

    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      if (error.response?.status === 401) {
        authService.logout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
  };

  const getStatusBadge = (status) => {
    const badges = {
      'pending_payment': { color: 'bg-orange-100 text-orange-800', icon: Clock, text: 'Pending Payment' },
      'in_escrow': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Awaiting Shipment' },
      'awaiting_delivery': { color: 'bg-blue-100 text-blue-800', icon: Package, text: 'In Transit' },
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      'disputed': { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Disputed' },
      'cancelled': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle, text: 'Cancelled' }
    };
    const badge = badges[status] || badges['in_escrow'];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const buyingStats = statistics?.buying || {
    total: 0,
    inEscrow: 0,
    inTransit: 0,
    completed: 0
  };

  const sellingStats = statistics?.selling || {
    total: 0,
    pending: 0,
    shipped: 0,
    completed: 0
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back, {user.name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Account Tier</p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase">{user.tier}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Switcher */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-2 mb-8 flex gap-2">
          <button
            onClick={() => setActiveTab('buying')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'buying'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Buying
          </button>
          <button
            onClick={() => setActiveTab('selling')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
              activeTab === 'selling'
                ? 'bg-purple-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <Store className="w-5 h-5" />
            Selling
          </button>
        </div>

        {/* Buying Tab */}
        {activeTab === 'buying' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Purchases</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{buyingStats.total}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Escrow</p>
                <p className="text-3xl font-bold text-yellow-600">{buyingStats.inEscrow}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Transit</p>
                <p className="text-3xl font-bold text-blue-600">{buyingStats.inTransit}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">{buyingStats.completed}</p>
              </div>
            </div>

            {/* Tier Limits Info */}
            {statistics?.monthlyTransactions && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  <strong>Monthly Transactions:</strong> {statistics.monthlyTransactions.count} / {statistics.monthlyTransactions.limit === -1 ? 'Unlimited' : statistics.monthlyTransactions.limit}
                  {statistics.monthlyTransactions.remaining !== 'Unlimited' && ` (${statistics.monthlyTransactions.remaining} remaining)`}
                </p>
              </div>
            )}

            {/* Create New Escrow Button */}
            <div className="mb-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Create New Escrow
              </button>
            </div>

            {/* Transactions List */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Purchases</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {buyingTransactions.length > 0 ? (
                  buyingTransactions.map((transaction) => (
                    <div
                      key={transaction.escrowId}
                      onClick={() => navigate(`/escrow/${transaction.escrowId}`)}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {transaction.itemName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Seller: {transaction.seller?.name || transaction.seller?.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ID: {transaction.escrowId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {transaction.currency} ${transaction.amount.toLocaleString()}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                        <span>Created: {formatDate(transaction.createdAt)}</span>
                        {transaction.deliveryDate && (
                          <span>Expected Delivery: {formatDate(transaction.deliveryDate)}</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No purchases yet</p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Create Your First Escrow
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selling Tab */}
        {activeTab === 'selling' && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Sales</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{sellingStats.total}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  ${(user.totalEarned || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{sellingStats.pending}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Shipped</p>
                <p className="text-3xl font-bold text-blue-600">{sellingStats.shipped}</p>
              </div>
            </div>

            {/* Upgrade Prompt (only for free/basic tier) */}
            {(user.tier === 'free' || user.tier === 'basic') && (
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
                <h2 className="text-xl font-semibold mb-2">Upgrade Your Account</h2>
                <p className="mb-4 text-purple-100">Unlock higher transaction limits and more features</p>
                <button 
                  onClick={() => navigate('/#pricing')}
                  className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
                >
                  View Plans
                </button>
              </div>
            )}

            {/* Transactions List */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Sales</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sellingTransactions.length > 0 ? (
                  sellingTransactions.map((transaction) => (
                    <div
                      key={transaction.escrowId}
                      onClick={() => navigate(`/escrow/${transaction.escrowId}`)}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {transaction.itemName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Buyer: {transaction.buyer?.name || transaction.buyer?.email}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ID: {transaction.escrowId}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {transaction.currency} ${transaction.netAmount.toLocaleString()}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                        <span>Created: {formatDate(transaction.createdAt)}</span>
                        {transaction.deliveryDate && (
                          <span>Expected Delivery: {formatDate(transaction.deliveryDate)}</span>
                        )}
                      </div>
                      
                      {transaction.status === 'in_escrow' && (
                        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => navigate(`/escrow/${transaction.escrowId}`)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                          >
                            Upload Delivery Proof
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-2">No sales yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      When someone creates an escrow to buy from you, it will appear here
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Create Escrow Modal */}
      {showCreateModal && (
        <CreateEscrowModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchDashboardData(); // Refresh data
          }}
        />
      )}
    </div>
  );
};

export default UnifiedDashboard;
