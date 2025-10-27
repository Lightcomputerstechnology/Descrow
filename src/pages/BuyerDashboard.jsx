import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Clock, CheckCircle, AlertCircle, LogOut } from 'lucide-react';
import CreateEscrowModal from '../components/CreateEscrowModal';

const BuyerDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Mock transactions - Replace with API call
  const [transactions, setTransactions] = useState([
    {
      id: 'ESC001',
      sellerName: 'TechStore Ltd',
      itemName: 'MacBook Pro 16"',
      amount: 2500,
      currency: 'USD',
      status: 'awaiting_delivery',
      createdAt: '2025-10-25',
      deliveryDate: '2025-10-28'
    },
    {
      id: 'ESC002',
      sellerName: 'Fashion Hub',
      itemName: 'Designer Jacket',
      amount: 450,
      currency: 'USD',
      status: 'in_escrow',
      createdAt: '2025-10-26',
      deliveryDate: null
    },
    {
      id: 'ESC003',
      sellerName: 'AutoParts Direct',
      itemName: 'Car Battery',
      amount: 180,
      currency: 'USD',
      status: 'completed',
      createdAt: '2025-10-20',
      deliveryDate: '2025-10-23'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
            <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">In Escrow</p>
            <p className="text-3xl font-bold text-yellow-600">
              {transactions.filter(t => t.status === 'in_escrow').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">In Transit</p>
            <p className="text-3xl font-bold text-blue-600">
              {transactions.filter(t => t.status === 'awaiting_delivery').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Completed</p>
            <p className="text-3xl font-bold text-green-600">
              {transactions.filter(t => t.status === 'completed').length}
            </p>
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Transactions</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => navigate(`/escrow/${transaction.id}`)}
                className="p-6 hover:bg-gray-50 cursor-pointer transition"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {transaction.itemName}
                    </h3>
                    <p className="text-sm text-gray-600">Seller: {transaction.sellerName}</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {transaction.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {transaction.currency} ${transaction.amount.toLocaleString()}
                    </p>
                    {getStatusBadge(transaction.status)}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Created: {transaction.createdAt}</span>
                  {transaction.deliveryDate && (
                    <span>Expected Delivery: {transaction.deliveryDate}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Create Escrow Modal */}
      {showCreateModal && (
        <CreateEscrowModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(newEscrow) => {
            setTransactions([newEscrow, ...transactions]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default BuyerDashboard;
