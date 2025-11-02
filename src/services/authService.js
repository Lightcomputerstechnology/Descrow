import api from '../config/api';

export const authService = {
  /**
   * 📝 Register new user
   * - Sends registration details to backend
   * - Backend sends verification email automatically
   * - Does NOT store token until user verifies email
   */
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);

      // Inform user that verification is required
      alert(
        response.data.message ||
          'Registration successful! Please check your email to verify your account before logging in.'
      );

      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data || { message: 'Registration failed. Please try again.' };
    }
  },

  /**
   * 🔑 Login user
   * - Requires verified email
   * - Stores token and user info in localStorage
   */
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);

      // Only store token if provided (means user is verified)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data || { message: 'Login failed. Check your credentials.' };
    }
  },

  /**
   * 📧 Verify user email
   * - Called from frontend verification page
   * - Triggers welcome email from backend
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.post('/auth/verify-email', { token });

      alert('✅ Email verified successfully! You can now log in.');
      window.location.href = '/login'; // Redirect after success

      return response.data;
    } catch (error) {
      console.error('Email verification error:', error);
      throw error.response?.data || { message: 'Invalid or expired verification link.' };
    }
  },

  /**
   * 🔁 Resend verification email
   */
  resendVerification: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });

      alert('📩 A new verification email has been sent. Please check your inbox.');
      return response.data;
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error.response?.data || { message: 'Failed to resend verification email.' };
    }
  },

  /**
   * 🚪 Logout
   * - Clears stored data and redirects to login
   */
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  /**
   * 👤 Get current logged-in user
   */
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * 🔐 Forgot password
   * - Sends password reset link to email
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });

      alert('📨 Password reset link has been sent to your email.');
      return response.data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error.response?.data || { message: 'Failed to send password reset link.' };
    }
  },

  /**
   * 🔁 Reset password
   * - Validates token and updates password
   */
  resetPassword: async (token, password) => {
    try {
      const response = await api.post('/auth/reset-password', { token, password });

      alert('✅ Password reset successful! You can now log in with your new password.');
      window.location.href = '/login';

      return response.data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error.response?.data || { message: 'Failed to reset password. Please try again.' };
    }
  },
};
