import React, { useState } from 'react';
import { AlertTriangle, Eye, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import DisputeDetailsModal from '../../components/admin/DisputeDetailsModal';

const DisputesPage = ({ admin }) => {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [statusFilter, setStatusFilter] = useState('pending');

  // Mock data - Replace with API call
  const [disputes] = useState([
    {
      id: 'DIS001',
      escrowId: 'ESC12347',
      buyer: { name: 'Mike Johnson', email: 'mike@example.com' },
      seller: { name: 'AutoParts Direct', email: 'sales@autoparts.com' },
      itemName: 'Car Battery',
      amount: 450,
      reason: 'damaged',
      description: 'The battery arrived with visible damage on the terminals. It does not hold charge properly.',
      evidence: ['photo1.jpg', 'photo2.jpg'],
      status: 'pending',
      createdAt: '2025-10-27T08:45:00Z',
      priority: 'high'
    },
    {
      id: 'DIS002',
      escrowId: 'ESC12340',
      buyer: { name: 'Sarah Lee', email: 'sarah@example.com' },
      seller: { name: 'Electronics Depot', email: 'info@electronics.com' },
      itemName: 'Wireless Headphones',
      amount: 280,
      reason: 'not_as_described',
      description: 'The headphones are not the original brand as advertised. They appear to be counterfeit.',
      evidence: ['photo3.jpg', 'receipt.pdf'],
      status: 'under_review',
      createdAt: '2025-10-26T14:20:00Z',
      priority: 'medium'
    },
    {
      id: 'DIS003',
      escrowId: 'ESC12335',
      buyer: { name: 'Tom Brown', email: 'tom@example.com' },
      seller: { name: 'Fashion Store', email: 'sales@fashion.com' },
      itemName: 'Designer Watch',
      amount: 1500,
      reason: 'counterfeit',
      description: 'Watch is fake. Serial number does not match manufacturer records.',
      evidence: ['watch_front.jpg', 'watch_back.jpg', 'serial_check.pdf'],
      status: 'resolved',
      resolution: 'refund_to_buyer',
      resolvedAt: '2025-10-25T16:30:00Z',
      priority: 'high'
    }
  ]);

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pending' },
      under_review: { color: 'bg-blue-100 text-blue-800', icon: MessageSquare, text: 'Under Review' },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Resolved' },
      rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejected' }
    };
    const badge = badges[status];
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const filteredDisputes = disputes.filter(d => {
    if (statusFilter === 'all') return true;
    return d.status === statusFilter;
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar admin={admin} activePage="disputes" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader admin={admin} title="Dispute Management" />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Disputes</p>
                  <p className="text-2xl font-bold text-gray-900">{disputes.length}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-gray-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {disputes.filter(d => d.status === 'pending').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Under Review</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {disputes.filter(d => d.status === 'under_review').length}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resolved</p>
                  <p className="text-2xl font-bold text-green-600">
                    {disputes.filter(d => d.status === 'resolved').length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>

          {/* Filter */}
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
              <div className="flex gap-2">
                {['all', 'pending', 'under_review', 'resolved'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      statusFilter === status
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Disputes List */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispute ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Escrow ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDisputes.map((dispute) => (
                    <tr key={dispute.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-red-600">{dispute.id}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-blue-600">{dispute.escrowId}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dispute.buyer.name}</p>
                          <p className="text-xs text-gray-500">{dispute.buyer.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{dispute.seller.name}</p>
                          <p className="text-xs text-gray-500">{dispute.seller.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-900">{dispute.itemName}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          ${dispute.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 capitalize">
                          {dispute.reason.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(dispute.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(dispute.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedDispute(dispute)}
                          className="text-blue-600 hover:text-blue-900 transition"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredDisputes.length === 0 && (
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No disputes found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dispute Details Modal */}
      {selectedDispute && (
        <DisputeDetailsModal
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onResolve={(resolution) => {
            // API call to resolve dispute
            console.log('Resolving dispute:', resolution);
            setSelectedDispute(null);
          }}
        />
      )}
    </div>
  );
};

export default DisputesPage;
