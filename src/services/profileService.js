import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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
  }
};

export default profileService;
