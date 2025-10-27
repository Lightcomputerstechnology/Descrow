import React, { useState } from 'react';
import { Search, Filter, Download, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const TransactionsPage = ({ admin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock data - Replace with API call
  const [transactions] = useState([
    {
      id: 'ESC12345',
      buyer: { name: 'John Doe', email: 'john@example.com' },
      seller: { name: 'TechStore Ltd', email: 'sales@techstore.com' },
      itemName: 'MacBook Pro 16"',
      amount: 2500,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'Flutterwave',
      createdAt: '2025-10-27T10:30:00Z',
      completedAt: '2025-10-28T15:20:00Z'
    },
    {
      id: 'ESC12346',
      buyer: { name: 'Jane Smith', email: 'jane@example.com' },
      seller: { name: 'Fashion Hub', email: 'info@fashionhub.com' },
      itemName: 'Designer Jacket',
      amount: 890,
      currency: 'USD',
      status: 'in_escrow',
      paymentMethod: 'Paystack',
      createdAt: '2025-10-27T09:15:00Z',
      completedAt: null
    },
    {
      id: 'ESC12347',
      buyer: { name: 'Mike Johnson', email: 'mike@example.com' },
      seller: { name: 'AutoParts Direct', email: 'sales@autoparts.com' },
      itemName: 'Car Battery',
      amount: 450,
      currency: 'USD',
      status: 'disputed',
      paymentMethod: 'Nowpayments',
      createdAt: '2025-10-27T08:45:00Z',
      completedAt: null
    },
    {
      id: 'ESC12348',
      buyer: { name: 'Sarah Williams', email: 'sarah@example.com' },
      seller: { name: 'Electronics Store', email: 'info@electronics.com' },
      itemName: 'Gaming Console',
      amount: 1200,
      currency: 'USD',
      status: 'awaiting_delivery',
      paymentMethod: 'Flutterwave',
      createdAt: '2025-10-26T14:20:00Z',
      completedAt: null
    }
  ]);

  const getStatusBadge = (status) => {
    const badges = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      in_escrow: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'In Escrow' },
      disputed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Disputed' },
      awaiting_delivery: { color: 'bg-blue-100 text-blue-800', icon: Clock, text: 'In Transit' },
      cancelled: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Cancelled' }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = 
      t.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.buyer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.seller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.itemName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const exportToCSV = () => {
    // Implementation for CSV export
    alert('Exporting transactions to CSV...');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar admin={admin} activePage="transactions" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader admin={admin} title="Transactions Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ID, buyer, seller, or item..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in_escrow">In Escrow</option>
                <option value="awaiting_delivery">In Transit</option>
                <option value="completed">Completed</option>
                <option value="disputed">Disputed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">In Escrow</p>
              <p className="text-2xl font-bold text-yellow-600">
                {transactions.filter(t => t.status === 'in_escrow').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {transactions.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Disputed</p>
              <p className="text-2xl font-bold text-red-600">
                {transactions.filter(t => t.status === 'disputed').length}
              </p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">{transaction.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.buyer.name}</p>
                          <p className="text-xs text-gray-500">{transaction.buyer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.seller.name}</p>
                          <p className="text-xs text-gray-500">{transaction.seller.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{transaction.itemName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {transaction.currency} ${transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{transaction.paymentMethod}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button className="text-blue-600 hover:text-blue-900 transition">
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No transactions found</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TransactionsPage;
