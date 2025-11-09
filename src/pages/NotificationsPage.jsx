import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check,      // use this instead of CheckCheck
  Trash2, 
  Filter,
  ArrowLeft,
  Loader,
  Settings,
  PackageCheck,
  MessageCircle,
  AlertCircle,
  DollarSign,
  Mail
} from 'lucide-react';
import notificationService from '../services/notificationService';
import { formatRelativeTime } from '../utils/escrowHelpers';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchNotifications();
  }, [filter, pagination.page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === 'unread';
      
      const response = await notificationService.getNotifications(
        pagination.page,
        pagination.limit,
        unreadOnly
      );

      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          pages: response.data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const response = await notificationService.markAsRead(id);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        toast.success('All notifications marked as read');
        fetchNotifications();
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await notificationService.deleteNotification(id);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success('Notification deleted');
      }
    } catch (error) {
      console.error('Delete notification error:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleClearAllRead = async () => {
    if (!window.confirm('Delete all read notifications?')) return;

    try {
      const response = await notificationService.clearAllRead();
      if (response.success) {
        toast.success('All read notifications deleted');
        fetchNotifications();
      }
    } catch (error) {
      console.error('Clear all read error:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      escrow_created: PackageCheck,
      escrow_accepted: CheckCheck,
      escrow_funded: DollarSign,
      escrow_delivered: PackageCheck,
      escrow_completed: CheckCheck,
      escrow_cancelled: AlertCircle,
      dispute_raised: AlertCircle,
      dispute_resolved: CheckCheck,
      message_received: MessageCircle,
      payment_received: DollarSign
    };

    const Icon = icons[type] || Bell;
    return Icon;
  };

  const getNotificationColor = (type) => {
    const colors = {
      escrow_created: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      escrow_accepted: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      escrow_funded: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      escrow_delivered: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      escrow_completed: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      escrow_cancelled: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
      dispute_raised: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      dispute_resolved: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      message_received: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      payment_received: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
    };

    return colors[type] || 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
                <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Notifications
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/profile?tab=settings')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
            >
              <Settings className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Actions Bar */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === 'unread'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium text-sm transition"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all as read
                </button>
              )}
              
              {notifications.some(n => n.isRead) && (
                <button
                  onClick={handleClearAllRead}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium text-sm transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear read
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread' 
                ? 'All caught up! Check back later for updates.'
                : 'We'll notify you when something important happens.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);

              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white dark:bg-gray-900 border rounded-xl p-4 transition cursor-pointer group ${
                    notification.isRead
                      ? 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg flex-shrink-0 ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h4>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>

                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatRelativeTime(notification.createdAt)}
                        </span>

                        {/* Actions */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                          {!notification.isRead && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification._id);
                              }}
                              className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification._id);
                            }}
                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {pagination.page} of {pagination.pages}
            </span>

            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
