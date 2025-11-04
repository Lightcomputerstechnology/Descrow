// File: src/components/DealsInProgress.jsx
import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

const DealsInProgress = () => {
  const liveTransactions = [
    { buyer: 'Emily', seller: 'Joseph', item: 'MacBook Pro 16"', progress: 80, amount: 2500 },
    { buyer: 'Michael', seller: 'TechStore', item: 'iPhone 15 Pro', progress: 65, amount: 1200 },
    { buyer: 'Sarah', seller: 'Fashion Hub', item: 'Designer Jacket', progress: 95, amount: 450 },
    { buyer: 'David', seller: 'AutoParts Ltd', item: 'Car Battery', progress: 50, amount: 180 },
    { buyer: 'Lisa', seller: 'Electronics', item: 'Gaming Console', progress: 75, amount: 599 },
    { buyer: 'James', seller: 'Smart Devices', item: 'Smartwatch', progress: 90, amount: 350 },
    { buyer: 'Maria', seller: 'Home Decor', item: 'Luxury Lamp', progress: 45, amount: 220 },
    { buyer: 'Ahmed', seller: 'Tech Shop', item: 'Wireless Headphones', progress: 85, amount: 280 },
    { buyer: 'Sophie', seller: 'Beauty Store', item: 'Skincare Set', progress: 60, amount: 150 },
    { buyer: 'Ryan', seller: 'Sports Gear', item: 'Running Shoes', progress: 70, amount: 130 }
  ];

  const [currentTransactionIndex, setCurrentTransactionIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTransactionIndex((prev) => (prev + 1) % liveTransactions.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="deals" className="bg-gray-900 dark:bg-black py-4 overflow-hidden transition-colors duration-300">
      <div className="flex items-center justify-center">
        <div className="flex items-center gap-3 text-white animate-pulse">
          <Zap className="w-5 h-5 text-yellow-400" />
          <span className="text-sm font-medium">Live Deals:</span>
          <div>
            <span className="text-sm">
              <strong>{liveTransactions[currentTransactionIndex].buyer}</strong> buying{' '}
              <strong>{liveTransactions[currentTransactionIndex].item}</strong> from{' '}
              <strong>{liveTransactions[currentTransactionIndex].seller}</strong>
              {' '}- {liveTransactions[currentTransactionIndex].progress}% Complete
              {' '}- ${liveTransactions[currentTransactionIndex].amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DealsInProgress;
