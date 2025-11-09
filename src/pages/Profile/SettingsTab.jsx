import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Globe, 
  Moon, 
  Sun, 
  DollarSign,
  Trash2,
  Save,
  Loader,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import notificationService from 'services/notificationService';
import profileService from 'services/profileService';
import toast from 'react-hot-toast';

const SettingsTab = ({ user, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      escrowUpdates: true,
      messages: true,
      disputes: true,
      payments: true,
      marketing: false
    },
    push: {
      escrowUpdates: true,
      messages: true,
      disputes: true,
      payments: true
    }
  });
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    currency: 'USD'
  });
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    password: '',
    reason: '',
    confirmText: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  const fetchNotificationSettings = async () => {
    try {
      const response = await notificationService.getSettings();
      if (response.success) {
        setNotificationSettings(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
    }
  };

  const handleDarkModeToggle = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    toast.success(`${newMode ? 'Dark' : 'Light'} mode enabled`);
  };

  const handleNotificationChange = (category, type, value) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [type]: value
      }
    }));
  };

  const handleSaveNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.updateSettings(notificationSettings);

      if (response.success) {
        toast.success('Notification settings updated!');
      }
    } catch (error) {
      console.error('Update notifications error:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (deleteConfirmation.confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!deleteConfirmation.password) {
      toast.error('Password is required');
      return;
    }

    try {
      setLoading(true);
      const response = await profileService.deleteAccount(
        deleteConfirmation.password,
        deleteConfirmation.reason
      );

      if (response.success) {
        toast.success('Account deleted successfully');
        localStorage.clear();
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            {darkMode ? (
              <Moon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            ) : (
              <Sun className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Appearance
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Customize how Dealcross looks on your device
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Use dark theme across the application
            </p>
          </div>
          <button
            onClick={handleDarkModeToggle}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Notification Preferences
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Choose how you want to be notified
            </p>
          </div>
        </div>

        {/* Email Notifications */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Email Notifications
          </h4>
          <div className="space-y-3">
            {Object.entries({
              escrowUpdates: 'Escrow Updates',
              messages: 'New Messages',
              disputes: 'Dispute Alerts',
              payments: 'Payment Confirmations',
              marketing: 'Marketing & Promotions'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-900 dark:text-white">{label}</span>
                <button
                  onClick={() => handleNotificationChange('email', key, !notificationSettings.email[key])}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notificationSettings.email[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationSettings.email[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Push Notifications */}
        <div className="mb-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">
            Push Notifications
          </h4>
          <div className="space-y-3">
            {Object.entries({
              escrowUpdates: 'Escrow Updates',
              messages: 'New Messages',
              disputes: 'Dispute Alerts',
              payments: 'Payment Confirmations'
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="text-gray-900 dark:text-white">{label}</span>
                <button
                  onClick={() => handleNotificationChange('push', key, !notificationSettings.push[key])}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notificationSettings.push[key] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationSettings.push[key] ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleSaveNotifications}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Preferences
            </>
          )}
        </button>
      </div>

      {/* Regional Settings */}
      {/* ... (rest of your file stays unchanged) ... */}
    </div>
  );
};

export default SettingsTab;