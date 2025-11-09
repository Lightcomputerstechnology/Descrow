import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, DollarSign, Loader, TrendingUp, Download } from 'lucide-react'; // ← Added Download

import StatsCard from 'components/Dashboard/StatsCard';
import EscrowCard from 'components/Dashboard/EscrowCard';
import SearchFilter from 'components/Dashboard/SearchFilter';
import ExportModal from 'components/Dashboard/ExportModal'; // ← Added
import escrowService from 'services/escrowService';
import toast from 'react-hot-toast';

const SellingTab = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [escrows, setEscrows] = useState([]);
  const [stats, setStats] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false); // ← Added
  const [filters, setFilters] = useState({
    role: 'seller',
    status: 'all',
    search: '',
    sortBy: 'createdAt',
    order: 'desc',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    fetchSellingData();
  }, [filters]);

  const fetchSellingData = async () => {
    try {
      setLoading(true);
      const response = await escrowService.getMyEscrows(filters);
      if (response.success) {
        setEscrows(response.data.escrows);
        setPagination(response.data.pagination);
      }

      const statsResponse = await escrowService.getDashboardStats();
      if (statsResponse.success) {
        setStats(statsResponse.data.selling);
      }
    } catch (error) {
      console.error('Failed to fetch selling data:', error);
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

  // Calculate total earnings from completed/paid_out transactions
  const totalEarnings = escrows
    .filter(e => ['completed', 'paid_out'].includes(e.status))
    .reduce((sum, e) => sum + (e.payment?.sellerReceives || 0), 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sales"
          value={stats?.total || 0}
          icon={Store}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="Total Earnings"
          value={`$${totalEarnings.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          trend="up"
          trendValue="+12%"
          loading={loading}
        />
        <StatsCard
          title="Pending Acceptance"
          value={stats?.pending || 0}
          icon={Store}
          color="orange"
          subtitle="Waiting for you"
          loading={loading}
        />
        <StatsCard
          title="In Progress"
          value={(stats?.funded || 0) + (stats?.delivered || 0)}
          icon={Store}
          color="blue"
          subtitle="Active deals"
          loading={loading}
        />
      </div>

      {/* Upgrade Banner (for free/basic tier) */}
      {(user.tier === 'free' || user.tier === 'basic') && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6" />
                <h3 className="text-xl font-bold">Upgrade Your Account</h3>
              </div>
              <p className="text-purple-100 mb-4">
                Unlock higher transaction limits, priority support, and advanced features
              </p>
              <button
                onClick={() => navigate('/#pricing')}
                className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition"
              >
                View Pricing Plans
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Sales</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage all your selling transactions
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
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
          <Loader className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      ) : escrows.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {escrows.map((escrow) => (
              <EscrowCard
                key={escrow._id}
                escrow={escrow}
                userRole="seller"
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
                            ? 'bg-purple-600 text-white'
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
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No sales yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            When someone creates an escrow to buy from you, it will appear here
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Share your email with potential buyers to receive escrow requests
          </p>
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

export default SellingTab;