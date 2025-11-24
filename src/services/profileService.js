// File: src/services/profileService.js - UPDATED WITH BANK ACCOUNT METHODS
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://descrow-backend-5ykg.onrender.com/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const profileService = {
  // Get profile
  getProfile: async () => {
    const response = await axios.get(
      `${API_URL}/profile`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await axios.put(
      `${API_URL}/profile`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);

    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/profile/avatar`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  },

  // Submit KYC
  submitKYC: async (data) => {
    const response = await axios.post(
      `${API_URL}/profile/kyc`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // Get KYC status
  getKYCStatus: async () => {
    const response = await axios.get(
      `${API_URL}/profile/kyc/status`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    const response = await axios.post(
      `${API_URL}/profile/change-password`,
      { currentPassword, newPassword },
      getAuthHeaders()
    );
    return response.data;
  },

  // Delete account
  deleteAccount: async (password, reason) => {
    const response = await axios.post(
      `${API_URL}/profile/delete-account`,
      { password, reason },
      getAuthHeaders()
    );
    return response.data;
  },

  // ==================== BANK ACCOUNT METHODS ====================

  // Get user's bank accounts
  getBankAccounts: async () => {
    const response = await axios.get(
      `${API_URL}/bank/list`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Get banks list
  getBanks: async (params = {}) => {
    const response = await axios.get(
      `${API_URL}/bank/banks`,
      {
        ...getAuthHeaders(),
        params
      }
    );
    return response.data;
  },

  // Add bank account
  addBankAccount: async (data) => {
    const response = await axios.post(
      `${API_URL}/bank/add`,
      data,
      getAuthHeaders()
    );
    return response.data;
  },

  // Delete bank account
  deleteBankAccount: async (accountId) => {
    const response = await axios.delete(
      `${API_URL}/bank/${accountId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Set primary bank account
  setPrimaryBankAccount: async (accountId) => {
    const response = await axios.put(
      `${API_URL}/bank/primary/${accountId}`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Validate bank account
  validateBankAccount: async (data) => {
    const response = await axios.post(
      `${API_URL}/bank/validate`,
      data,
      getAuthHeaders()
    );
    return response.data;
  }
};

export default profileService;