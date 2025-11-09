import React, { useState, useEffect } from ‘react’;
import { ArrowLeft, CreditCard, DollarSign, Bitcoin, CheckCircle, Loader, AlertCircle, TrendingUp, Activity } from ‘lucide-react’;

const PaymentGatewaysPage = () => {
const [loading, setLoading] = useState(true);
const [stats, setStats] = useState({
paystackTransactions: 0,
flutterwaveTransactions: 0,
cryptoTransactions: 0,
totalVolume: 0
});

useEffect(() => {
fetchPaymentStats();
}, []);

const fetchPaymentStats = async () => {
try {
setLoading(true);
// Simulate API call - replace with actual API
setTimeout(() => {
setStats({
paystackTransactions: 145,
flutterwaveTransactions: 89,
cryptoTransactions: 34,
totalVolume: 125480
});
setLoading(false);
}, 1000);
} catch (error) {
console.error(‘Failed to fetch stats:’, error);
setLoading(false);
}
};

const paymentMethods = [
{
id: ‘paystack’,
icon: CreditCard,
name: ‘Paystack’,
status: ‘Active’,
color: ‘blue’,
features: [‘Card Payments’, ‘Bank Transfer’, ‘USSD’, ‘Mobile Money’],
transactions: stats.paystackTransactions,
automated: true
},
{
id: ‘flutterwave’,
icon: DollarSign,
name: ‘Flutterwave’,
status: ‘Active’,
color: ‘purple’,
features: [‘Multi-currency’, ‘Mobile Money’, ‘M-Pesa’, ‘Bank Transfer’],
transactions: stats.flutterwaveTransactions,
automated: true
},
{
id: ‘nowpayments’,
icon: Bitcoin,
name: ‘Nowpayments’,
status: ‘Active’,
color: ‘yellow’,
features: [‘Bitcoin (BTC)’, ‘Ethereum (ETH)’, ‘USDT’, ‘100+ Cryptocurrencies’],
transactions: stats.cryptoTransactions,
automated: true
}
];

return (
<div className="min-h-screen bg-gray-900">
{/* Header */}
<header className="bg-gray-800 border-b border-gray-700">
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
<div className="flex items-center gap-4">
<button
onClick={() => window.history.back()}
className=“p-2 hover:bg-gray-700 rounded-lg transition”
>
<ArrowLeft className="w-5 h-5 text-gray-400" />
</button>
<div>
<h1 className="text-2xl font-bold text-white">Payment Gateway Management</h1>
<p className="text-sm text-gray-400">All payment methods are fully automated</p>
</div>
</div>
</div>
</header>

```
  <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Stats Overview */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">Total Volume</p>
          <TrendingUp className="w-5 h-5 text-green-400" />
        </div>
        <p className="text-3xl font-bold text-white">
          ${loading ? '...' : stats.totalVolume.toLocaleString()}
        </p>
        <p className="text-xs text-gray-500 mt-1">This month</p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">Paystack</p>
          <Activity className="w-5 h-5 text-blue-400" />
        </div>
        <p className="text-3xl font-bold text-white">
          {loading ? '...' : stats.paystackTransactions}
        </p>
        <p className="text-xs text-gray-500 mt-1">Transactions</p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">Flutterwave</p>
          <Activity className="w-5 h-5 text-purple-400" />
        </div>
        <p className="text-3xl font-bold text-white">
          {loading ? '...' : stats.flutterwaveTransactions}
        </p>
        <p className="text-xs text-gray-500 mt-1">Transactions</p>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-gray-400">Crypto</p>
          <Activity className="w-5 h-5 text-yellow-400" />
        </div>
        <p className="text-3xl font-bold text-white">
          {loading ? '...' : stats.cryptoTransactions}
        </p>
        <p className="text-xs text-gray-500 mt-1">Transactions</p>
      </div>
    </div>

    {/* Automation Notice */}
    <div className="mb-8 bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm text-green-200 font-semibold mb-1">✅ All Payments Fully Automated</p>
        <p className="text-xs text-green-300">
          Paystack, Flutterwave, and Nowpayments are configured with webhooks for instant automatic confirmation. 
          No manual verification needed!
        </p>
      </div>
    </div>

    {/* Payment Methods */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {paymentMethods.map((method) => {
        const Icon = method.icon;
        const colorClasses = {
          blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
        };

        return (
          <div key={method.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[method.color]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400">{method.name}</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-white">{method.status}</p>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              {method.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                  {feature}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Transactions</span>
                <span className="text-lg font-bold text-white">{method.transactions}</span>
              </div>
              {method.automated && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">Auto-verified</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>

    {/* Configuration Info */}
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Webhook Configuration</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-sm font-semibold text-blue-400 mb-2">Paystack Webhook URL</p>
          <code className="text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded block">
            {process.env.REACT_APP_API_URL || 'https://your-backend.com'}/api/payments/webhook/paystack
          </code>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-sm font-semibold text-purple-400 mb-2">Flutterwave Webhook URL</p>
          <code className="text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded block">
            {process.env.REACT_APP_API_URL || 'https://your-backend.com'}/api/payments/webhook/flutterwave
          </code>
        </div>

        <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
          <p className="text-sm font-semibold text-yellow-400 mb-2">Nowpayments IPN URL</p>
          <code className="text-xs text-gray-300 bg-gray-800 px-3 py-2 rounded block">
            {process.env.REACT_APP_API_URL || 'https://your-backend.com'}/api/payments/webhook/nowpayments
          </code>
        </div>
      </div>

      <div className="mt-6 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-yellow-200 font-semibold mb-1">Environment Variables Required</p>
          <p className="text-xs text-yellow-300 mb-2">
            Ensure these are set in your .env file:
          </p>
          <ul className="text-xs text-yellow-300 space-y-1 font-mono">
            <li>• PAYSTACK_SECRET_KEY</li>
            <li>• FLUTTERWAVE_SECRET_KEY</li>
            <li>• FLUTTERWAVE_WEBHOOK_SECRET</li>
            <li>• NOWPAYMENTS_API_KEY</li>
            <li>• NOWPAYMENTS_IPN_SECRET</li>
          </ul>
        </div>
      </div>
    </div>
  </main>
</div>
```

);
};

export default PaymentGatewaysPage;