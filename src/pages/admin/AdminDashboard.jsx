import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  DollarSign,
  Package,
  AlertCircle,
  TrendingUp,
  Activity,
  Shield,
  LogOut,
  Loader
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const AdminDashboard = ({ admin }) => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentEscrows, setRecentEscrows] = useState([]);
  const [recentDisputes, setRecentDisputes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDashboardStats();
      setStats(response.stats);
      setRecentEscrows(response.recentEscrows || []);
      setRecentDisputes(response.recentDisputes || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    navigate('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader className="w-12 h-12 text-red-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-sm text-gray-400">Welcome back, {admin.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs text-gray-400">Role</p>
                <p className="text-sm font-semibold text-red-400 uppercase">{admin.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-xs text-gray-400">Today: +{stats?.todayUsers || 0}</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats?.totalUsers || 0}</p>
            <p className="text-sm text-gray-400">Total Users</p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-green-400" />
              <span className="text-xs text-gray-400">Today: +{stats?.todayEscrows || 0}</span>
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats?.totalEscrows || 0}</p>
            <p className="text-sm text-gray-400">Total Escrows</p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">{stats?.activeEscrows || 0}</p>
            <p className="text-sm text-gray-400">Active Escrows</p>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-white mb-1">
              ${(stats?.totalRevenue || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.pendingDisputes || 0}</p>
                <p className="text-sm text-gray-400">Pending Disputes</p>
              </div>
            </div>
            {admin.permissions.manageDisputes && (
              <button
                onClick={() => navigate('/admin/disputes')}
                className="text-sm text-yellow-400 hover:text-yellow-300 transition"
              >
                View All Disputes →
              </button>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.completedEscrows || 0}</p>
                <p className="text-sm text-gray-400">Completed Escrows</p>
              </div>
            </div>
            {admin.permissions.viewTransactions && (
              <button
                onClick={() => navigate('/admin/transactions')}
                className="text-sm text-green-400 hover:text-green-300 transition"
              >
                View All Transactions →
              </button>
            )}
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{stats?.totalUsers || 0}</p>
                <p className="text-sm text-gray-400">Total Users</p>
              </div>
            </div>
            {admin.permissions.verifyUsers && (
              <button
                onClick={() => navigate('/admin/users')}
                className="text-sm text-blue-400 hover:text-blue-300 transition"
              >
                Manage Users →
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Escrows */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Recent Escrows</h2>
            </div>
            <div className="divide-y divide-gray-700">
              {recentEscrows.length > 0 ? (
                recentEscrows.slice(0, 5).map((escrow) => (
                  <div key={escrow._id} className="p-4 hover:bg-gray-700/50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-white">{escrow.itemName}</p>
                        <p className="text-sm text-gray-400">
                          {escrow.buyer?.name} → {escrow.seller?.name}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-green-400">
                        ${escrow.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        escrow.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        escrow.status === 'disputed' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {escrow.status.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(escrow.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No recent escrows</div>
              )}
            </div>
          </div>

          {/* Recent Disputes */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Recent Disputes</h2>
            </div>
            <div className="divide-y divide-gray-700">
              {recentDisputes.length > 0 ? (
                recentDisputes.slice(0, 5).map((dispute) => (
                  <div key={dispute._id} className="p-4 hover:bg-gray-700/50 transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-white">{dispute.reason}</p>
                        <p className="text-sm text-gray-400">
                          Escrow: {dispute.escrow?.escrowId}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        dispute.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                        dispute.status === 'under_review' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {dispute.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No recent disputes</div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {admin.permissions.viewTransactions && (
            <button
              onClick={() => navigate('/admin/transactions')}
              className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition text-left"
            >
              <Package className="w-8 h-8 text-blue-400 mb-2" />
              <p className="font-semibold text-white">Transactions</p>
              <p className="text-xs text-gray-400">View all escrows</p>
            </button>
          )}

          {admin.permissions.manageDisputes && (
            <button
              onClick={() => navigate('/admin/disputes')}
              className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition text-left"
            >
              <AlertCircle className="w-8 h-8 text-yellow-400 mb-2" />
              <p className="font-semibold text-white">Disputes</p>
              <p className="text-xs text-gray-400">Manage disputes</p>
            </button>
          )}

          {admin.permissions.verifyUsers && (
            <button
              onClick={() => navigate('/admin/users')}
              className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition text-left"
            >
              <Users className="w-8 h-8 text-green-400 mb-2" />
              <p className="font-semibold text-white">Users</p>
              <p className="text-xs text-gray-400">Manage users</p>
            </button>
          )}

          {admin.permissions.viewAnalytics && (
            <button
              onClick={() => navigate('/admin/analytics')}
              className="p-4 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition text-left"
            >
              <TrendingUp className="w-8 h-8 text-purple-400 mb-2" />
              <p className="font-semibold text-white">Analytics</p>
              <p className="text-xs text-gray-400">View reports</p>
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
