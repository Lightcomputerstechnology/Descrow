// src/services/chatService.js
// Handles chat and messaging logic for users

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance with auth token
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

const chatService = {
  /**
   * Send a message in a specific escrow chat
   * Supports attachments
   * @param {String} escrowId
   * @param {Object} data - { message: String, attachments: File[] }
   */
  async sendMessage(escrowId, data) {
    try {
      const formData = new FormData();
      formData.append('message', data.message);

      if (data.attachments && data.attachments.length > 0) {
        data.attachments.forEach((file, index) => {
          formData.append('attachments', file);
        });
      }

      const response = await api.post(
        `/chat/${escrowId}/messages`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to send message' };
    }
  },

  /**
   * Fetch messages for a specific escrow
   * @param {String} escrowId
   * @param {Object} params - { page, limit }
   */
  async getMessages(escrowId, params = {}) {
    try {
      const response = await api.get(`/chat/${escrowId}/messages`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to fetch messages' };
    }
  },

  /**
   * Get unread message count for the current user
   */
  async getUnreadCount() {
    try {
      const response = await api.get('/chat/unread-count');
      return response.data;
    } catch (error) {
      console.error('Error fetching unread count:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to fetch unread count' };
    }
  },
};

export { chatService };