import React, { useState } from 'react';
import { X, AlertCircle, Loader, Upload } from 'lucide-react';
import escrowService from 'services/escrowService';
import toast from 'react-hot-toast';

const DisputeModal = ({ escrow, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    evidenceUrls: [],
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reason.trim()) {
      setErrors({ reason: 'Please provide a reason for the dispute' });
      return;
    }

    try {
      setLoading(true);

      const response = await escrowService.raiseDispute(escrow._id, formData);

      if (response.success) {
        toast.success(
          'Dispute raised successfully. Admin will review within 24-48 hours.'
        );
        onSuccess && onSuccess();
      } else {
        toast.error(response.message || 'Failed to raise dispute');
      }
    } catch (error) {
      console.error('Dispute error:', error);
      toast.error(error.response?.data?.message || 'Failed to raise dispute');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Raise Dispute
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Report an issue with this transaction
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Warning */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-900 dark:text-yellow-200">
                <p className="font-medium mb-1">Before raising a dispute:</p>
                <ul className="list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-300">
                  <li>Try to communicate with the other party first</li>
                  <li>Provide clear evidence to support your claim</li>
                  <li>Admin decision is final and binding</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason for Dispute *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => {
                setFormData({ ...formData, reason: e.target.value });
                setErrors({ ...errors, reason: '' });
              }}
              placeholder="Describe the issue in detail..."
              rows={6}
              className={`w-full px-4 py-2.5 bg-white dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 outline-none transition text-gray-900 dark:text-white resize-none ${
                errors.reason
                  ? 'border-red-500'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.reason}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              Be specific: What went wrong? What was expected vs what happened?
            </p>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Supporting Evidence
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center hover:border-red-400 dark:hover:border-red-600 transition">
              <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Upload screenshots or documents
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG or PDF up to 10MB
              </p>
              <button
                type="button"
                className="mt-3 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Choose Files
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              Recommended: Chat logs, photos of item condition, tracking info,
              etc.
            </p>
          </div>

          {/* Info */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-900 dark:text-red-200">
                <p className="font-medium mb-1">What happens next?</p>
                <ol className="list-decimal list-inside space-y-1 text-red-800 dark:text-red-300">
                  <li>Transaction will be frozen</li>
                  <li>Admin will review all evidence</li>
                  <li>Both parties may be contacted for more info</li>
                  <li>Admin will make a final decision within 48 hours</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Raise Dispute
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeModal;