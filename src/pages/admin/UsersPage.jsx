import React, { useState } from 'react';
import { Search, Eye, CheckCircle, XCircle, Shield, TrendingUp } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import UserDetailsModal from '../../components/admin/UserDetailsModal';

const UsersPage = ({ admin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);

  // Mock data - Replace with API call
  const [users] = useState([
    {
      id: 'USR001',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'buyer',
      tier: 'pro',
      verified: true,
      kycStatus: 'approved',
      totalTransactions: 25,
      totalSpent: 45000,
      joinedAt: '2025-08-15T10:30:00Z',
      lastActive: '2025-10-27T14:20:00Z'
    },
    {
      id: 'USR002',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'seller',
      tier: 'enterprise',
      verified: true,
      kycStatus: 'approved',
      totalTransactions: 156,
      totalEarned: 234500,
      joinedAt: '2025-06-20T09:15:00Z',
      lastActive: '2025-10-27T16:45:00Z'
    },
    {
      id: 'USR003',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      role: 'buyer',
      tier: 'free',
      verified: false,
      kycStatus: 'pending',
      totalTransactions: 3,
      totalSpent: 1200,
      joinedAt: '2025-10-20T12:00:00Z',
      lastActive: '2025-10-26T18:30:00Z'
    },
    {
      id: 'USR004',
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      role: 'seller',
      tier: 'basic',
      verified: true,
      kycStatus: 'approved',
      totalTransactions: 42,
      totalEarned: 67800,
      joinedAt: '2025-07-10T15:45:00Z',
      lastActive: '2025-10-27T11:20:00Z'
    }
  ]);

  const getTierBadge = (tier) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      enterprise: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${colors[tier]}`}>
        {tier}
      </span>
    );
  };

  const getKYCBadge = (status) => {
    const badges = {
      approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Verified' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Shield, text: 'Pending' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' }
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

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar admin={admin} activePage="users" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader admin={admin} title="Users Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Verified Users</p>
              <p className="text-2xl font-bold text-green-600">
                {users.filter(u => u.verified).length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Pending KYC</p>
              <p className="text-2xl font-bold text-yellow-600">
                {users.filter(u => u.kycStatus === 'pending').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <p className="text-sm text-gray-600 mb-1">Pro+ Users</p>
              <p className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.tier === 'pro' || u.tier === 'enterprise').length}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, email, or ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="buyer">Buyers</option>
                <option value="seller">Sellers</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      KYC Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transactions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Volume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 capitalize">{user.role}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTierBadge(user.tier)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getKYCBadge(user.kycStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {user.totalTransactions}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          ${(user.totalSpent || user.totalEarned).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.joinedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="text-blue-600 hover:text-blue-900 transition"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdate={(userData) => {
            // API call to update user
            console.log('Updating user:', userData);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default UsersPage;
