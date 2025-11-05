// File: src/components/DealsInProgress.jsx
import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

const mockDeals = [
  { title: 'iPhone 14 Pro Purchase - Sarah', amount: '$1,200', status: 'In Escrow' },
  { title: 'Helena paying for Web Dev', amount: '$4,200', status: 'Locked' },
  { title: 'Amazon Order Deal - Tom', amount: '$300', status: 'Pending' },
  { title: 'Design Contract - Bryan', amount: '$1,000', status: 'Secured' },
  { title: 'Crypto Exchange - Kelvin', amount: '$5,000', status: 'Locked' },
  { title: 'Used Car Purchase - Mike', amount: '$6,800', status: 'In Progress' },
  { title: 'Furniture Delivery - Tina', amount: '$2,100', status: 'Completed' },
  { title: 'Freelance Video Edit - Joe', amount: '$400', status: 'In Escrow' },
  { title: 'School Payment - Amanda', amount: '$3,500', status: 'Active' },
  { title: 'Consulting Payment - Chloe', amount: '$1,800', status: 'Escrowed' },
];

const DealsInProgress = () => {
  const [allDeals] = useState(mockDeals);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allDeals.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [allDeals]);

  const currentDeal = allDeals[currentIndex];

  return (
    <section className="py-12 bg-white dark:bg-gray-950 text-center transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Title with Live Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Deals in Progress
          </h2>
          <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full animate-pulse">
            LIVE
          </span>
        </div>

        {/* Deal Card */}
        <div className="max-w-md mx-auto">
          <div
            key={currentIndex}
            className="bg-blue-900 dark:bg-blue-800 text-white rounded-2xl shadow-xl p-8 transition-all duration-500 hover:shadow-2xl hover:scale-105"
          >
            <h3 className="text-xl font-semibold mb-4">{currentDeal?.title}</h3>
            <div className="space-y-2">
              <p className="text-lg">
                <strong>Amount:</strong> {currentDeal?.amount}
              </p>
              <p className="text-sm">
                <strong>Status:</strong>{' '}
                <span className="px-2 py-1 bg-white/20 rounded-md">
                  {currentDeal?.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-6">
          {allDeals.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-blue-600 dark:bg-blue-400'
                  : 'w-2 bg-gray-300 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DealsInProgress;