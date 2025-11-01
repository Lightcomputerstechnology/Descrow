import api from '../config/api';

export const userService = {
  // Get profile
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // Update profile
  updateProfile: async (userData) => {
    const response = await api.put('/users/profile', userData);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.put('/users/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  // Upload KYC
  uploadKYC: async (documents) => {
    const formData = new FormData();
    documents.forEach(file => {
      formData.append('documents', file);
    });

    const response = await api.post('/users/upload-kyc', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Upgrade tier
  upgradeTier: async (tier, paymentReference) => {
    const response = await api.post('/users/upgrade-tier', {
      tier,
      paymentReference
    });
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/users/statistics');
    return response.data;
  },

  // Enable 2FA
  enable2FA: async () => {
    const response = await api.post('/users/2fa/enable');
    return response.data;
  },

  // Verify 2FA
  verify2FA: async (token) => {
    const response = await api.post('/users/2fa/verify', { token });
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (password) => {
    const response = await api.post('/users/2fa/disable', { password });
    return response.data;
  }
};
