import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Activity,
  Calendar,
  Download,
  BarChart3,
  PieChart
} from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const AnalyticsPage = ({ admin }) => {
  const [dateRange, setDateRange] = useState('30d'); // 7d, 30d, 90d, 1y

  // Mock data - Replace with API call
  const analytics = {
    overview: {
      totalRevenue: 156789,
      revenueGrowth: 12.5,
      totalTransactions: 2456,
      transactionsGrowth: 8.3,
      totalUsers: 5432,
      usersGrowth: 15.7,
      avgTransactionValue: 1847,
      avgValueGrowth: 5.2
    },
    revenueByMonth: [
      { month: 'Apr', revenue: 32400, transactions: 342 },
      { month: 'May', revenue: 45600, transactions: 456 },
      { month: 'Jun', revenue: 38900, transactions: 389 },
      { month: 'Jul', revenue: 52300, transactions: 523 },
      { month: 'Aug', revenue: 48700, transactions: 487 },
      { month: 'Sep', revenue: 61200, transactions: 612 },
      { month: 'Oct', revenue: 73500, transactions: 735 }
    ],
    transactionsByStatus: [
      { status: 'Completed', count: 1847, percentage: 75.2 },
      { status: 'In Escrow', count: 342, percentage: 13.9 },
      { status: 'In Transit', count: 189, percentage: 7.7 },
      { status: 'Disputed', count: 78, percentage: 3.2 }
    ],
    topPaymentMethods: [
      { method: 'Flutterwave', count: 1245, amount: 78900, percentage: 50.7 },
      { method: 'Paystack', count: 876, amount: 52400, percentage: 35.7 },
      { method: 'Nowpayments', count: 335, amount: 25489, percentage: 13.6 }
    ],
    userGrowth: [
      { month: 'Apr', buyers: 120, sellers: 85 },
      { month: 'May', buyers: 156, sellers: 112 },
      { month: 'Jun', buyers: 189, sellers: 134 },
      { month: 'Jul', buyers: 223, sellers: 167 },
      { month: 'Aug', buyers: 267, sellers: 198 },
      { month: 'Sep', buyers: 312, sellers: 234 },
      { month: 'Oct', buyers: 378, sellers: 289 }
    ],
    topCountries: [
      { country: 'Nigeria', transactions: 892, revenue: 45600 },
      { country: 'Kenya', transactions: 567, revenue: 28900 },
      { country: 'Ghana', transactions: 423, revenue: 21400 },
      { country: 'South Africa', transactions: 334, revenue: 17800 },
      { country: 'United States', transactions: 240, revenue: 34500 }
    ]
  };

  const exportReport = () => {
    alert('Exporting analytics report...');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar admin={admin} activePage="analytics" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader admin={admin} title="Analytics & Reports" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    dateRange === range
                      ? 'bg-red-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {range === '7d' ? 'Last 7 Days' :
                   range === '30d' ? 'Last 30 Days' :
                   range === '90d' ? 'Last 90 Days' :
                   'Last Year'}
                </button>
              ))}
            </div>

            <button
              onClick={exportReport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold">
                  +{analytics.overview.revenueGrowth}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ${analytics.overview.totalRevenue.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-blue-600 font-semibold">
                  +{analytics.overview.transactionsGrowth}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalTransactions.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm text-purple-600 font-semibold">
                  +{analytics.overview.usersGrowth}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">
                {analytics.overview.totalUsers.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <span className="text-sm text-yellow-600 font-semibold">
                  +{analytics.overview.avgValueGrowth}%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Transaction</p>
              <p className="text-2xl font-bold text-gray-900">
                ${analytics.overview.avgTransactionValue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Revenue Over Time</h2>
              </div>
            </div>
            <div className="h-80">
              {/* Simple Bar Chart Representation */}
              <div className="flex items-end justify-between h-full gap-2">
                {analytics.revenueByMonth.map((item, index) => {
                  const maxRevenue = Math.max(...analytics.revenueByMonth.map(i => i.revenue));
                  const height = (item.revenue / maxRevenue) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-blue-500 hover:bg-blue-600 rounded-t transition relative group" style={{ height: `${height}%` }}>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                          ${item.revenue.toLocaleString()}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">{item.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Transactions by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Transactions by Status</h2>
              </div>
              <div className="space-y-4">
                {analytics.transactionsByStatus.map((item, index) => {
                  const colors = ['bg-green-500', 'bg-yellow-500', 'bg-blue-500', 'bg-red-500'];
                  return (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-900">{item.status}</span>
                        <span className="text-sm text-gray-600">{item.count} ({item.percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`${colors[index]} h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top Payment Methods */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Methods Performance</h2>
              <div className="space-y-4">
                {analytics.topPaymentMethods.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{item.method}</p>
                        <p className="text-sm text-gray-600">{item.count} transactions</p>
                      </div>
                      <p className="text-lg font-bold text-gray-900">${item.amount.toLocaleString()}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div 
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* User Growth */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">User Growth</h2>
            <div className="h-64">
              <div className="flex items-end justify-between h-full gap-4">
                {analytics.userGrowth.map((item, index) => {
                  const maxUsers = Math.max(...analytics.userGrowth.map(i => i.buyers + i.sellers));
                  const buyersHeight = (item.buyers / maxUsers) * 100;
                  const sellersHeight = (item.sellers / maxUsers) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex gap-1 items-end">
                        <div 
                          className="flex-1 bg-blue-500 rounded-t relative group"
                          style={{ height: `${buyersHeight * 2}px` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            {item.buyers} buyers
                          </div>
                        </div>
                        <div 
                          className="flex-1 bg-purple-500 rounded-t relative group"
                          style={{ height: `${sellersHeight * 2}px` }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                            {item.sellers} sellers
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 font-medium">{item.month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600">Buyers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-purple-500 rounded"></div>
                <span className="text-sm text-gray-600">Sellers</span>
              </div>
            </div>
          </div>

          {/* Top Countries */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Top Countries by Revenue</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.topCountries.map((country, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900">#{index + 1}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{country.country}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">{country.transactions.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          ${country.revenue.toLocaleString()}
                        </span>
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

export default AnalyticsPage;
