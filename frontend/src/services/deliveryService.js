import api from '../config/api';

export const deliveryService = {
  // Upload delivery proof
  uploadDeliveryProof: async (escrowId, deliveryData, proofImages) => {
    const formData = new FormData();
    formData.append('escrowId', escrowId);
    formData.append('trackingNumber', deliveryData.trackingNumber);
    formData.append('carrier', deliveryData.carrier);
    formData.append('estimatedDelivery', deliveryData.estimatedDelivery);
    formData.append('notes', deliveryData.notes || '');

    if (proofImages && proofImages.length > 0) {
      proofImages.forEach(file => {
        formData.append('proofImages', file);
      });
    }

    const response = await api.post('/delivery/upload-proof', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // Get delivery details
  getDeliveryDetails: async (escrowId) => {
    const response = await api.get(`/delivery/${escrowId}`);
    return response.data;
  },

  // Update tracking
  updateTracking: async (escrowId, trackingData) => {
    const response = await api.put('/delivery/update-tracking', {
      escrowId,
      ...trackingData
    });
    return response.data;
  }
};
