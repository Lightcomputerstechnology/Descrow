// File: src/pages/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams(); // ✅ CHANGED: Use searchParams instead of useParams
  const token = searchParams.get('token'); // ✅ CHANGED: Get token from query string
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, success, error
  const [message, setMessage] = useState('');

  // ✅ NEW: Check if token exists on mount
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing reset token. Please request a new password reset link.');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ NEW: Check token before submitting
    if (!token) {
      setMessage('Invalid reset link. Please request a new password reset.');
      setStatus('error');
      return;
    }

    if (!password || !confirmPassword) {
      setMessage('Please fill in all fields');
      setStatus('error');
      return;
    }

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long');
      setStatus('error');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      console.log('🔐 Resetting password with token:', token); // Debug log
      const response = await authService.resetPassword(token, password);
      setStatus('success');
      setMessage(response.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('❌ Reset password error:', error); // Debug log
      setStatus('error');
      setMessage(error.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lock className="w-12 h-12 text-blue-400" />
            <span className="text-3xl font-bold text-white">Dealcross</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-blue-200 text-sm">Enter your new password below</p>
        </div>

        {/* Form / Status */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          {status === 'success' ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Success!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{message}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Redirecting to login page...
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Go to Login Now
              </Link>
            </div>
          ) : (
            <>
              {/* ✅ NEW: Show error if no token */}
              {!token && (
                <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-800 dark:text-red-200 font-semibold mb-2">
                        Invalid Reset Link
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                        This password reset link is invalid or has expired.
                      </p>
                      <Link
                        to="/forgot-password"
                        className="inline-block text-sm text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline font-medium"
                      >
                        Request a new password reset link
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {status === 'error' && message && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <XCircle className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm">{message}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="Enter new password"
                      required
                      minLength={8}
                      disabled={!token}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="Confirm new password"
                      required
                      minLength={8}
                      disabled={!token}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Back to Login */}
        <div className="text-center mt-6">
          <Link to="/login" className="text-sm text-blue-200 hover:text-white transition">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
