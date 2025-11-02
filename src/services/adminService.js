import api from '../config/api';

// Use admin token instead of user token
const getAdminHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const adminService = {
  // Dashboard stats
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard', getAdminHeaders());
    return response.data;
  },

  // Transactions
  getTransactions: async (filters) => {
    const response = await api.get('/admin/transactions', {
      ...getAdminHeaders(),
      params: filters
    });
    return response.data;
  },

  // Disputes
  getDisputes: async (filters) => {
    const response = await api.get('/admin/disputes', {
      ...getAdminHeaders(),
      params: filters
    });
    return response.data;
  },

  resolveDispute: async (disputeId, resolution) => {
    const response = await api.put(`/admin/disputes/${disputeId}/resolve`, resolution, getAdminHeaders());
    return response.data;
  },

  // Users
  getUsers: async (filters) => {
    const response = await api.get('/admin/users', {
      ...getAdminHeaders(),
      params: filters
    });
    return response.data;
  },

  verifyUser: async (userId, verificationType, status, notes) => {
    const response = await api.put(`/admin/users/${userId}/verify`, {
      verificationType,
      status,
      notes
    }, getAdminHeaders());
    return response.data;
  },

  toggleUserStatus: async (userId) => {
    const response = await api.put(`/admin/users/${userId}/toggle-status`, {}, getAdminHeaders());
    return response.data;
  },

  // Analytics
  getAnalytics: async (period) => {
    const response = await api.get('/admin/analytics', {
      ...getAdminHeaders(),
      params: { period }
    });
    return response.data;
  },

  // Admin Management
  getAdmins: async () => {
    const response = await api.get('/admin/admins', getAdminHeaders());
    return response.data;
  },

  createSubAdmin: async (adminData) => {
    const response = await api.post('/admin/admins', adminData, getAdminHeaders());
    return response.data;
  },

  updateAdminPermissions: async (adminId, permissions) => {
    const response = await api.put(`/admin/admins/${adminId}/permissions`, { permissions }, getAdminHeaders());
    return response.data;
  },

  toggleAdminStatus: async (adminId) => {
    const response = await api.put(`/admin/admins/${adminId}/toggle-status`, {}, getAdminHeaders());
    return response.data;
  },

  deleteSubAdmin: async (adminId) => {
    const response = await api.delete(`/admin/admins/${adminId}`, getAdminHeaders());
    return response.data;
  },

  // Crypto payment verification
  confirmCryptoPayment: async (escrowId) => {
    const response = await api.post('/payments/crypto/confirm', { escrowId }, getAdminHeaders());
    return response.data;
  },

  rejectCryptoPayment: async (escrowId, reason) => {
    const response = await api.post('/payments/crypto/reject', { escrowId, reason }, getAdminHeaders());
    return response.data;
  }
};
