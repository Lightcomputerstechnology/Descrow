import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  Plus,
  Loader,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  X
} from 'lucide-react';
import { adminService } from 'services/adminService'; // ← fixed absolute import
const AdminManagementPage = ({ admin }) => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    permissions: {
      viewTransactions: false,
      manageDisputes: false,
      verifyUsers: false,
      viewAnalytics: false,
      managePayments: false,
      manageAPI: false,
      manageAdmins: false
    }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAdmins();
      setAdmins(response.admins || []);
    } catch (error) {
      console.error('Failed to fetch admins:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.createSubAdmin(formData);
      alert('Sub-admin created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchAdmins();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to create sub-admin');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePermissions = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminService.updateAdminPermissions(selectedAdmin._id, formData.permissions);
      alert('Permissions updated successfully');
      setShowEditModal(false);
      setSelectedAdmin(null);
      resetForm();
      fetchAdmins();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (adminId) => {
    if (!window.confirm('Toggle admin account status?')) return;

    try {
      await adminService.toggleAdminStatus(adminId);
      alert('Admin status updated');
      fetchAdmins();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this sub-admin? This action cannot be undone.')) return;

    try {
      await adminService.deleteSubAdmin(adminId);
      alert('Sub-admin deleted successfully');
      fetchAdmins();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete sub-admin');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      permissions: {
        viewTransactions: false,
        manageDisputes: false,
        verifyUsers: false,
        viewAnalytics: false,
        managePayments: false,
        manageAPI: false,
        manageAdmins: false
      }
    });
  };

  const openEditModal = (adminToEdit) => {
    setSelectedAdmin(adminToEdit);
    setFormData({
      name: adminToEdit.name,
      email: adminToEdit.email,
      password: '',
      permissions: adminToEdit.permissions
    });
    setShowEditModal(true);
  };

  const permissionLabels = {
    viewTransactions: 'View Transactions',
    manageDisputes: 'Manage Disputes',
    verifyUsers: 'Verify Users',
    viewAnalytics: 'View Analytics',
    managePayments: 'Manage Payments',
    manageAPI: 'Manage API',
    manageAdmins: 'Manage Admins'
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Management</h1>
                <p className="text-sm text-gray-400">Manage sub-admin accounts and permissions</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              <Plus className="w-5 h-5" />
              Create Sub-Admin
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admins List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Admin</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Permissions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : admins.length > 0 ? (
                  admins.map((adminUser) => (
                    <tr key={adminUser._id} className="hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {adminUser.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-medium">{adminUser.name}</p>
                            <p className="text-sm text-gray-400">{adminUser.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          adminUser.role === 'master'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {adminUser.role === 'master' ? 'Master Admin' : 'Sub Admin'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(adminUser.permissions).filter(([key, value]) => value).map(([key]) => (
                            <span key={key} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                              {permissionLabels[key]}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-400">{adminUser.actionsCount || 0} actions</p>
                      </td>
                      <td className="px-6 py-4">
                        {adminUser.status === 'active' ? (
                          <span className="text-green-400 text-sm">Active</span>
                        ) : (
                          <span className="text-red-400 text-sm">Suspended</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {adminUser.role !== 'master' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(adminUser)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                              title="Edit Permissions"
                            >
                              <Edit className="w-4 h-4 text-white" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(adminUser._id)}
                              className="p-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition"
                              title={adminUser.status === 'active' ? 'Suspend' : 'Activate'}
                            >
                              {adminUser.status === 'active' ? (
                                <UserX className="w-4 h-4 text-white" />
                              ) : (
                                <UserCheck className="w-4 h-4 text-white" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeleteAdmin(adminUser._id)}
                              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-white" />
                            </button>
                          </div>
                        )}
                        {adminUser.role === 'master' && (
                          <span className="text-xs text-gray-500">Cannot modify</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No admins found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Create Sub-Admin</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleCreateAdmin} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="admin@dealcross.net"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Permissions
                </label>
                <div className="space-y-3 bg-gray-900 rounded-lg p-4 border border-gray-700">
                  {Object.keys(formData.permissions).map((permission) => (
                    <label key={permission} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions[permission]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              [permission]: e.target.checked
                            }
                          })
                        }
                        className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-300">{permissionLabels[permission]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Sub-Admin'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Permissions Modal */}
      {showEditModal && selectedAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-white">Edit Permissions</h2>
                <p className="text-sm text-gray-400 mt-1">{selectedAdmin.name}</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAdmin(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleUpdatePermissions} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Permissions
                </label>
                <div className="space-y-3 bg-gray-900 rounded-lg p-4 border border-gray-700">
                  {Object.keys(formData.permissions).map((permission) => (
                    <label key={permission} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions[permission]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              [permission]: e.target.checked
                            }
                          })
                        }
                        className="w-4 h-4 text-red-600 bg-gray-800 border-gray-600 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-300">{permissionLabels[permission]}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAdmin(null);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Permissions'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagementPage;