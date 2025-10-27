import React, { useState } from 'react';
import { CreditCard, RefreshCw, CheckCircle, XCircle, Settings, TrendingUp } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';

const PaymentGatewaysPage = ({ admin }) => {
  // Mock data - Replace with API call
  const [gateways, setGateways] = useState([
    {
      id: 'flutterwave',
      name: 'Flutterwave',
      description: 'African payment gateway - Cards, Bank Transfers, Mobile Money',
      status: 'active',
      testMode: false,
      publicKey: 'FLWPUBK-xxxxxxxxxxxxx',
      secretKey: '•••••••••••••••••',
      supportedMethods: ['Card', 'Bank Transfer', 'Mobile Money'],
      supportedCurrencies: ['USD', 'NGN', 'KES', 'GHS', 'ZAR'],
      transactionsToday: 45,
      revenueToday: 12500,
      fees: {
        local: '1.4%',
        international: '3.8%'
      }
    },
    {
      id: 'paystack',
      name: 'Paystack',
      description: 'Nigerian payment gateway - Cards, Bank Transfers',
      status: 'active',
      testMode: false,
      publicKey: 'pk_live_xxxxxxxxxxxxx',
      secretKey: '•••••••••••••••••',
      supportedMethods: ['Card', 'Bank Transfer'],
      supportedCurrencies: ['USD', 'NGN', 'GHS', 'ZAR'],
      transactionsToday: 32,
      revenueToday: 8900,
      fees: {
        local: '1.5%',
        international: '3.9%'
      }
    },
    {
      id: 'nowpayments',
      name: 'Nowpayments',
      description: 'Cryptocurrency payment gateway - Bitcoin, Ethereum, USDT',
      status: 'active',
      testMode: false,
      apiKey: 'NPM_xxxxxxxxxxxxx',
      secretKey: '•••••••••••••••••',
      supportedMethods: ['Bitcoin', 'Ethereum', 'USDT', 'BNB'],
      supportedCurrencies: ['BTC', 'ETH', 'USDT', 'BNB'],
      transactionsToday: 18,
      revenueToday: 23400,
      fees: {
        processing: '0.5%',
        withdrawal: '0.001 BTC'
      }
    }
  ]);

  const [editingGateway, setEditingGateway] = useState(null);

  const toggleGatewayStatus = (gatewayId) => {
    setGateways(gateways.map(g => 
      g.id === gatewayId 
        ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' }
        : g
    ));
  };

  const toggleTestMode = (gatewayId) => {
    setGateways(gateways.map(g => 
      g.id === gatewayId 
        ? { ...g, testMode: !g.testMode }
        : g
    ));
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar admin={admin} activePage="payments" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader admin={admin} title="Payment Gateways" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold">Active</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Active Gateways</p>
              <p className="text-2xl font-bold text-gray-900">
                {gateways.filter(g => g.status === 'active').length}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Transactions Today</p>
              <p className="text-2xl font-bold text-gray-900">
                {gateways.reduce((sum, g) => sum + g.transactionsToday, 0)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Revenue Today</p>
              <p className="text-2xl font-bold text-gray-900">
                ${gateways.reduce((sum, g) => sum + g.revenueToday, 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Payment Gateways List */}
          <div className="space-y-6">
            {gateways.map((gateway) => (
              <div key={gateway.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${
                        gateway.status === 'active' ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <CreditCard className={`w-8 h-8 ${
                          gateway.status === 'active' ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{gateway.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{gateway.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {gateway.status === 'active' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <XCircle className="w-4 h-4 mr-1" />
                          Inactive
                        </span>
                      )}
                      
                      {gateway.testMode && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                          Test Mode
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Transactions Today</p>
                      <p className="text-lg font-bold text-gray-900">{gateway.transactionsToday}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Revenue Today</p>
                      <p className="text-lg font-bold text-gray-900">${gateway.revenueToday.toLocaleString()}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Payment Methods</p>
                      <p className="text-sm font-semibold text-gray-900">{gateway.supportedMethods.length}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">Currencies</p>
                      <p className="text-sm font-semibold text-gray-900">{gateway.supportedCurrencies.length}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Supported Payment Methods</h4>
                      <div className="flex flex-wrap gap-2">
                        {gateway.supportedMethods.map((method, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-2">Supported Currencies</h4>
                      <div className="flex flex-wrap gap-2">
                        {gateway.supportedCurrencies.map((currency, index) => (
                          <span key={index} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                            {currency}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* API Keys */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">API Configuration</h4>
                    <div className="space-y-2">
                      {gateway.publicKey && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Public Key:</span>
                          <span className="text-xs font-mono text-gray-900">{gateway.publicKey}</span>
                        </div>
                      )}
                      {gateway.apiKey && (
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">API Key:</span>
                          <span className="text-xs font-mono text-gray-900">{gateway.apiKey}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">Secret Key:</span>
                        <span className="text-xs font-mono text-gray-900">{gateway.secretKey}</span>
                      </div>
                    </div>
                  </div>

                  {/* Fees */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Transaction Fees</h4>
                    <div className="flex gap-6">
                      {Object.entries(gateway.fees).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-blue-700 capitalize">{key.replace('_', ' ')}</p>
                          <p className="text-sm font-bold text-blue-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleGatewayStatus(gateway.id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        gateway.status === 'active'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {gateway.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      onClick={() => toggleTestMode(gateway.id)}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition"
                    >
                      {gateway.testMode ? 'Disable Test Mode' : 'Enable Test Mode'}
                    </button>

                    <button
                      onClick={() => setEditingGateway(gateway)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2"
                    >
                      <Settings className="w-4 h-4" />
                      Configure
                    </button>

                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Test Connection
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaymentGatewaysPage;
