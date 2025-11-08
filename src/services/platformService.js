import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAdminHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const platformService = {
  // Get current settings (public)
  getSettings: async () => {
    const response = await axios.get(`${API_URL}/platform/settings`);
    return response.data;
  },

  // Calculate fee for test amount (public)
  calculateFee: async (amount) => {
    const response = await axios.get(
      `${API_URL}/platform/calculate-fee?amount=${amount}`
    );
    return response.data;
  },

  // Update fee settings (admin only)
  updateFeeSettings: async (feeData) => {
    const response = await axios.put(
      `${API_URL}/platform/fees`,
      feeData,
      getAdminHeaders()
    );
    return response.data;
  },

  // Preview fee impact (admin only)
  previewFeeImpact: async (feeData) => {
    const response = await axios.post(
      `${API_URL}/platform/fees/preview`,
      feeData,
      getAdminHeaders()
    );
    return response.data;
  },

  // Get fee history (admin only)
  getFeeHistory: async () => {
    const response = await axios.get(
      `${API_URL}/platform/fees/history`,
      getAdminHeaders()
    );
    return response.data;
  },

  // Toggle maintenance mode (admin only)
  toggleMaintenance: async (enabled, message) => {
    const response = await axios.put(
      `${API_URL}/platform/maintenance`,
      { enabled, message },
      getAdminHeaders()
    );
    return response.data;
  }
};

export default platformService;
