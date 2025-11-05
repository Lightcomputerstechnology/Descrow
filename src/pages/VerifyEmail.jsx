import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Shield, CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import { authService } from '../services/authService';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await authService.verifyEmail(token);
      setStatus('success');
      setMessage(response.message || 'Email verified successfully!');
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.message || 'Email verification failed. The link may be invalid or expired.');
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();
    if (!resendEmail) {
      alert('Please enter your email address');
      return;
    }

    try {
      setResending(true);
      await authService.resendVerification(resendEmail);
      alert('Verification email sent! Please check your inbox.');
      setResendEmail('');
    } catch (error) {
      alert(error.message || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-12 h-12 text-blue-400" />
            <span className="text-3xl font-bold text-white">Dealcross</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Email Verification</h1>
        </div>

        {/* Verification Status */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
          {status === 'verifying' && (
            <div className="text-center">
              <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Redirecting to login page in 3 seconds...
              </p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Go to Login
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>

              {/* Resend Verification */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Request New Verification Link
                </h3>
                <form onSubmit={handleResendVerification} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={resending}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {resending ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Resend Verification Email'
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-blue-200 hover:text-white transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;