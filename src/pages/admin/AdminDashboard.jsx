import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Activity,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const AdminDashboard = ({ admin }) => {
  // Mock data - Replace with API calls
  const [stats] = useState({
    totalTransactions: 1247,
    totalValue: 3456789,
    activeEscrows: 156,
    completedToday: 23,
    pendingDisputes: 8,
    totalUsers: 5432,
    revenueThisMonth: 45678,
    transactionFees: 12345
  });

  const [recentTransactions] = useState([
    {
      id: 'ESC12345',
      buyer: 'John Doe',
      seller: 'TechStore Ltd',
      amount: 2500,
      status: 'completed',
      date: '2025-10-27T10:30:00Z'
    },
    {
      id: 'ESC12346',
      buyer: 'Jane Smith',
      seller: 'Fashion Hub',
      amount: 890,
      status: 'in_escrow',
      date: '2025-10-27T09:15:00Z'
    },
    {
      id: 'ESC12347',
      buyer: 'Mike Johnson',
      seller: 'AutoParts Direct',
      amount: 450,
      status: 'disputed',
      date: '2025-10-27T08:45:00Z'
    }
  ]);

  const getStatusBadge = (status) => {
    const badges = {
      completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Completed' },
      in_escrow: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'In Escrow' },
      disputed: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Disputed' },
      awaiting_delivery: { color: 'bg-blue-100 text-blue-800', icon: Activity, text: 'In Transit' }
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

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar admin={admin} activePage="dashboard" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader admin={admin} title="Dashboard Overview" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold">+12.5%</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Transaction Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ${stats.totalValue.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold">+8.2%</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Active Escrows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeEscrows}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm text-red-600 font-semibold">Urgent</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Pending Disputes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingDisputes}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold">+15.3%</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>

          {/* Revenue Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Monthly Revenue</h3>
                <TrendingUp className="w-6 h-6" />
              </div>
              <p className="text-4xl font-bold mb-2">${stats.revenueThisMonth.toLocaleString()}</p>
              <p className="text-green-100">October 2025</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Transaction Fees</h3>
                <DollarSign className="w-6 h-6" />
              </div>
              <p className="text-4xl font-bold mb-2">${stats.transactionFees.toLocaleString()}</p>
              <p className="text-blue-100">This Month</p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            </div>
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
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 cursor-pointer">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-blue-600">{transaction.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{transaction.buyer}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{transaction.seller}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          ${transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.date).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
