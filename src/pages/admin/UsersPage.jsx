import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Users as UsersIcon,
  Loader,
  CheckCircle,
  XCircle,
  Ban,
  UserCheck
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const UsersPage = ({ admin }) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    verified: '',
    kycStatus: '',
    tier: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [filters, currentPage, search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminService.getUsers({
        ...filters,
        page: currentPage,
        limit: 20,
        search
      });
      setUsers(response.users || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (userId) => {
    if (!window.confirm('Verify this user\'s email?')) return;
    
    try {
      await adminService.verifyUser(userId, 'email', 'approved', '');
      alert('Email verified successfully');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to verify email');
    }
  };

  const handleVerifyKYC = async (userId, status) => {
    const notes = status === 'rejected' ? prompt('Rejection reason:') : '';
    if (status === 'rejected' && !notes) return;

    try {
      await adminService.verifyUser(userId, 'kyc', status, notes);
      alert(`KYC ${status} successfully`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update KYC status');
    }
  };

  const handleToggleStatus = async (userId) => {
    if (!window.confirm('Toggle user account status?')) return;

    try {
      await adminService.toggleUserStatus(userId);
      alert('User status updated');
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">User Management</h1>
              <p className="text-sm text-gray-400">Manage and verify platform users</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <form onSubmit={handleSearch} className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                />
              </div>
            </form>

            <select
              value={filters.verified}
              onChange={(e) => {
                setFilters({ ...filters, verified: e.target.value });
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Verification</option>
              <option value="true">Verified</option>
              <option value="false">Unverified</option>
            </select>

            <select
              value={filters.kycStatus}
              onChange={(e) => {
                setFilters({ ...filters, kycStatus: e.target.value });
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="">All KYC Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Tier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Verified</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">KYC</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-white font-medium">{user.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium uppercase">
                          {user.tier}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.verified ? (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400" />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.kycStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                          user.kycStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {user.kycStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="text-green-400 text-sm">Active</span>
                        ) : (
                          <span className="text-red-400 text-sm">Suspended</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!user.verified && (
                            <button
                              onClick={() => handleVerifyEmail(user._id)}
                              className="p-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
                              title="Verify Email"
                            >
                              <UserCheck className="w-4 h-4 text-white" />
                            </button>
                          )}
                          
                          {user.kycStatus === 'pending' && (
                            <>
                              <button
                                onClick={() => handleVerifyKYC(user._id, 'approved')}
                                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                                title="Approve KYC"
                              >
                                <CheckCircle className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={() => handleVerifyKYC(user._id, 'rejected')}
                                className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                                title="Reject KYC"
                              >
                                <XCircle className="w-4 h-4 text-white" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleToggleStatus(user._id)}
                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
                            title={user.isActive ? 'Suspend' : 'Activate'}
                          >
                            <Ban className="w-4 h-4 text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default UsersPage;
