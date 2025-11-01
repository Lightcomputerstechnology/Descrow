import api from '../config/api';

export const disputeService = {
  // Create dispute
  createDispute: async (escrowId, disputeData, evidence) => {
    const formData = new FormData();
    formData.append('escrowId', escrowId);
    formData.append('reason', disputeData.reason);
    formData.append('description', disputeData.description);

    if (evidence && evidence.length > 0) {
      evidence.forEach(file => {
        formData.append('evidence', file);
      });
    }

    const response = await api.post('/disputes/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get dispute
  getDispute: async (escrowId) => {
    const response = await api.get(`/disputes/${escrowId}`);
    return response.data;
  },

  // Respond to dispute
  respondToDispute: async (disputeId, message, evidence) => {
    const formData = new FormData();
    formData.append('message', message);

    if (evidence && evidence.length > 0) {
      evidence.forEach(file => {
        formData.append('evidence', file);
      });
    }

    const response = await api.post(`/disputes/${disputeId}/respond`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get user disputes
  getUserDisputes: async () => {
    const response = await api.get('/disputes/user/all');
    return response.data;
  }
};
