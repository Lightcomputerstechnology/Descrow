import axios from 'axios';

// Base API URL - Replace with your actual backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password, role) => 
    apiClient.post('/auth/login', { email, password, role }),
  
  register: (userData) => 
    apiClient.post('/auth/register', userData),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  verifyEmail: (token) => 
    apiClient.post('/auth/verify-email', { token }),
};

// Escrow APIs
export const escrowAPI = {
  create: (escrowData) => 
    apiClient.post('/escrow/create', escrowData),
  
  getAll: (userId, role) => 
    apiClient.get(`/escrow/user/${userId}`, { params: { role } }),
  
  getById: (escrowId) => 
    apiClient.get(`/escrow/${escrowId}`),
  
  updateStatus: (escrowId, status) => 
    apiClient.patch(`/escrow/${escrowId}/status`, { status }),
  
  releasePayment: (escrowId, signatureData) => 
    apiClient.post(`/escrow/${escrowId}/release`, { signatureData }),
  
  delete: (escrowId) => 
    apiClient.delete(`/escrow/${escrowId}`),
};

// Delivery APIs
export const deliveryAPI = {
  uploadProof: (escrowId, proofData) => 
    apiClient.post(`/delivery/${escrowId}/proof`, proofData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getTracking: (escrowId) => 
    apiClient.get(`/delivery/${escrowId}/tracking`),
  
  updateGPSLocation: (escrowId, location) => 
    apiClient.post(`/delivery/${escrowId}/gps`, location),
};

// Chat APIs
export const chatAPI = {
  getMessages: (escrowId) => 
    apiClient.get(`/chat/${escrowId}/messages`),
  
  sendMessage: (escrowId, messageData) => 
    apiClient.post(`/chat/${escrowId}/messages`, messageData),
  
  uploadFile: (escrowId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`/chat/${escrowId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
};

// Dispute APIs
export const disputeAPI = {
  create: (disputeData) => 
    apiClient.post('/disputes/create', disputeData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  getById: (disputeId) => 
    apiClient.get(`/disputes/${disputeId}`),
  
  getByEscrow: (escrowId) => 
    apiClient.get(`/disputes/escrow/${escrowId}`),
  
  addEvidence: (disputeId, evidence) => 
    apiClient.post(`/disputes/${disputeId}/evidence`, evidence, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// User APIs
export const userAPI = {
  getProfile: (userId) => 
    apiClient.get(`/users/${userId}`),
  
  updateProfile: (userId, profileData) => 
    apiClient.patch(`/users/${userId}`, profileData),
  
  upgradeTier: (userId, tier) => 
    apiClient.post(`/users/${userId}/upgrade`, { tier }),
  
  getTransactionHistory: (userId) => 
    apiClient.get(`/users/${userId}/transactions`),
};

// Payment APIs
export const paymentAPI = {
  initiatePayment: (escrowId, paymentMethod) => 
    apiClient.post('/payments/initiate', { escrowId, paymentMethod }),
  
  confirmPayment: (paymentId) => 
    apiClient.post(`/payments/${paymentId}/confirm`),
  
  refund: (escrowId, amount) => 
    apiClient.post('/payments/refund', { escrowId, amount }),
};

// Admin APIs (for backend admin panel)
export const adminAPI = {
  getAllDisputes: (status) => 
    apiClient.get('/admin/disputes', { params: { status } }),
  
  resolveDispute: (disputeId, resolution) => 
    apiClient.post(`/admin/disputes/${disputeId}/resolve`, resolution),
  
  getAllTransactions: (filters) => 
    apiClient.get('/admin/transactions', { params: filters }),
  
  getAnalytics: () => 
    apiClient.get('/admin/analytics'),
  
  verifyUser: (userId, verified) => 
    apiClient.patch(`/admin/users/${userId}/verify`, { verified }),
};

export default apiClient;
