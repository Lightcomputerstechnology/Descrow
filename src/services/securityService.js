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

const securityService = {
  // 2FA Setup
  setup2FA: async () => {
    const response = await axios.post(
      `${API_URL}/security/2fa/setup`,
      {},
      getAuthHeaders()
    );
    return response.data;
  },

  // Verify 2FA
  verify2FA: async (code) => {
    const response = await axios.post(
      `${API_URL}/security/2fa/verify`,
      { code },
      getAuthHeaders()
    );
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (code, password) => {
    const response = await axios.post(
      `${API_URL}/security/2fa/disable`,
      { code, password },
      getAuthHeaders()
    );
    return response.data;
  },

  // Get 2FA status
  get2FAStatus: async () => {
    const response = await axios.get(
      `${API_URL}/security/2fa/status`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Get sessions
  getSessions: async () => {
    const response = await axios.get(
      `${API_URL}/security/sessions`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Revoke session
  revokeSession: async (sessionId) => {
    const response = await axios.delete(
      `${API_URL}/security/sessions/${sessionId}`,
      getAuthHeaders()
    );
    return response.data;
  },

  // Revoke all sessions
  revokeAllSessions: async () => {
    const response = await axios.delete(
      `${API_URL}/security/sessions`,
      getAuthHeaders()
    );
    return response.data;
  }
};

export default securityService;
