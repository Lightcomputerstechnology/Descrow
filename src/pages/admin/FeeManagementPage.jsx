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
