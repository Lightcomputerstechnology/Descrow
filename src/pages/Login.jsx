import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Shield, Eye, EyeOff } from 'lucide-react';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    
    // Mock login - Replace with actual API call
    const mockUser = {
      id: '12345',
      name: email.split('@')[0],
      email: email,
      role: 'dual', // User can be both buyer AND seller
      tier: 'free'
    };
    
    setUser(mockUser);
    navigate('/dashboard'); // Go to unified dashboard
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white text-center">
          <div 
            className="flex items-center justify-center gap-2 mb-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <Shield className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Dealcross</h1>
          </div>
          <p className="text-blue-100">Secure escrow payments worldwide</p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Welcome Back</h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">Login to your account</p>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input type="checkbox" className="mr-2 w-4 h-4 text-blue-600 rounded" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:underline font-semibold"
            >
              Sign up
            </button>
          </p>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 transition"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
