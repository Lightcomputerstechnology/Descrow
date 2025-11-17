import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calculator,
  Save,
  Loader,
  AlertCircle,
  History,
  BarChart3,
  Info,
  RefreshCw,
  Settings,
  Edit2,
  CheckCircle,
  Layers,
  CreditCard
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';

const FeeManagementPage = ({ admin }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feeSettings, setFeeSettings] = useState(null);
  const [selectedTier, setSelectedTier] = useState('starter');
  const [selectedCurrency, setSelectedCurrency] = useState('NGN');
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [feeHistory, setFeeHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchFeeSettings();
    fetchFeeHistory();
  }, []);

  const fetchFeeSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getFeeSettings();
      if (response.success) {
        setFeeSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch fee settings:', error);
      toast.error('Failed to load fee settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeHistory = async () => {
    try {
      const response = await adminService.getFeeHistory();
      if (response.success) {
        setFeeHistory(response.data.history);
      }
    } catch (error) {
      console.error('Failed to fetch fee history:', error);
    }
  };

  const handleStartEdit = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue.toString());
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue('');
  };

  const handleSaveField = async (feeType, field = null) => {
    try {
      setSaving(true);

      const payload = {
        tier: selectedTier,
        feeType,
        value: parseFloat(tempValue)
      };

      if (feeType === 'fees') {
        payload.currency = selectedCurrency;
        payload.field = field; // 'buyer' or 'seller'
      } else if (feeType === 'monthlyCost' || feeType === 'setupFee' || feeType === 'maxTransactionAmount') {
        payload.currency = selectedCurrency;
      }

      const response = await adminService.updateFeeSettings(payload);

      if (response.success) {
        toast.success('Fee updated successfully!');
        setFeeSettings(response.data);
        setEditingField(null);
        setTempValue('');
        fetchFeeHistory();
      }
    } catch (error) {
      console.error('Update fee error:', error);
      toast.error(error.response?.data?.message || 'Failed to update fee');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!window.confirm('Save all changes to this tier?')) return;

    try {
      setSaving(true);
      const updates = {
        fees: feeSettings.tiers[selectedTier].fees,
        monthlyCost: feeSettings.tiers[selectedTier].monthlyCost,
        setupFee: feeSettings.tiers[selectedTier].setupFee,
        maxTransactionAmount: feeSettings.tiers[selectedTier].maxTransactionAmount,
        maxTransactionsPerMonth: feeSettings.tiers[selectedTier].maxTransactionsPerMonth
      };

      const response = await adminService.bulkUpdateTierFees(selectedTier, updates);

      if (response.success) {
        toast.success('Tier fees updated successfully!');
        fetchFeeSettings();
        fetchFeeHistory();
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      toast.error('Failed to update tier fees');
    } finally {
      setSaving(false);
    }
  };

  const handleResetFees = async (tier = 'all') => {
    if (!window.confirm(`Reset ${tier} tier to default values? This cannot be undone.`)) return;

    try {
      setSaving(true);
      const response = await adminService.resetFeesToDefault(tier);

      if (response.success) {
        toast.success('Fees reset to default values');
        fetchFeeSettings();
        fetchFeeHistory();
      }
    } catch (error) {
      console.error('Reset fees error:', error);
      toast.error('Failed to reset fees');
    } finally {
      setSaving(false);
    }
  };

  const calculateProfitPreview = (tier, currency) => {
    if (!feeSettings) return null;

    const tierData = feeSettings.tiers[tier];
    const fees = tierData.fees[currency];
    const gatewayCost = feeSettings.gatewayCosts.flutterwave[currency];

    const testAmount = 10000;
    const buyerFee = testAmount * fees.buyer;
    const sellerFee = testAmount * fees.seller;
    const totalPlatformFee = buyerFee + sellerFee;
    const gatewayIncoming = testAmount * gatewayCost.percentage;
    const platformProfit = totalPlatformFee - gatewayIncoming;

    return {
      testAmount,
      buyerFee,
      sellerFee,
      totalPlatformFee,
      gatewayIncoming,
      platformProfit,
      profitPercentage: (platformProfit / testAmount) * 100
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  const currentTier = feeSettings?.tiers[selectedTier];
  const profitPreview = calculateProfitPreview(selectedTier, selectedCurrency);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Fee Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure tier-based transaction fees and gateway costs
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <History className="w-5 h-5" />
            History
          </button>
          <button
            onClick={() => handleResetFees(selectedTier)}
            className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <RefreshCw className="w-5 h-5" />
            Reset Tier
          </button>
        </div>
      </div>

      {/* Tier Selector */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Select Tier to Edit
          </h2>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {['starter', 'growth', 'enterprise', 'api'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`p-4 rounded-lg border-2 transition ${
                selectedTier === tier
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <p className="font-semibold text-gray-900 dark:text-white capitalize">{tier}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {currentTier && feeSettings.tiers[tier].monthlyCost[selectedCurrency] === 0
                  ? 'Free'
                  : `${selectedCurrency === 'NGN' ? '₦' : '$'}${feeSettings.tiers[tier].monthlyCost[selectedCurrency]}/mo`}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Currency Selector */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Currency</h3>
        <div className="flex gap-3">
          {['NGN', 'USD', 'crypto'].map((currency) => (
            <button
              key={currency}
              onClick={() => setSelectedCurrency(currency)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                selectedCurrency === currency
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {currency === 'NGN' ? '₦ NGN' : currency === 'USD' ? '$ USD' : '₿ Crypto'}
            </button>
          ))}
        </div>
      </div>

      {/* Fee Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Fees */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <DollarSign className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Transaction Fees ({selectedCurrency})
            </h3>
          </div>

          <div className="space-y-4">
            {/* Buyer Fee */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Buyer Fee
                </label>
                {editingField === `buyer-${selectedCurrency}` ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-24 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveField('fees', 'buyer')}
                      disabled={saving}
                      className="p-1 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(`buyer-${selectedCurrency}`, currentTier?.fees[selectedCurrency]?.buyer || 0)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <span className="text-2xl font-bold">
                      {((currentTier?.fees[selectedCurrency]?.buyer || 0) * 100).toFixed(2)}%
                    </span>
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fee charged to buyers on each transaction
              </p>
            </div>

            {/* Seller Fee */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Seller Fee
                </label>
                {editingField === `seller-${selectedCurrency}` ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.001"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-24 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveField('fees', 'seller')}
                      disabled={saving}
                      className="p-1 bg-green-600 hover:bg-green-700 rounded text-white disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(`seller-${selectedCurrency}`, currentTier?.fees[selectedCurrency]?.seller || 0)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <span className="text-2xl font-bold">
                      {((currentTier?.fees[selectedCurrency]?.seller || 0) * 100).toFixed(2)}%
                    </span>
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Fee charged to sellers on each transaction
              </p>
            </div>

            {/* Total Fee Display */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                  Total Platform Fee
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {((currentTier?.fees[selectedCurrency]?.buyer || 0) + (currentTier?.fees[selectedCurrency]?.seller || 0) * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Limits */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tier Limits & Costs
            </h3>
          </div>

          <div className="space-y-4">
            {/* Monthly Cost */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Monthly Cost ({selectedCurrency === 'NGN' ? '₦' : '$'})
                </label>
                {editingField === `monthlyCost-${selectedCurrency}` ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-28 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveField('monthlyCost')}
                      disabled={saving}
                      className="p-1 bg-green-600 hover:bg-green-700 rounded text-white"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(`monthlyCost-${selectedCurrency}`, currentTier?.monthlyCost[selectedCurrency === 'NGN' ? 'NGN' : 'USD'] || 0)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <span className="text-xl font-bold">
                      {(currentTier?.monthlyCost[selectedCurrency === 'NGN' ? 'NGN' : 'USD'] || 0).toLocaleString()}
                    </span>
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Max Transaction Amount */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Max Transaction ({selectedCurrency === 'NGN' ? '₦' : '$'})
                </label>
                {editingField === `maxAmount-${selectedCurrency}` ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-28 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      placeholder="-1 for unlimited"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveField('maxTransactionAmount')}
                      disabled={saving}
                      className="p-1 bg-green-600 hover:bg-green-700 rounded text-white"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(`maxAmount-${selectedCurrency}`, currentTier?.maxTransactionAmount[selectedCurrency === 'NGN' ? 'NGN' : 'USD'] || 0)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <span className="text-xl font-bold">
                      {(currentTier?.maxTransactionAmount[selectedCurrency === 'NGN' ? 'NGN' : 'USD'] || 0) === -1
                        ? 'Unlimited'
                        : (currentTier?.maxTransactionAmount[selectedCurrency === 'NGN' ? 'NGN' : 'USD'] || 0).toLocaleString()}
                    </span>
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Max Transactions Per Month */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Monthly Transaction Limit
                </label>
                {editingField === 'maxTransactions' ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-28 px-3 py-1 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                      placeholder="-1 for unlimited"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveField('maxTransactionsPerMonth')}
                      disabled={saving}
                      className="p-1 bg-green-600 hover:bg-green-700 rounded text-white"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 bg-gray-600 hover:bg-gray-700 rounded text-white"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit('maxTransactions', currentTier?.maxTransactionsPerMonth || 0)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                  >
                    <span className="text-xl font-bold">
                      {(currentTier?.maxTransactionsPerMonth || 0) === -1
                        ? 'Unlimited'
                        : (currentTier?.maxTransactionsPerMonth || 0)}
                    </span>
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profit Preview */}
      {profitPreview && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-6 h-6 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
              Profit Preview (Example: {selectedCurrency === 'NGN' ? '₦' : '$'}{profitPreview.testAmount.toLocaleString()} transaction)
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">Platform Collects</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {profitPreview.totalPlatformFee.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">Gateway Cost</p>
              <p className="text-2xl font-bold text-red-600">
                -{profitPreview.gatewayIncoming.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">Net Profit</p>
              <p className="text-2xl font-bold text-green-600">
                {profitPreview.platformProfit.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">Profit %</p>
              <p className="text-2xl font-bold text-green-600">
                {profitPreview.profitPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fee History Modal */}
      {showHistory && feeHistory.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Fee Change History
              </h3>
              <button
                onClick={() => setShowHistory(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {feeHistory.map((history) => (
                  <div
                    key={history._id}
                    className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        Version {history.version}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(history.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Updated by: {history.lastUpdatedBy?.name || 'System'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagementPage;