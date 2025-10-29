import React, { useState } from 'react';
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
  TrendingUp,
  DollarSign
} from 'lucide-react';
import CreateEscrowModal from '../components/CreateEscrowModal';

const UnifiedDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('buying'); // 'buying' or 'selling'
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock transactions - Replace with API call
  const [buyingTransactions] = useState([
    {
      id: 'ESC001',
      sellerName: 'TechStore Ltd',
      itemName: 'MacBook Pro 16"',
      amount: 2500,
      currency: 'USD',
      status: 'awaiting_delivery',
      createdAt: '2025-10-25',
      deliveryDate: '2025-10-28',
      type: 'buying'
    },
    {
      id: 'ESC002',
      sellerName: 'Fashion Hub',
      itemName: 'Designer Jacket',
      amount: 450,
      currency: 'USD',
      status: 'in_escrow',
      createdAt: '2025-10-26',
      deliveryDate: null,
      type: 'buying'
    }
  ]);

  const [sellingTransactions] = useState([
    {
      id: 'ESC004',
      buyerName: 'John Doe',
      itemName: 'Gaming Laptop',
      amount: 1800,
      currency: 'USD',
      status: 'in_escrow',
      createdAt: '2025-10-26',
      deliveryDate: null,
      type: 'selling'
    },
    {
      id: 'ESC005',
      buyerName: 'Sarah Smith',
      itemName: 'iPhone 15 Pro',
      amount: 1200,
      currency: 'USD',
      status: 'awaiting_delivery',
      createdAt: '2025-10-24',
      deliveryDate: '2025-10-29',
      type: 'selling'
    }
  ]);

  const getStatusBadge = (status) => {
    const badges = {
      'in_escrow': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Awaiting Shipment' },
      'awaiting_delivery': { color: 'bg-blue-100 text-blue-800', icon: Package, text: 'In Transit' },
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      'disputed': { color: 'bg-red-100 text-red-800', icon: AlertCircle, text: 'Disputed' }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="w-4 h-4 mr-1" />
        {badge.text}
      </span>
    );
  };

  const buyingStats = {
    total: buyingTransactions.length,
    inEscrow: buyingTransactions.filter(t => t.status === 'in_escrow').length,
    inTransit: buyingTransactions.filter(t => t.status === 'awaiting_delivery').length,
    completed: 0
  };

  const sellingStats = {
    total: sellingTransactions.length,
    pending: sellingTransactions.filter(t => t.status === 'in_escrow').length,
    shipped: sellingTransactions.filter(t => t.status === 'awaiting_delivery').length,
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
                onClick={() => navigate('/')}
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
                      key={transaction.id}
                      onClick={() => navigate(`/escrow/${transaction.id}`)}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {transaction.itemName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Seller: {transaction.sellerName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ID: {transaction.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {transaction.currency} ${transaction.amount.toLocaleString()}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                        <span>Created: {transaction.createdAt}</span>
                        {transaction.deliveryDate && (
                          <span>Expected Delivery: {transaction.deliveryDate}</span>
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
                <p className="text-3xl font-bold text-green-600">$3,000</p>
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

            {/* Upgrade Prompt */}
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

            {/* Transactions List */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-800">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Sales</h2>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {sellingTransactions.length > 0 ? (
                  sellingTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      onClick={() => navigate(`/escrow/${transaction.id}`)}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {transaction.itemName}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Buyer: {transaction.buyerName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">ID: {transaction.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {transaction.currency} ${transaction.amount.toLocaleString()}
                          </p>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
                        <span>Created: {transaction.createdAt}</span>
                        {transaction.deliveryDate && (
                          <span>Expected Delivery: {transaction.deliveryDate}</span>
                        )}
                      </div>
                      
                      {transaction.status === 'in_escrow' && (
                        <div className="mt-4">
                          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
                            Mark as Shipped
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
          onSuccess={(newEscrow) => {
            setShowCreateModal(false);
            // Refresh transactions
          }}
        />
      )}
    </div>
  );
};

export default UnifiedDashboard;
