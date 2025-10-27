import React, { useState } from 'react';
import { X, Key, Copy } from 'lucide-react';

const CreateAPIKeyModal = ({ onClose, onCreate }) => {
  const [step, setStep] = useState(1); // 1: Form, 2: Generated Key
  const [formData, setFormData] = useState({
    businessName: '',
    businessEmail: '',
    environment: 'production',
    rateLimit: 1000,
    permissions: []
  });
  const [generatedKey, setGeneratedKey] = useState(null);

  const availablePermissions = [
    { id: 'create_escrow', label: 'Create Escrow', description: 'Allow creating new escrow transactions' },
    { id: 'view_transactions', label: 'View Transactions', description: 'View transaction details and history' },
    { id: 'release_payment', label: 'Release Payment', description: 'Trigger payment release (admin only)' },
    { id: 'webhooks', label: 'Webhooks', description: 'Receive webhook notifications' },
    { id: 'refunds', label: 'Process Refunds', description: 'Initiate refund requests' }
  ];

  const handlePermissionToggle = (permId) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  const handleGenerate = () => {
    // Generate API key - Replace with actual API call
    const newKey = {
      id: 'api_' + Math.floor(Math.random() * 10000),
      businessName: formData.businessName,
      businessEmail: formData.businessEmail,
      apiKey: `sk_${formData.environment === 'production' ? 'live' : 'test'}_${generateRandomString(32)}`,
      environment: formData.environment,
      createdAt: new Date().toISOString(),
      lastUsed: null,
      requestsToday: 0,
      requestsThisMonth: 0,
      transactionsCount: 0,
      status: 'active',
      permissions: formData.permissions,
      rateLimit: formData.rateLimit
    };

    setGeneratedKey(newKey);
    setStep(2);
  };

  const generateRandomString = (length) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('API Key copied to clipboard!');
  };

  const handleComplete = () => {
    onCreate(generatedKey);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Generate API Key</h2>
              <p className="text-sm text-gray-600">Step {step} of 2</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Business Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Your Business Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Email *
                </label>
                <input
                  type="email"
                  value={formData.businessEmail}
                  onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="developer@yourbusiness.com"
                  required
                />
              </div>

              {/* Environment */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Environment *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    formData.environment === 'test' ? 'border-yellow-500 bg-yellow-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      value="test"
                      checked={formData.environment === 'test'}
                      onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Test</p>
                      <p className="text-xs text-gray-600 mt-1">For development and testing</p>
                    </div>
                  </label>

                  <label className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    formData.environment === 'production' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      value="production"
                      checked={formData.environment === 'production'}
                      onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">Production</p>
                      <p className="text-xs text-gray-600 mt-1">For live transactions</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Rate Limit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate Limit (requests per hour) *
                </label>
                <select
                  value={formData.rateLimit}
                  onChange={(e) => setFormData({ ...formData, rateLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="100">100 requests/hour (Basic)</option>
                  <option value="500">500 requests/hour (Standard)</option>
                  <option value="1000">1,000 requests/hour (Pro)</option>
                  <option value="5000">5,000 requests/hour (Enterprise)</option>
                </select>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  API Permissions *
                </label>
                <div className="space-y-3">
                  {availablePermissions.map((perm) => (
                    <label key={perm.id} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm.id)}
                        onChange={() => handlePermissionToggle(perm.id)}
                        className="mt-1 w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{perm.label}</p>
                        <p className="text-xs text-gray-600">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  disabled={!formData.businessName || !formData.businessEmail || formData.permissions.length === 0}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Generate API Key
                </button>
              </div>
            </div>
          )}

          {step === 2 && generatedKey && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✓ API Key Generated Successfully!</p>
              </div>

              {/* Generated Key */}
              <div className="bg-gray-900 rounded-lg p-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-400">Your API Key</p>
                  <button
                    onClick={() => copyToClipboard(generatedKey.apiKey)}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-800 text-white rounded text-sm hover:bg-gray-700 transition"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <p className="text-white font-mono text-sm break-all">{generatedKey.apiKey}</p>
              </div>

              {/* Warning */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold mb-2">⚠️ Important Security Notice</p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>This key will only be shown once. Save it securely.</li>
                  <li>Never share your API key or commit it to version control.</li>
                  <li>Store it in environment variables or a secure vault.</li>
                  <li>If compromised, regenerate the key immediately.</li>
                </ul>
              </div>

              {/* Key Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">API Key Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business:</span>
                    <span className="font-medium text-gray-900">{generatedKey.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{generatedKey.businessEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Environment:</span>
                    <span className="font-medium text-gray-900 capitalize">{generatedKey.environment}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rate Limit:</span>
                    <span className="font-medium text-gray-900">{generatedKey.rateLimit} req/hr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Permissions:</span>
                    <span className="font-medium text-gray-900">{generatedKey.permissions.length}</span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Copy and securely store your API key</li>
                  <li>Review the API documentation</li>
                  <li>Test your integration in {generatedKey.environment} environment</li>
                  <li>Monitor usage in the admin dashboard</li>
                </ol>
              </div>

              {/* Action */}
              <button
                onClick={handleComplete}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateAPIKeyModal;
