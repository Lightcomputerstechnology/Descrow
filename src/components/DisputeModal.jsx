import React, { useState } from 'react';
import { X, AlertTriangle, Upload } from 'lucide-react';

const DisputeModal = ({ escrowId, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    evidence: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      evidence: [...formData.evidence, ...files]
    });
  };

  const removeFile = (index) => {
    const newEvidence = formData.evidence.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      evidence: newEvidence
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const disputeData = {
      escrowId,
      reason: formData.reason,
      description: formData.description,
      evidence: formData.evidence.map(f => f.name),
      timestamp: new Date().toISOString()
    };

    onSubmit(disputeData);
  };

  const disputeReasons = [
    { value: 'not_received', label: 'Item Not Received' },
    { value: 'wrong_item', label: 'Wrong Item Delivered' },
    { value: 'damaged', label: 'Item Damaged/Defective' },
    { value: 'not_as_described', label: 'Item Not As Described' },
    { value: 'counterfeit', label: 'Counterfeit/Fake Item' },
    { value: 'other', label: 'Other Issue' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Open Dispute</h2>
              <p className="text-sm text-gray-600">Escrow ID: {escrowId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Important notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Opening a dispute will pause the transaction.
              Our team will review your case within 24-48 hours and make a fair decision
              based on the evidence provided.
            </p>
          </div>

          {/* Reason for dispute */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Dispute *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a reason...</option>
              {disputeReasons.map((reason) => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Please provide detailed information about the issue. Include dates, specific problems, and any communication with the seller..."
              required
            />
            <p className="text-sm text-gray-500 mt-2">
              Minimum 50 characters. Be as detailed as possible.
            </p>
          </div>

          {/* Evidence upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence (Photos/Videos/Documents) *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <input
                type="file"
                multiple
                accept="image/*,video/*,.pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                id="evidence-upload"
              />
              <label
                htmlFor="evidence-upload"
                className="cursor-pointer text-blue-600 hover:text-blue-700 font-semibold"
              >
                Click to upload evidence
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Photos, videos, PDFs, or documents (Max 10MB each)
              </p>
            </div>

            {formData.evidence.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Uploaded Files ({formData.evidence.length}):
                </p>
                {formData.evidence.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded flex items-center justify-center">
                        {file.type.startsWith('image/') ? '🖼️' :
                         file.type.startsWith('video/') ? '🎥' : '📄'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next steps */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 font-medium mb-2">What happens next?</p>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Your dispute will be reviewed by our team</li>
              <li>We may contact both parties for additional information</li>
              <li>A decision will be made within 24-48 hours</li>
              <li>Funds will be released based on the investigation outcome</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !formData.reason ||
                formData.description.length < 50 ||
                formData.evidence.length === 0
              }
              className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Submit Dispute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DisputeModal;
