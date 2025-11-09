import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, Loader, Download } from 'lucide-react';
import StatsCard from './StatsCard';
import EscrowCard from './EscrowCard';
import SearchFilter from './SearchFilter';
import ExportModal from './ExportModal'; // ✅ relative import
import escrowService from '../../services/escrowService'; // ✅ relative import
import toast from 'react-hot-toast';
const BuyingTab = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [escrows, setEscrows] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    role: 'buyer',
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false); // ← Added

  useEffect(() => {
    fetchBuyingData();
  }, [filters]);

  const fetchBuyingData = async () => {
    try {
      setLoading(true);

      // Fetch escrows with filters
      const response = await escrowService.getMyEscrows(filters);
      
      if (response.success) {
        setEscrows(response.data.escrows);
        setPagination(response.data.pagination);
      }

      // Fetch stats
      const statsResponse = await escrowService.getDashboardStats();
      if (statsResponse.success) {
        setStats(statsResponse.data.buying);
      }

    } catch (error) {
      console.error('Failed to fetch buying data:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleFilter = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleQuickAction = (escrowId, action) => {
    navigate(`/escrow/${escrowId}`);
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Purchases"
          value={stats?.total || 0}
          icon={ShoppingCart}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Pending Acceptance"
          value={stats?.pending || 0}
          icon={ShoppingCart}
          color="orange"
          subtitle="Waiting for seller"
          loading={loading}
        />
        <StatsCard
          title="In Progress"
          value={(stats?.funded || 0) + (stats?.delivered || 0)}
          icon={ShoppingCart}
          color="purple"
          subtitle="Active deals"
          loading={loading}
        />
        <StatsCard
          title="Completed"
          value={stats?.completed || 0}
          icon={ShoppingCart}
          color="green"
          loading={loading}
        />
      </div>

      {/* Create + Export Buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Purchases</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage all your buying transactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            <Download className="w-5 h-5" />
            Export
          </button>

          <button
            onClick={() => navigate('/dashboard?action=create')}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Escrow
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <SearchFilter
        onSearch={handleSearch}
        onFilter={handleFilter}
        initialFilters={filters}
      />

      {/* Transactions List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : escrows.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {escrows.map((escrow) => (
              <EscrowCard
                key={escrow._id}
                escrow={escrow}
                userRole="buyer"
                onQuickAction={handleQuickAction}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-800 pt-6">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} transactions
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                          pagination.page === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No purchases yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start your first secure transaction by creating an escrow
          </p>
          <button
            onClick={() => navigate('/dashboard?action=create')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            <Plus className="w-5 h-5" />
            Create Your First Escrow
          </button>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          transactions={escrows}
          user={user}
          onClose={() => setShowExportModal(false)}
        />
      )}
    </div>
  );
};

export default BuyingTab;