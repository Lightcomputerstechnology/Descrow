import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, AlertCircle, DollarSign, LogOut } from 'lucide-react';

const SellerDashboard = ({ user }) => {
  const navigate = useNavigate();
  
  // Mock transactions - Replace with API call
  const [transactions, setTransactions] = useState([
    {
      id: 'ESC004',
      buyerName: 'John Doe',
      itemName: 'Gaming Laptop',
      amount: 1800,
      currency: 'USD',
      status: 'in_escrow',
      createdAt: '2025-10-26',
      deliveryDate: null
    },
    {
      id: 'ESC005',
      buyerName: 'Sarah Smith',
      itemName: 'iPhone 15 Pro',
      amount: 1200,
      currency: 'USD',
      status: 'awaiting_delivery',
      createdAt: '2025-10-24',
      deliveryDate: '2025-10-29'
    },
    {
      id: 'ESC006',
      buyerName: 'Mike Johnson',
      itemName: 'Wireless Headphones',
      amount: 350,
      currency: 'USD',
      status: 'completed',
      createdAt: '2025-10-18',
      deliveryDate: '2025-10-22'
    }
  ]);

  const getStatusBadge = (status) => {
    const badges = {
      'in_escrow': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending Shipment' },
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

  const totalEarnings = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingEarnings = transactions
    .filter(t => t.status !== 'completed' && t.status !== 'disputed')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
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
            <p className="text-sm text-gray-600 mb-1">Total Sales</p>
            <p className="text-3xl font-bold text-gray-900">{transactions.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">Total Earnings</p>
            </div>
            <p className="text-3xl font-bold text-green-600">${totalEarnings.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-3xl font-bold text-yellow-600">${pendingEarnings.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600 mb-1">Account Tier</p>
            <p className="text-2xl font-bold text-blue-600 capitalize">{user.tier}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <h2 className="text-xl font-semibold mb-2">Upgrade Your Account</h2>
          <p className="mb-4 text-blue-100">Unlock higher transaction limits and more features</p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
            View Plans
          </button>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Sales</h2>
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
                    <p className="text-sm text-gray-600">Buyer: {transaction.buyerName}</p>
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
                
                {transaction.status === 'in_escrow' && (
                  <div className="mt-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                      Mark as Shipped
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SellerDashboard;
