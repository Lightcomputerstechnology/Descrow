import React, { useState } from 'react';
import { X, AlertTriangle, User, Package, DollarSign, Calendar, FileText, Image as ImageIcon } from 'lucide-react';

const DisputeDetailsModal = ({ dispute, onClose, onResolve }) => {
  const [resolution, setResolution] = useState('');
  const [notes, setNotes] = useState('');
  const [refundAmount, setRefundAmount] = useState(dispute.amount);

  const handleResolve = () => {
    if (!resolution) {
      alert('Please select a resolution');
      return;
    }

    const resolutionData = {
      disputeId: dispute.id,
      resolution: resolution,
      notes: notes,
      refundAmount: resolution === 'partial_refund' ? refundAmount : null
    };

    onResolve(resolutionData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Dispute Details</h2>
              <p className="text-sm text-gray-600">{dispute.id} • {dispute.escrowId}</p>
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
          {/* Parties Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900">Buyer (Complainant)</h3>
              </div>
              <p className="text-sm text-gray-900 font-medium">{dispute.buyer.name}</p>
              <p className="text-sm text-gray-600">{dispute.buyer.email}</p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Seller (Respondent)</h3>
              </div>
              <p className="text-sm text-gray-900 font-medium">{dispute.seller.name}</p>
              <p className="text-sm text-gray-600">{dispute.seller.email}</p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Transaction Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Item</p>
                  <p className="text-sm font-medium text-gray-900">{dispute.itemName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-sm font-medium text-gray-900">${dispute.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500">Filed On</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(dispute.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Dispute Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Dispute Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <p className="text-sm text-gray-900 capitalize bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                  {dispute.reason.replace('_', ' ')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 whitespace-pre-wrap">
                  {dispute.description}
                </p>
              </div>
            </div>
          </div>

          {/* Evidence */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Evidence Submitted</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dispute.evidence.map((file, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-3 hover:border-blue-500 cursor-pointer transition">
                  <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-600 truncate">{file}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Section */}
          {dispute.status !== 'resolved' && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Resolution</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Resolution *
                  </label>
                  <select
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    <option value="">Choose resolution...</option>
                    <option value="refund_to_buyer">Full Refund to Buyer</option>
                    <option value="release_to_seller">Release Payment to Seller</option>
                    <option value="partial_refund">Partial Refund</option>
                    <option value="reject_dispute">Reject Dispute</option>
                  </select>
                </div>

                {resolution === 'partial_refund' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Refund Amount *
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-700">$</span>
                      <input
                        type="number"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(parseFloat(e.target.value))}
                        min="0"
                        max={dispute.amount}
                        step="0.01"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      />
                      <span className="text-gray-700">/ ${dispute.amount}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Add any notes about your decision..."
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This action cannot be undone. Both parties will be notified of your decision.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResolve}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
                  >
                    Submit Resolution
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Already Resolved */}
          {dispute.status === 'resolved' && (
            <div className="border-t border-gray-200 pt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-2">Dispute Resolved</h3>
                <p className="text-sm text-green-800 mb-1">
                  <strong>Resolution:</strong> {dispute.resolution?.replace('_', ' ').toUpperCase()}
                </p>
                <p className="text-sm text-green-800">
                  <strong>Resolved On:</strong> {new Date(dispute.resolvedAt).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DisputeDetailsModal;
