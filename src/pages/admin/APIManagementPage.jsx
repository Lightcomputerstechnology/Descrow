React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Code,
  Key,
  Copy,
  ExternalLink,
  Book,
  AlertCircle
} from 'lucide-react';

const APIManagementPage = ({ admin }) => {
  const navigate = useNavigate();
  const [copiedEndpoint, setCopiedEndpoint] = useState('');

  const apiEndpoints = [
    {
      category: 'Authentication',
      endpoints: [
        { method: 'POST', path: '/api/auth/register', description: 'Register new user' },
        { method: 'POST', path: '/api/auth/login', description: 'User login' },
        { method: 'POST', path: '/api/auth/refresh-token', description: 'Refresh JWT token' }
      ]
    },
    {
      category: 'Escrow',
      endpoints: [
        { method: 'POST', path: '/api/escrow/create', description: 'Create new escrow' },
        { method: 'GET', path: '/api/escrow/:escrowId', description: 'Get escrow details' },
        { method: 'GET', path: '/api/escrow/user/:userId', description: 'Get user escrows' },
        { method: 'POST', path: '/api/escrow/:escrowId/release', description: 'Release payment' }
      ]
    },
    {
      category: 'Payments',
      endpoints: [
        { method: 'POST', path: '/api/payments/initialize', description: 'Initialize payment' },
        { method: 'POST', path: '/api/payments/verify', description: 'Verify payment' },
        { method: 'POST', path: '/api/payments/webhook', description: 'Payment webhook (no auth)' }
      ]
    },
    {
      category: 'Chat',
      endpoints: [
        { method: 'POST', path: '/api/chat/send', description: 'Send chat message' },
        { method: 'GET', path: '/api/chat/:escrowId', description: 'Get chat messages' }
      ]
    },
    {
      category: 'Delivery',
      endpoints: [
        { method: 'POST', path: '/api/delivery/upload-proof', description: 'Upload delivery proof' },
        { method: 'GET', path: '/api/delivery/:escrowId', description: 'Get delivery details' }
      ]
    },
    {
      category: 'Disputes',
      endpoints: [
        { method: 'POST', path: '/api/disputes/create', description: 'Create dispute' },
        { method: 'GET', path: '/api/disputes/:escrowId', description: 'Get dispute details' },
        { method: 'POST', path: '/api/disputes/:disputeId/respond', description: 'Respond to dispute' }
      ]
    }
  ];

  const handleCopyEndpoint = (endpoint) => {
    navigator.clipboard.writeText(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${endpoint}`);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(''), 2000);
  };

  const getMethodColor = (method) => {
    const colors = {
      GET: 'bg-blue-500/20 text-blue-400',
      POST: 'bg-green-500/20 text-green-400',
      PUT: 'bg-yellow-500/20 text-yellow-400',
      DELETE: 'bg-red-500/20 text-red-400'
    };
    return colors[method] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">API Management</h1>
              <p className="text-sm text-gray-400">API documentation and key management</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* API Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Code className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">API Version</p>
                <p className="text-lg font-semibold text-white">v1.0.0</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Key className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Base URL</p>
                <p className="text-sm font-mono text-white break-all">
                  {process.env.REACT_APP_API_URL || 'http://localhost:5000'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Book className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Documentation</p>
                <a
                  href="https://docs.dealcross.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
                >
                  View Docs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Authentication Info */}
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-200 font-semibold mb-1">Authentication Required</p>
            <p className="text-xs text-yellow-300 mb-2">
              Most API endpoints require JWT authentication. Include the token in the Authorization header:
            </p>
            <code className="block bg-gray-900 text-green-400 text-xs p-2 rounded font-mono">
              Authorization: Bearer YOUR_JWT_TOKEN
            </code>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="space-y-6">
          {apiEndpoints.map((category, index) => (
            <div key={index} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-lg font-semibold text-white">{category.category}</h2>
              </div>
              <div className="divide-y divide-gray-700">
                {category.endpoints.map((endpoint, idx) => (
                  <div key={idx} className="p-4 hover:bg-gray-700/50 transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getMethodColor(endpoint.method)}`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm text-gray-300 font-mono">{endpoint.path}</code>
                        </div>
                        <p className="text-sm text-gray-400">{endpoint.description}</p>
                      </div>
                      <button
                        onClick={() => handleCopyEndpoint(endpoint.path)}
                        className="p-2 hover:bg-gray-600 rounded-lg transition flex-shrink-0"
                        title="Copy endpoint"
                      >
                        {copiedEndpoint === endpoint.path ? (
                          <span className="text-green-400 text-xs">Copied!</span>
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Rate Limiting Info */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Rate Limiting</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">General Endpoints</p>
              <p className="text-2xl font-bold text-white">100 requests</p>
              <p className="text-xs text-gray-500">per 15 minutes</p>
            </div>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <p className="text-sm text-gray-400 mb-2">Authentication Endpoints</p>
              <p className="text-2xl font-bold text-white">10 requests</p>
              <p className="text-xs text-gray-500">per 15 minutes</p>
            </div>
          </div>
        </div>

        {/* Example Request */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Example Request</h2>
          <pre className="bg-gray-900 rounded-lg p-4 overflow-x-auto text-sm text-green-400 font-mono border border-gray-700">
{`// Create Escrow Example
const response = await fetch('${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/escrow/create', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    sellerEmail: 'seller@example.com',
    itemName: 'MacBook Pro',
    amount: 2500,
    currency: 'USD',
    paymentMethod: 'paystack'
  })
});

const data = await response.json();
console.log(data);`}
          </pre>
        </div>
      </main>
    </div>
  );
};

export default APIManagementPage;