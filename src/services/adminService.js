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

  // User Tier Management
  changeUserTier: async (userId, newTier, reason) => {
    const response = await api.put(`/admin/users/${userId}/tier`, {
      newTier,
      reason
    }, getAdminHeaders());
    return response.data;
  },

  // KYC Management
  reviewKYC: async (userId, action, reason) => {
    const response = await api.put(`/admin/users/${userId}/kyc`, {
      action, // 'approve' or 'reject'
      reason
    }, getAdminHeaders());
    return response.data;
  },

  // Platform Statistics
  getPlatformStats: async () => {
    const response = await api.get('/admin/stats', getAdminHeaders());
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
  },

  // ✅ NEW: Fee Management Endpoints
  
  // Get current fee settings
  getFeeSettings: async () => {
    const response = await api.get('/admin/fees', getAdminHeaders());
    return response.data;
  },

  // Update single fee field
  updateFeeSettings: async (payload) => {
    const response = await api.put('/admin/fees/update', payload, getAdminHeaders());
    return response.data;
  },

  // Bulk update entire tier
  bulkUpdateTierFees: async (tier, updates) => {
    const response = await api.put('/admin/fees/bulk-update', {
      tier,
      updates
    }, getAdminHeaders());
    return response.data;
  },

  // Update gateway costs
  updateGatewayCosts: async (gateway, currency, field, value) => {
    const response = await api.put('/admin/fees/gateway-costs', {
      gateway,
      currency,
      field,
      value
    }, getAdminHeaders());
    return response.data;
  },

  // Get fee change history
  getFeeHistory: async (page = 1, limit = 20) => {
    const response = await api.get('/admin/fees/history', {
      ...getAdminHeaders(),
      params: { page, limit }
    });
    return response.data;
  },

  // Reset fees to default
  resetFeesToDefault: async (tier) => {
    const response = await api.post('/admin/fees/reset', { tier }, getAdminHeaders());
    return response.data;
  }
};