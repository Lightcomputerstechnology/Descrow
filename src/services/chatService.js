// src/services/chatService.js
// Handles chat and messaging logic for users and admins

import axios from 'axios';

// Use environment variable or fallback
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance for authenticated requests
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token automatically if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================
// 🔹 Chat Service Methods
// ============================

const chatService = {
  /**
   * Send a message between buyer, seller, or admin.
   * @param {Object} data - { senderId, receiverId, message, dealId }
   */
  async sendMessage(data) {
    try {
      const response = await api.post('/chat/send', data);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to send message' };
    }
  },

  /**
   * Get chat messages between two users (by deal or user ID).
   * @param {String} dealId - The deal identifier or chat room ID
   */
  async getMessages(dealId) {
    try {
      const response = await api.get(`/chat/messages/${dealId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to fetch messages' };
    }
  },

  /**
   * Get all chat threads for a user (e.g., list of all deal chats).
   */
  async getUserChats() {
    try {
      const response = await api.get('/chat/threads');
      return response.data;
    } catch (error) {
      console.error('Error fetching chat threads:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to fetch chat threads' };
    }
  },

  /**
   * Mark all messages in a conversation as read.
   * @param {String} dealId
   */
  async markAsRead(dealId) {
    try {
      const response = await api.patch(`/chat/read/${dealId}`);
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to mark as read' };
    }
  },

  /**
   * Delete a chat thread (admin or user).
   * @param {String} threadId
   */
  async deleteThread(threadId) {
    try {
      const response = await api.delete(`/chat/thread/${threadId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting chat thread:', error.response?.data || error.message);
      throw error.response?.data || { message: 'Failed to delete thread' };
    }
  },
};

export { chatService };