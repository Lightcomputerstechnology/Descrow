// CURRENCY SYMBOL CHANGES WITH SELECTION
// DYNAMIC CURRENCY SYMBOL

import React, { useState } from 'react';

const CreateEscrowPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    currency: 'USD',
    deliveryTime: '',
    sellerEmail: ''
  });

  // Currency symbols mapping
  const currencySymbols = {
    USD: '$',
    NGN: '₦',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
    AUD: 'A$',
    KES: 'KSh',
    GHS: 'GH₵',
    ZAR: 'R',
    XOF: 'CFA',
    XAF: 'FCFA'
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'XOF', name: 'West African CFA', symbol: 'CFA' },
    { code: 'XAF', name: 'Central African CFA', symbol: 'FCFA' }
  ];

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl p-8 border border-gray-200 dark:border-gray-800">

          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Create New Escrow Deal
          </h1>

          <form className="space-y-6">

            {/* Dynamic Currency Select */}
            <div>
              <label className="block text-sm mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Currency *
              </label>

              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {currencies.map(curr => (
                  <option key={curr.code} value={curr.code}>
                    {curr.symbol} — {curr.name} ({curr.code})
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Symbol updates automatically based on currency
              </p>
            </div>

            {/* Dynamic Amount */}
            <div>
              <label className="block text-sm mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Amount *
              </label>

              <div className="relative">
                {/* Dynamic Currency Symbol */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-1 items-center pointer-events-none">
                  <span className="font-bold text-lg text-gray-500 dark:text-gray-300">
                    {currencySymbols[formData.currency]}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formData.currency}
                  </span>
                </div>

                <input
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full pl-20 pr-4 py-3 rounded-lg border text-lg font-semibold border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm mb-2 font-semibold text-gray-700 dark:text-gray-300">
                Description *
              </label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>

            {/* Submit */}
            <button className="w-full py-4 bg-blue-600 text-white rounded-lg">
              Create Escrow
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default CreateEscrowPage;