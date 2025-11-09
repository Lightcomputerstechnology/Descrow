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
  Info
} from 'lucide-react';
import platformService from '../../services/platformService';
import toast from 'react-hot-toast';

const FeeManagementPage = ({ admin }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentSettings, setCurrentSettings] = useState(null);
  const [formData, setFormData] = useState({
    percentage: 2.5,
    buyerShare: 50,
    sellerShare: 50,
    minimumFee: 0.50,
    maximumPercentage: 2.5
  });
  const [testAmount, setTestAmount] = useState('100');
  const [testResult, setTestResult] = useState(null);
  const [impactPreview, setImpactPreview] = useState(null);
  const [feeHistory, setFeeHistory] = useState(null);

  useEffect(() => {
    fetchCurrentSettings();
    fetchFeeHistory();
  }, []);

  useEffect(() => {
    if (testAmount && parseFloat(testAmount) > 0) {
      calculateTestFee();
    }
  }, [testAmount, formData]);

  const fetchCurrentSettings = async () => {
    try {
      setLoading(true);
      const response = await platformService.getSettings();
      
      if (response.success) {
        const fees = response.data.fees;
        setCurrentSettings(fees);
        setFormData({
          percentage: fees.percentage,
          buyerShare: fees.buyerShare,
          sellerShare: fees.sellerShare,
          minimumFee: fees.minimumFee,
          maximumPercentage: fees.maximumPercentage
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load fee settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeHistory = async () => {
    try {
      const response = await platformService.getFeeHistory();
      if (response.success) {
        setFeeHistory(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch fee history:', error);
    }
  };

  const calculateTestFee = async () => {
    try {
      const response = await platformService.calculateFee(testAmount);
      if (response.success) {
        setTestResult(response.data);
      }
    } catch (error) {
      console.error('Calculate fee error:', error);
    }
  };

  const handlePreview = async () => {
    try {
      const response = await platformService.previewFeeImpact(formData);
      if (response.success) {
        setImpactPreview(response.data);
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast.error('Failed to generate preview');
    }
  };

  const handleSave = async () => {
    // Validation
    if (formData.percentage < 0 || formData.percentage > 100) {
      toast.error('Fee percentage must be between 0 and 100');
      return;
    }

    if (formData.buyerShare + formData.sellerShare !== 100) {
      toast.error('Buyer and seller share must total 100%');
      return;
    }

    if (!window.confirm('Are you sure you want to update fee settings? This will affect all new transactions.')) {
      return;
    }

    try {
      setSaving(true);
      const response = await platformService.updateFeeSettings(formData);

      if (response.success) {
        toast.success('Fee settings updated successfully!');
        setCurrentSettings(response.data.fees);
        fetchFeeHistory();
      }
    } catch (error) {
      console.error('Update fee settings error:', error);
      toast.error(error.response?.data?.message || 'Failed to update fee settings');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = currentSettings && (
    formData.percentage !== currentSettings.percentage ||
    formData.buyerShare !== currentSettings.buyerShare ||
    formData.sellerShare !== currentSettings.sellerShare ||
    formData.minimumFee !== currentSettings.minimumFee ||
    formData.maximumPercentage !== currentSettings.maximumPercentage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Fee Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configure platform transaction fees and preview revenue impact
        </p>
      </div>

      {/* Current Settings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Fee</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formData.percentage}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Buyer Share</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formData.buyerShare}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Seller Share</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formData.sellerShare}%
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="w-5 h-5 text-orange-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Min Fee</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${formData.minimumFee}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fee Configuration */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Fee Configuration
          </h3>

          <div className="space-y-4">
            {/* Total Fee Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Total Fee Percentage
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                  className="flex-1"
                />
                <input
                  type="number"
                  value={formData.percentage}
                  onChange={(e) => setFormData({ ...formData, percentage: parseFloat(e.target.value) })}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-center"
                />
                <span className="text-gray-600 dark:text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended: 2-4% for competitive pricing
              </p>
            </div>

            {/* Fee Split */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fee Split (Must total 100%)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Buyer Share</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={formData.buyerShare}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          buyerShare: value,
                          sellerShare: 100 - value
                        });
                      }}
                      min="0"
                      max="100"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                    <span className="text-gray-600 dark:text-gray-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400">Seller Share</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="number"
                      value={formData.sellerShare}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        setFormData({
                          ...formData,
                          sellerShare: value,
                          buyerShare: 100 - value
                        });
                      }}
                      min="0"
                      max="100"
                      className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                    />
                    <span className="text-gray-600 dark:text-gray-400">%</span>
                  </div>
                </div>
              </div>
              {formData.buyerShare + formData.sellerShare !== 100 && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  ⚠️ Shares must total 100%
                </p>
              )}
            </div>

            {/* Minimum Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Fee (USD)
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={formData.minimumFee}
                  onChange={(e) => setFormData({ ...formData, minimumFee: parseFloat(e.target.value) })}
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimum fee charged per transaction
              </p>
            </div>

            {/* Maximum Cap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Fee Cap (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={formData.maximumPercentage}
                  onChange={(e) => setFormData({ ...formData, maximumPercentage: parseFloat(e.target.value) })}
                  step="0.1"
                  min="0"
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg"
                />
                <span className="text-gray-600 dark:text-gray-400">%</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Maximum percentage fee (0 for no cap)
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={handlePreview}
              className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
            >
              <BarChart3 className="w​​​​​​​​​​​​​​​​
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Preview Impact
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges || formData.buyerShare + formData.sellerShare !== 100}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {hasChanges && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                You have unsaved changes
              </p>
            </div>
          )}
        </div>

        {/* Fee Calculator */}
        <div className="space-y-6">
          {/* Live Calculator */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Calculator className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Fee Calculator
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Test fee calculation in real-time
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Transaction Amount
              </label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400">$</span>
                <input
                  type="number"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="100"
                  className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 outline-none transition text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {testResult && (
              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Transaction Amount:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${testResult.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Buyer Fee ({testResult.buyerShare}%):
                    </span>
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      ${testResult.buyerFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Seller Fee ({testResult.sellerShare}%):
                    </span>
                    <span className="font-medium text-purple-600 dark:text-purple-400">
                      ${testResult.sellerFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">Buyer Pays:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        ${testResult.buyerPays.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">Seller Receives:</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        ${testResult.sellerReceives.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">Platform Earns:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        ${testResult.platformEarns.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-900 dark:text-blue-200">
                    <Info className="w-4 h-4 inline mr-1" />
                    Total platform fee: {testResult.feePercentage}% split {testResult.buyerShare}/{testResult.sellerShare}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Revenue Impact Preview */}
          {impactPreview && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Revenue Impact
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {impactPreview.timeframe}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Transactions:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {impactPreview.transactionCount}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current Revenue:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${impactPreview.currentRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Projected Revenue:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${impactPreview.projectedRevenue.toLocaleString()}
                  </span>
                </div>

                <div className={`flex justify-between items-center p-3 rounded-lg ${
                  impactPreview.difference >= 0
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <span className="text-sm font-medium">Difference:</span>
                  <div className="text-right">
                    <span className={`font-bold ${
                      impactPreview.difference >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {impactPreview.difference >= 0 ? '+' : ''}${impactPreview.difference.toLocaleString()}
                    </span>
                    <span className={`block text-xs ${
                      impactPreview.difference >= 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {impactPreview.percentageChange >= 0 ? '+' : ''}{impactPreview.percentageChange}%
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    <strong>Average Fee per Transaction:</strong>
                  </p>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">Current:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${impactPreview.avgCurrentFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Projected:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${impactPreview.avgProjectedFee.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-sm text-blue-900 dark:text-blue-200">
                    {impactPreview.suggestion}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fee History */}
      {feeHistory && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <History className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Last Update
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Fee change history and audit log
              </p>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Last Updated:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {new Date(feeHistory.lastUpdated).toLocaleString()}
              </span>
            </div>
            {feeHistory.updatedBy && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Updated By:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {feeHistory.updatedBy.name} ({feeHistory.updatedBy.email})
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Current Settings:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Fee:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {feeHistory.current.percentage}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Min:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${feeHistory.current.minimumFee}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Buyer:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {feeHistory.current.buyerShare}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Seller:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {feeHistory.current.sellerShare}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <div className="flex gap-4">
          <Info className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
          <div className="text-sm text-blue-900 dark:text-blue-200">
            <p className="font-semibold mb-2">Fee Management Best Practices:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Industry standard fees range from 1-4% of transaction value</li>
              <li>Consider a 50/50 split between buyer and seller for fairness</li>
              <li>Set a minimum fee to cover small transactions ($0.50 - $1.00)</li>
              <li>Preview impact before making changes to avoid revenue surprises</li>
              <li>Monitor transaction volume after fee changes</li>
              <li>Changes only affect new transactions, existing ones keep old rates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeManagementPage;
