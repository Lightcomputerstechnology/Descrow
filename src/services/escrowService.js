import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper to attach auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const escrowService = {
  // Create new escrow
  createEscrow: async (data) => {
    const response = await axios.post(`${API_URL}/escrow/create`, data, getAuthHeaders());
    return response.data;
  },

  // Get logged-in user's escrows
  getMyEscrows: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await axios.get(`${API_URL}/escrow/my-escrows?${queryString}`, getAuthHeaders());
    return response.data;
  },

  // Get single escrow by ID
  getEscrowById: async (id) => {
    const response = await axios.get(`${API_URL}/escrow/${id}`, getAuthHeaders());
    return response.data;
  },

  // Seller accepts escrow
  acceptEscrow: async (id) => {
    const response = await axios.post(`${API_URL}/escrow/${id}/accept`, {}, getAuthHeaders());
    return response.data;
  },

  // Buyer funds escrow
  fundEscrow: async (id, paymentData) => {
    const response = await axios.post(`${API_URL}/escrow/${id}/fund`, paymentData, getAuthHeaders());
    return response.data;
  },

  // Seller marks as delivered
  markDelivered: async (id, deliveryData) => {
    const response = await axios.post(`${API_URL}/escrow/${id}/deliver`, deliveryData, getAuthHeaders());
    return response.data;
  },

  // Buyer confirms delivery
  confirmDelivery: async (id) => {
    const response = await axios.post(`${API_URL}/escrow/${id}/confirm`, {}, getAuthHeaders());
    return response.data;
  },

  // Raise dispute
  raiseDispute: async (id, disputeData) => {
    const response = await axios.post(`${API_URL}/escrow/${id}/dispute`, disputeData, getAuthHeaders());
    return response.data;
  },

  // Cancel escrow
  cancelEscrow: async (id, reason) => {
    const response = await axios.post(`${API_URL}/escrow/${id}/cancel`, { reason }, getAuthHeaders());
    return response.data;
  },

  // Calculate fees preview
  calculateFees: async (amount) => {
    const response = await axios.get(`${API_URL}/escrow/calculate-fees?amount=${amount}`, getAuthHeaders());
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await axios.get(`${API_URL}/escrow/dashboard-stats`, getAuthHeaders());
    return response.data;
  }
};

export default escrowService;
