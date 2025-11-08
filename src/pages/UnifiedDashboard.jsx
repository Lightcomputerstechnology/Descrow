import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  LayoutDashboard,
  ShoppingCart,
  Store,
  List,
  Bell,
  Settings,
  LogOut,
  Plus
} from 'lucide-react';
import OverviewTab from '../../components/Dashboard/OverviewTab';
import BuyingTab from '../../components/Dashboard/BuyingTab';
import SellingTab from '../../components/Dashboard/SellingTab';
import CreateEscrowModal from '../../components/CreateEscrowModal';
import { authService } from '../../services/authService';
import notificationService from '../../services/notificationService';

const UnifiedDashboard = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    // Get user from auth service
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);

    // Check URL params for tab
    const tab = searchParams.get('tab');
    if (tab && ['overview', 'buying', 'selling', 'all'].includes(tab)) {
      setActiveTab(tab);
    }

    // Check if create modal should open
    const action = searchParams.get('action');
    if (action === 'create') {
      setShowCreateModal(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }

    // Fetch unread notifications count
    fetchUnreadCount();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationService.getNotifications(1, 1, true);
      if (response.success) {
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleLogout = () => {
    authService.logout();
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    // Refresh current tab
    window.location.reload();
  };

  if (!user) {
    return null;
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'buying', label: 'Buying', icon: ShoppingCart },
    { id: 'selling', label: 'Selling', icon: Store },
    { id: 'all', label: 'All Transactions', icon: List }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Title & User Info */}
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user.name}
              </p>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Create Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
              >
                <Plus className="w-5 h-5" />
                Create Escrow
              </button>

              {/* Notifications */}
              <button
                onClick={() => navigate('/notifications')}
                className="relative p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <Bell className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Profile */}
              <button
                onClick={() => navigate('/profile')}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <Settings className="w-6 h-6" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-2 -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && <OverviewTab user={user} />}
        {activeTab === 'buying' && <BuyingTab user={user} />}
        {activeTab === 'selling' && <SellingTab user={user} />}
        {activeTab === 'all' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                All Transactions
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Combined view of all your buying and selling transactions
              </p>
            </div>
            {/* You can create an AllTransactionsTab component similar to BuyingTab/SellingTab */}
            {/* For now, showing both */}
            <BuyingTab user={user} />
            <div className="border-t border-gray-200 dark:border-gray-800 my-8"></div>
            <SellingTab user={user} />
          </div>
        )}
      </main>

      {/* Floating Create Button (Mobile) */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="sm:hidden fixed bottom-6 right-6 flex items-center justify-center w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition z-50"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Create Escrow Modal */}
      {showCreateModal && (
        <CreateEscrowModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default UnifiedDashboard;
