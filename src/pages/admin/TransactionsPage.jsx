import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  Eye,
  Loader,
  Package,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const TransactionsPage = ({ admin }) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [statusFilter, currentPage, search]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await adminService.getTransactions({
        status: statusFilter,
        page: currentPage,
        limit: 20,
        search
      });
      setTransactions(response.escrows || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTransactions();
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending_payment: { color: 'bg-orange-500/20 text-orange-400', icon: Clock },
      in_escrow: { color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
      awaiting_delivery: { color: 'bg-blue-500/20 text-blue-400', icon: Package },
      completed: { color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
      disputed: { color: 'bg-red-500/20 text-red-400', icon: XCircle },
      cancelled: { color: 'bg-gray-500/20 text-gray-400', icon: XCircle }
    };
    const badge = badges[status] || badges.in_escrow;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/dashboard')}
                className="p-2 hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-400" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">All Transactions</h1>
                <p className="text-sm text-gray-400">Manage all escrow transactions</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Escrow ID or Item Name..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                />
              </div>
            </form>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
            >
              <option value="">All Statuses</option>
              <option value="pending_payment">Pending Payment</option>
              <option value="in_escrow">In Escrow</option>
              <option value="awaiting_delivery">Awaiting Delivery</option>
              <option value="completed">Completed</option>
              <option value="disputed">Disputed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <button className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900 border-b border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Escrow ID</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Item</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Buyer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Seller</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <Loader className="w-8 h-8 text-red-600 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-white">{transaction.escrowId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-medium">{transaction.itemName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white text-sm">{transaction.buyer?.name}</p>
                          <p className="text-gray-400 text-xs">{transaction.buyer?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white text-sm">{transaction.seller?.name}</p>
                          <p className="text-gray-400 text-xs">{transaction.seller?.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white font-semibold">
                          ${transaction.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(transaction.status)}</td>
                      <td className="px-6 py-4">
                        <span className="text-gray-400 text-sm">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/escrow/${transaction.escrowId}`)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                      No transactions found
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
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TransactionsPage;
