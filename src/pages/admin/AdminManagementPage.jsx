import React, { useState } from 'react';
import { UserCog, Plus, Shield, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import CreateAdminModal from '../../components/admin/CreateAdminModal';
import EditAdminModal from '../../components/admin/EditAdminModal';

const AdminManagementPage = ({ admin }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  // Mock data - Replace with API call
  const [admins, setAdmins] = useState([
    {
      id: 'admin_001',
      name: 'Master Admin',
      email: 'admin@secureescrow.com',
      role: 'master',
      status: 'active',
      permissions: {
        viewTransactions: true,
        manageDisputes: true,
        verifyUsers: true,
        viewAnalytics: true,
        managePayments: true,
        manageAPI: true,
        manageAdmins: true
      },
      createdAt: '2025-06-01T10:00:00Z',
      lastActive: '2025-10-27T16:45:00Z',
      actionsCount: 1247
    },
    {
      id: 'admin_002',
      name: 'John Smith',
      email: 'john@secureescrow.com',
      role: 'sub_admin',
      status: 'active',
      permissions: {
        viewTransactions: true,
        manageDisputes: true,
        verifyUsers: true,
        viewAnalytics: false,
        managePayments: false,
        manageAPI: false,
        manageAdmins: false
      },
      createdAt: '2025-08-15T14:30:00Z',
      lastActive: '2025-10-27T15:20:00Z',
      actionsCount: 342
    },
    {
      id: 'admin_003',
      name: 'Sarah Johnson',
      email: 'sarah@secureescrow.com',
      role: 'sub_admin',
      status: 'active',
      permissions: {
        viewTransactions: true,
        manageDisputes: false,
        verifyUsers: true,
        viewAnalytics: true,
        managePayments: false,
        manageAPI: false,
        manageAdmins: false
      },
      createdAt: '2025-09-20T09:15:00Z',
      lastActive: '2025-10-26T18:30:00Z',
      actionsCount: 156
    }
  ]);

  const deleteAdmin = (adminId) => {
    if (window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
      setAdmins(admins.filter(a => a.id !== adminId));
    }
  };

  const toggleAdminStatus = (adminId) => {
    setAdmins(admins.map(a => 
      a.id === adminId 
        ? { ...a, status: a.status === 'active' ? 'suspended' : 'active' }
        : a
    ));
  };

  const permissionsList = [
    { key: 'viewTransactions', label: 'View Transactions', description: 'Access transaction history and details' },
    { key: 'manageDisputes', label: 'Manage Disputes', description: 'Review and resolve disputes' },
    { key: 'verifyUsers', label: 'Verify Users', description: 'Approve KYC and user verification' },
    { key: 'viewAnalytics', label: 'View Analytics', description: 'Access platform analytics and reports' },
    { key: 'managePayments', label: 'Manage Payments', description: 'Configure payment gateways' },
    { key: 'manageAPI', label: 'Manage API', description: 'Create and manage API keys' },
    { key: 'manageAdmins', label: 'Manage Admins', description: 'Create and manage admin accounts (Master only)' }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar admin={admin} activePage="admins" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader admin={admin} title="Admin Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <UserCog className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Admins</p>
              <p className="text-2xl font-bold text-gray-900">{admins.length}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-green-600">
                {admins.filter(a => a.status === 'active').length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Master Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {admins.filter(a => a.role === 'master').length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <UserCog className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Sub Admins</p>
              <p className="text-2xl font-bold text-yellow-600">
                {admins.filter(a => a.role === 'sub_admin').length}
              </p>
            </div>
          </div>

          {/* Create Admin Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              <Plus className="w-5 h-5" />
              Add New Admin
            </button>
          </div>

          {/* Admins List */}
          <div className="space-y-6">
            {admins.map((adminUser) => (
              <div key={adminUser.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                        adminUser.role === 'master' 
                          ? 'bg-gradient-to-br from-red-500 to-red-600' 
                          : 'bg-gradient-to-br from-blue-500 to-purple-600'
                      }`}>
                        {adminUser.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{adminUser.name}</h3>
                        <p className="text-sm text-gray-600">{adminUser.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            adminUser.role === 'master'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {adminUser.role === 'master' ? 'Master Admin' : 'Sub Admin'}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            adminUser.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {adminUser.status === 'active' ? 'Active' : 'Suspended'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {adminUser.role !== 'master' && admin.role === 'master' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingAdmin(adminUser)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Admin"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteAdmin(adminUser.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Admin"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Actions Performed</p>
                      <p className="text-lg font-bold text-gray-900">{adminUser.actionsCount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Last Active</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(adminUser.lastActive).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Member Since</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(adminUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissionsList.map((perm) => (
                        <div
                          key={perm.key}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            adminUser.permissions[perm.key]
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          {adminUser.permissions[perm.key] ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          )}
                          <div>
                            <p className={`text-sm font-medium ${
                              adminUser.permissions[perm.key] ? 'text-green-900' : 'text-gray-500'
                            }`}>
                              {perm.label}
                            </p>
                            <p className="text-xs text-gray-600">{perm.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  {adminUser.role !== 'master' && admin.role === 'master' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => toggleAdminStatus(adminUser.id)}
                        className={`px-4 py-2 rounded-lg font-semibold transition ${
                          adminUser.status === 'active'
                            ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {adminUser.status === 'active' ? 'Suspend Admin' : 'Activate Admin'}
                      </button>

                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition">
                        View Activity Log
                      </button>

                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition">
                        Send Message
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(newAdmin) => {
            setAdmins([newAdmin, ...admins]);
            setShowCreateModal(false);
          }}
          permissionsList={permissionsList}
        />
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onUpdate={(updatedAdmin) => {
            setAdmins(admins.map(a => a.id === updatedAdmin.id ? updatedAdmin : a));
            setEditingAdmin(null);
          }}
          permissionsList={permissionsList}
        />
      )}
    </div>
  );
};

export default AdminManagementPage;
