import React, { useState } from 'react';
import { Key, Plus, Copy, Eye, EyeOff, Trash2, RefreshCw, TrendingUp } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import CreateAPIKeyModal from '../../components/admin/CreateAPIKeyModal';

const APIManagementPage = ({ admin }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState({});

  // Mock data - Replace with API call
  const [apiKeys, setApiKeys] = useState([
    {
      id: 'api_001',
      businessName: 'TechStore Marketplace',
      businessEmail: 'dev@techstore.com',
      apiKey: 'sk live 4eC39HqLyjWDarjtT1zdp7dc',
      environment: 'production',
      createdAt: '2025-09-15T10:30:00Z',
      lastUsed: '2025-10-27T14:20:00Z',
      requestsToday: 1247,
      requestsThisMonth: 45678,
      transactionsCount: 342,
      status: 'active',
      permissions: ['create_escrow', 'view_transactions', 'webhooks'],
      rateLimit: 1000 // requests per hour
    },
    {
      id: 'api_002',
      businessName: 'Fashion E-commerce',
      businessEmail: 'api@fashion.com',
      apiKey: 'sk live 7pL92MnBxTqWzRkuV3hgf6yp',
      environment: 'production',
      createdAt: '2025-08-20T09:15:00Z',
      lastUsed: '2025-10-27T16:45:00Z',
      requestsToday: 892,
      requestsThisMonth: 32145,
      transactionsCount: 156,
      status: 'active',
      permissions: ['create_escrow', 'view_transactions'],
      rateLimit: 500
    },
    {
      id: 'api_003',
      businessName: 'AutoParts Direct',
      businessEmail: 'tech@autoparts.com',
      apiKey: 'sk test 9xK45NpCvUdXyJmwQ8fhg2la',
      environment: 'test',
      createdAt: '2025-10-20T12:00:00Z',
      lastUsed: '2025-10-26T18:30:00Z',
      requestsToday: 234,
      requestsThisMonth: 5678,
      transactionsCount: 45,
      status: 'active',
      permissions: ['create_escrow', 'view_transactions', 'webhooks'],
      rateLimit: 100
    }
  ]);

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('API Key copied to clipboard!');
  };

  const revokeAPIKey = (keyId) => {
    if (window.confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      setApiKeys(apiKeys.map(key => 
        key.id === keyId ? { ...key, status: 'revoked' } : key
      ));
    }
  };

  const regenerateAPIKey = (keyId) => {
    if (window.confirm('This will generate a new API key. The old key will stop working immediately. Continue?')) {
      // API call to regenerate key
      alert('New API key generated!');
    }
  };

  const maskAPIKey = (key) => {
    return key.substring(0, 12) + '••••••••••••••••••••';
  };

  const totalRequests = apiKeys.reduce((sum, key) => sum + key.requestsToday, 0);
  const totalTransactions = apiKeys.reduce((sum, key) => sum + key.transactionsCount, 0);
  const activeKeys = apiKeys.filter(key => key.status === 'active').length;

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar admin={admin} activePage="api" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader admin={admin} title="API Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Key className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Active API Keys</p>
              <p className="text-2xl font-bold text-gray-900">{activeKeys}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold">+12.5%</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Requests Today</p>
              <p className="text-2xl font-bold text-gray-900">{totalRequests.toLocaleString()}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">API Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{totalTransactions}</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">245ms</p>
            </div>
          </div>

          {/* Create API Key Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
            >
              <Plus className="w-5 h-5" />
              Generate New API Key
            </button>
          </div>

          {/* API Keys List */}
          <div className="space-y-6">
            {apiKeys.map((apiKey) => (
              <div key={apiKey.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{apiKey.businessName}</h3>
                      <p className="text-sm text-gray-600 mt-1">{apiKey.businessEmail}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      {apiKey.status === 'active' ? (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          Revoked
                        </span>
                      )}
                      
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        apiKey.environment === 'production' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {apiKey.environment}
                      </span>
                    </div>
                  </div>

                  {/* API Key */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 mb-1">API Key</p>
                        <p className="text-sm font-mono text-gray-900">
                          {visibleKeys[apiKey.id] ? apiKey.apiKey : maskAPIKey(apiKey.apiKey)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                          title={visibleKeys[apiKey.id] ? 'Hide' : 'Show'}
                        >
                          {visibleKeys[apiKey.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(apiKey.apiKey)}
                          className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                          title="Copy to clipboard"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Requests Today</p>
                      <p className="text-lg font-bold text-gray-900">{apiKey.requestsToday.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Requests This Month</p>
                      <p className="text-lg font-bold text-gray-900">{apiKey.requestsThisMonth.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Transactions</p>
                      <p className="text-lg font-bold text-gray-900">{apiKey.transactionsCount}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Rate Limit</p>
                      <p className="text-lg font-bold text-gray-900">{apiKey.rateLimit}/hr</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-2">Permissions</p>
                      <div className="flex flex-wrap gap-2">
                        {apiKey.permissions.map((perm, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                            {perm.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="text-gray-900">{new Date(apiKey.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Last Used:</span>
                        <span className="text-gray-900">{new Date(apiKey.lastUsed).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {apiKey.status === 'active' && (
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => regenerateAPIKey(apiKey.id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Regenerate Key
                      </button>

                      <button className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-semibold hover:bg-gray-700 transition">
                        Edit Permissions
                      </button>

                      <button className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition">
                        View Logs
                      </button>

                      <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-semibold hover:bg-yellow-700 transition">
                        Update Rate Limit
                      </button>

                      <button
                        onClick={() => revokeAPIKey(apiKey.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Revoke Key
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* API Documentation Link */}
          <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="text-xl font-bold mb-2">API Documentation</h3>
            <p className="mb-4">Complete guide for integrating SecureEscrow into your platform</p>
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition">
              View Documentation
            </button>
          </div>
        </main>
      </div>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <CreateAPIKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreate={(newKey) => {
            setApiKeys([newKey, ...apiKeys]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default APIManagementPage;
