import api from '../config/api';

export const paymentService = {
  // Initialize payment
  initializePayment: async (escrowId, paymentMethod, cryptocurrency) => {
    const response = await api.post('/payments/initialize', {
      escrowId,
      paymentMethod,
      cryptocurrency
    });
    return response.data;
  },

  // Verify payment
  verifyPayment: async (reference, paymentMethod, transactionId, paymentId) => {
    const response = await api.post('/payments/verify', {
      reference,
      paymentMethod,
      transactionId,
      paymentId
    });
    return response.data;
  },

  // Upload crypto proof (if needed)
  uploadCryptoProof: async (escrowId, transactionHash, proofImageUrl) => {
    const response = await api.post('/payments/crypto/upload-proof', {
      escrowId,
      transactionHash,
      proofImageUrl
    });
    return response.data;
  }
};
