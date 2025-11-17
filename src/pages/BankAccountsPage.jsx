// src/pages/BankAccountsPage.jsx

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, AlertCircle, Building } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const BankAccountsPage = () => {
  const [accounts, setAccounts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    accountNumber: '',
    bankCode: '',
    bankName: '',
    currency: 'NGN'
  });
  const [verifying, setVerifying] = useState(false);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchBankAccounts();
    fetchBanks();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bank/list`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setAccounts(response.data.data.accounts);
      }
      setLoading(false);
    } catch (error) {
      console.error('Fetch accounts error:', error);
      toast.error('Failed to load bank accounts');
      setLoading(false);
    }
  };

  const fetchBanks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/bank/banks?currency=NGN`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setBanks(response.data.data.banks);
      }
    } catch (error) {
      console.error('Fetch banks error:', error);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();

    if (!formData.accountNumber || !formData.bankCode) {
      toast.error('Please fill all required fields');
      return;
    }

    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/bank/add`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Bank account added and verified successfully!');
        setAccounts([...accounts, response.data.data.bankAccount]);
        setShowAddModal(false);
        setFormData({
          accountNumber: '',
          bankCode: '',
          bankName: '',
          currency: 'NGN'
        });
      }
    } catch (error) {
      console.error('Add account error:', error);
      toast.error(error.response?.data?.message || 'Failed to add bank account');
    } finally {
      setVerifying(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/bank/${accountId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success('Bank account deleted');
        setAccounts(accounts.filter(acc => acc._id !== accountId));
      }
    } catch (error) {
      console.error('Delete account error:', error);
      toast.error('Failed to delete bank account');
    }
  };

  const handleSetPrimary = async (accountId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/bank/primary/${accountId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Primary account updated');
        fetchBankAccounts();
      }
    } catch (error) {
      console.error('Set primary error:', error);
      toast.error('Failed to update primary account');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Bank Accounts</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your payout accounts
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Add Account
          </button>
        </div>

        {/* Info Banner */}
        <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                Automatic Payouts
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Once an escrow is completed, funds are automatically transferred to your primary bank account within 24 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-800">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Bank Accounts Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add a bank account to receive payouts from completed escrows
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              Add Your First Account
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => (
              <div
                key={account._id}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 relative"
              >
                {account.isPrimary && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                      PRIMARY
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building className="w-6 h-6 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                      {account.bankName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {account.accountName}
                    </p>
                    <p className="text-gray-500 dark:text-gray-500 text-sm font-mono mt-1">
                      {account.accountNumber}
                    </p>

                    {account.isVerified && (
                      <div className="flex items-center gap-2 mt-3">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Verified</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {!account.isPrimary && (
                      <button
                        onClick={() => handleSetPrimary(account._id)}
                        className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition"
                      >
                        Set Primary
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteAccount(account._id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Add Bank Account
              </h2>

              <form onSubmit={handleAddAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Bank
                  </label>
                  <select
                    value={formData.bankCode}
                    onChange={(e) => {
                      const selectedBank = banks.find(b => b.code === e.target.value);
                      setFormData({
                        ...formData,
                        bankCode: e.target.value,
                        bankName: selectedBank?.name || ''
                      });
                    }}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">Choose a bank...</option>
                    {banks.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    placeholder="0123456789"
                    maxLength="10"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    We'll automatically verify your account name
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    disabled={verifying}
                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={verifying}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition flex items-center justify-center gap-2"
                  >
                    {verifying ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Add Account'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BankAccountsPage;
