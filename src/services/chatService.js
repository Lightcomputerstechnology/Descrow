import api from '../config/api';

export const chatService = {
  // Send message
  sendMessage: async (escrowId, message, attachments) => {
    const formData = new FormData();
    formData.append('escrowId', escrowId);
    formData.append('message', message);
    
    if (attachments && attachments.length > 0) {
      attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    const response = await api.post('/chat/send', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data;
  },

  // Get chat messages
  getChatMessages: async (escrowId) => {
    const response = await api.get(`/chat/${escrowId}`);
    return response.data;
  },

  // Mark as read
  markAsRead: async (escrowId) => {
    const response = await api.put(`/chat/${escrowId}/read`);
    return response.data;
  }
};