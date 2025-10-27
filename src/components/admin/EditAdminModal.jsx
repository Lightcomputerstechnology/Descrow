import React, { useState } from 'react';
import { X, UserCog, Shield } from 'lucide-react';

const EditAdminModal = ({ admin: adminToEdit, onClose, onUpdate, permissionsList }) => {
  const [formData, setFormData] = useState({
    name: adminToEdit.name,
    email: adminToEdit.email,
    role: adminToEdit.role,
    status: adminToEdit.status,
    permissions: { ...adminToEdit.permissions }
  });

  const handlePermissionToggle = (permKey) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permKey]: !prev.permissions[permKey]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedAdmin = {
      ...adminToEdit,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: formData.status,
      permissions: formData.permissions
    };

    onUpdate(updatedAdmin);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <UserCog className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Admin</h2>
              <p className="text-sm text-gray-600">Update admin information and permissions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="john@secureescrow.com"
                  required
                />
              </div>
            </div>

            {/* Account Status */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Account Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  formData.status === 'active' ? 'border-green-500 bg-green-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="active"
                    checked={formData.status === 'active'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="sr-only"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Active</p>
                    <p className="text-xs text-gray-600 mt-1">Admin can access the dashboard</p>
                  </div>
                </label>

                <label className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  formData.status === 'suspended' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="suspended"
                    checked={formData.status === 'suspended'}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="sr-only"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">Suspended</p>
                    <p className="text-xs text-gray-600 mt-1">Admin cannot access the dashboard</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Admin Role */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Admin Role</h3>
              <div className="grid grid-cols-2 gap-4">
                <label className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  formData.role === 'sub_admin' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="sub_admin"
                    checked={formData.role === 'sub_admin'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <UserCog className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Sub Admin</p>
                      <p className="text-xs text-gray-600 mt-1">Limited permissions</p>
                    </div>
                  </div>
                </label>

                <label className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                  formData.role === 'master' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    value="master"
                    checked={formData.role === 'master'}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Master Admin</p>
                      <p className="text-xs text-gray-600 mt-1">Full access</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Permissions - Only for Sub Admin */}
            {formData.role === 'sub_admin' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Permissions</h3>
                <div className="space-y-3">
                  {permissionsList.map((perm) => {
                    if (perm.key === 'manageAdmins') return null; // Master only permission
                    
                    return (
                      <label key={perm.key} className="flex items-start gap-3 cursor-pointer p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                        <input
                          type="checkbox"
                          checked={formData.permissions[perm.key] || false}
                          onChange={() => handlePermissionToggle(perm.key)}
                          className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{perm.label}</p>
                          <p className="text-xs text-gray-600">{perm.description}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Warning for Master */}
            {formData.role === 'master' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>⚠️ Warning:</strong> Master admins have full access to all features. This change will grant complete control over the platform.
                </p>
              </div>
            )}

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The admin will be notified of any changes via email.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdminModal;
