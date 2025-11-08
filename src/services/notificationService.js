import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

const notificationService = {
  // Get notifications
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const response = await axios.get(
      `${API_URL}/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Mark as read
  markAsRead: async (id) => {
    const response = await axios.put(
      `${API_URL}/notifications/${id}/read`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Mark all as read
  markAllAsRead: async () => {
    const response = await axios.put(
      `${API_URL}/notifications/read-all`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await axios.delete(
      `${API_URL}/notifications/${id}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Clear all read
  clearAllRead: async () => {
    const response = await axios.delete(
      `${API_URL}/notifications/read/clear`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Get settings
  getSettings: async () => {
    const response = await axios.get(
      `${API_URL}/notifications/settings`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Update settings
  updateSettings: async (settings) => {
    const response = await axios.put(
      `${API_URL}/notifications/settings`,
      settings,
      getAuthHeaders()
    );
    return response.data;
  }
};

export default notificationService;
