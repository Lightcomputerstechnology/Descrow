import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Search,
  Filter,
  Loader,
  Eye,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const DisputesPage = ({ admin }) => {
  const navigate = useNavigate();
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionData, setResolutionData] = useState({
    resolution: '',
    winner: '',
    refundAmount: '',
    notes: ''
  });
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter, currentPage]);

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      const response = await adminService.getDisputes({
        status: statusFilter,
        page: currentPage,
        limit: 20
      });
      setDisputes(response.disputes || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveDispute = async (e) => {
    e.preventDefault();
    try {
      setResolving(true);
      await adminService.resolveDispute(selectedDispute._id, {
        resolution: resolutionData.resolution,
        winner: resolutionData.winner,
        refundAmount: parseFloat(resolutionData.refundAmount) || 0,
        notes: resolutionData.notes
      });
      alert('Dispute resolved successfully');
      setShowResolveModal(false);
      setSelectedDispute(null);
      setResolutionData({ resolution: '', winner: '', refundAmount: '', notes: '' });
      fetchDisputes();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to resolve dispute');
    } finally {
      setResolving(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { color: 'bg-red-500/20 text-red-400', icon: AlertCircle, text: 'Open' },
      under_review: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock, text: 'Under Review' },
      resolved: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle, text: 'Resolved' }
    };
    const badge = badges[status] || badges.open;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 hover:bg-gray-700 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Dispute Management</h1>
              <p className="text-sm text-gray-400">Review and resolve user disputes</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex gap-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Disputes Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Escrow ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Reason</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Initiated By</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : disputes.length > 0 ? (
                  disputes.map((dispute) => (
                    <tr key={dispute._id} className="hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-white">
                          {dispute.escrow?.escrowId || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{dispute.reason}</p>
                        <p className="text-gray-400 text-xs line-clamp-1">{dispute.description}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white text-sm">{dispute.initiatedBy?.name}</p>
                          <p className="text-gray-400 text-xs">{dispute.initiatedBy?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(dispute.status)}</td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {new Date(dispute.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setShowResolveModal(true);
                          }}
                          disabled={dispute.status === 'resolved'}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {dispute.status === 'resolved' ? 'Resolved' : 'Resolve'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      No disputes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Resolve Dispute Modal */}
      {showResolveModal && selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">Resolve Dispute</h2>
              <p className="text-sm text-gray-400 mt-1">Escrow: {selectedDispute.escrow?.escrowId}</p>
            </div>

            <form onSubmit={handleResolveDispute} className="p-6 space-y-6">
              {/* Dispute Details */}
              <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
                <h3 className="font-semibold text-white mb-2">Dispute Details</h3>
                <p className="text-sm text-gray-400 mb-2">
                  <strong>Reason:</strong> {selectedDispute.reason}
                </p>
                <p className="text-sm text-gray-400">
                  <strong>Description:</strong> {selectedDispute.description}
                </p>
              </div>

              {/* Resolution */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Resolution Summary *
                </label>
                <textarea
                  value={resolutionData.resolution}
                  onChange={(e) => setResolutionData({ ...resolutionData, resolution: e.target.value })}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="Explain your decision..."
                  required
                ></textarea>
              </div>

              {/* Winner */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Who wins the dispute? *
                </label>
                <select
                  value={resolutionData.winner}
                  onChange={(e) => setResolutionData({ ...resolutionData, winner: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  required
                >
                  <option value="">Select winner</option>
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>

              {/* Refund Amount */}
              {resolutionData.winner === 'buyer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Refund Amount (optional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={resolutionData.refundAmount}
                    onChange={(e) => setResolutionData({ ...resolutionData, refundAmount: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                    placeholder="0.00"
                  />
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Internal Notes (optional)
                </label>
                <textarea
                  value={resolutionData.notes}
                  onChange={(e) => setResolutionData({ ...resolutionData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="Notes for internal records..."
                ></textarea>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowResolveModal(false);
                    setSelectedDispute(null);
                    setResolutionData({ resolution: '', winner: '', refundAmount: '', notes: '' });
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-700 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {resolving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Resolving...
                    </>
                  ) : (
                    'Resolve Dispute'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DisputesPage;
