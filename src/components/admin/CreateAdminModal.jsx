import React, { useState } from 'react';
import { X, UserCog, Shield } from 'lucide-react';

const CreateAdminModal = ({ onClose, onCreate, permissionsList }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'sub_admin',
    permissions: {}
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

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Generate new admin - Replace with API call
    const newAdmin = {
      id: 'admin_' + Math.floor(Math.random() * 10000),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'active',
      permissions: formData.permissions,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      actionsCount: 0
    };

    onCreate(newAdmin);
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
              <h2 className="text-2xl font-bold text-gray-900">Create New Admin</h2>
              <p className="text-sm text-gray-600">Add a new admin to your team</p>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength="8"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="••••••••"
                    required
                    minLength="8"
                  />
                </div>
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
                      <p className="text-xs text-gray-600 mt-1">Limited permissions assigned by you</p>
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
                      <p className="text-xs text-gray-600 mt-1">Full access to all features</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Permissions - Only for Sub Admin */}
            {formData.role === 'sub_admin' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Assign Permissions</h3>
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
                  <strong>⚠️ Warning:</strong> Master admins have full access to all features including the ability to manage other admins. Only assign this role to trusted team members.
                </p>
              </div>
            )}

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
                Create Admin
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdminModal;
