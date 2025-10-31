import api from '../config/api';

export const escrowService = {
  // Create escrow
  createEscrow: async (escrowData) => {
    const response = await api.post('/escrow/create', escrowData);
    return response.data;
  },

  // Get user escrows
  getUserEscrows: async (userId, role) => {
    const response = await api.get(`/escrow/user/${userId}?role=${role || ''}`);
    return response.data;
  },

  // Get single escrow
  getEscrow: async (escrowId) => {
    const response = await api.get(`/escrow/${escrowId}`);
    return response.data;
  },

  // Release payment
  releasePayment: async (escrowId, signatureData) => {
    const response = await api.post(`/escrow/${escrowId}/release`, { signatureData });
    return response.data;
  },

  // Cancel escrow
  cancelEscrow: async (escrowId, reason) => {
    const response = await api.post(`/escrow/${escrowId}/cancel`, { reason });
    return response.data;
  },

  // Get user stats
  getUserStats: async () => {
    const response = await api.get('/escrow/stats');
    return response.data;
  }
};
