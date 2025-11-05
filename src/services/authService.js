// src/services/authService.js
import api from '../config/api';
import { toast } from 'react-hot-toast';

export const authService = {
  /**
   * 📝 Register a new user
   */
  async register(userData) {
    try {
      const res = await api.post('/auth/register', userData);
      toast.success(
        res.data.message ||
          'Registration successful! Please check your email to verify your account.'
      );
      return res.data;
    } catch (err) {
      console.error('Registration error:', err);
      toast.error(err.response?.data?.message || 'Registration failed.');
      throw err.response?.data || { message: 'Registration failed.' };
    }
  },

  /**
   * 🔑 Login user
   */
  async login(credentials) {
    try {
      const res = await api.post('/auth/login', credentials);

      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success(`Welcome back, ${res.data.user?.firstName || 'User'}!`);
      } else {
        toast.error('Your email is not verified yet.');
      }

      return res.data;
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.response?.data?.message || 'Invalid credentials.');
      throw err.response?.data || { message: 'Login failed.' };
    }
  },

  /**
   * 📧 Verify email
   */
  async verifyEmail(token) {
    try {
      const res = await api.post('/auth/verify-email', { token });
      toast.success('✅ Email verified successfully! You can now log in.');
      setTimeout(() => (window.location.href = '/login'), 2000);
      return res.data;
    } catch (err) {
      console.error('Verify email error:', err);
      toast.error(err.response?.data?.message || 'Invalid or expired link.');
      throw err.response?.data || { message: 'Verification failed.' };
    }
  },

  /**
   * 🔁 Resend verification email
   */
  async resendVerification(email) {
    try {
      const res = await api.post('/auth/resend-verification', { email });
      toast.success('📩 A new verification email has been sent.');
      return res.data;
    } catch (err) {
      console.error('Resend verification error:', err);
      toast.error(err.response?.data?.message || 'Failed to resend verification email.');
      throw err.response?.data || { message: 'Resend verification failed.' };
    }
  },

  /**
   * 🔐 Forgot password
   */
  async forgotPassword(email) {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success('📨 Password reset link sent to your email.');
      return res.data;
    } catch (err) {
      console.error('Forgot password error:', err);
      toast.error(err.response?.data?.message || 'Failed to send reset link.');
      throw err.response?.data || { message: 'Forgot password failed.' };
    }
  },

  /**
   * 🔁 Reset password
   */
  async resetPassword(token, password) {
    try {
      const res = await api.post('/auth/reset-password', { token, password });
      toast.success('✅ Password reset successful! You can now log in.');
      setTimeout(() => (window.location.href = '/login'), 2000);
      return res.data;
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error(err.response?.data?.message || 'Failed to reset password.');
      throw err.response?.data || { message: 'Password reset failed.' };
    }
  },

  /**
   * 🚪 Logout
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('You’ve been logged out.');
    window.location.href = '/login';
  },

  /**
   * 👤 Get current logged-in user
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};