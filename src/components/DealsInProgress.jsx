// File: src/components/DealsInProgress.jsx
import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import API from '../utils/api';
import { toast } from 'react-hot-toast';

// Mock deals for display
const mockDeals = [
  {
    buyer: 'Sarah Johnson',
    seller: 'Kelvin Ugo',
    itemName: 'iPhone 14 Pro Purchase',
    location: 'Lagos, Nigeria',
    condition: 'Fairly used',
    amount: '$1,200',
    status: 'In Escrow 🔒',
  },
  {
    buyer: 'Helena',
    seller: 'Web Dev Agency',
    itemName: 'Web Development Services',
    location: 'Abuja, Nigeria',
    condition: 'New',
    amount: '$4,200',
    status: 'Locked 🔒',
  },
  {
    buyer: 'Tom',
    seller: 'Amazon',
    itemName: 'Amazon Order',
    location: 'Online',
    condition: 'New',
    amount: '$300',
    status: 'Pending ⏳',
  },
  {
    buyer: 'Bryan',
    seller: 'Design Co.',
    itemName: 'Design Contract',
    location: 'Port Harcourt, Nigeria',
    condition: 'N/A',
    amount: '$1,000',
    status: 'Secured 🔒',
  },
  {
    buyer: 'Kelvin',
    seller: 'Crypto Exchange',
    itemName: 'Crypto Exchange',
    location: 'Online',
    condition: 'N/A',
    amount: '$5,000',
    status: 'Locked 🔒',
  },
  {
    buyer: 'Mike',
    seller: 'Used Cars Ltd',
    itemName: 'Used Car Purchase',
    location: 'Ibadan, Nigeria',
    condition: 'Good',
    amount: '$6,800',
    status: 'In Progress ⏳',
  },
  {
    buyer: 'Tina',
    seller: 'Furniture Co.',
    itemName: 'Furniture Delivery',
    location: 'Enugu, Nigeria',
    condition: 'New',
    amount: '$2,100',
    status: 'Completed ✅',
  },
  {
    buyer: 'Joe',
    seller: 'Freelance Video Editor',
    itemName: 'Freelance Video Edit',
    location: 'Online',
    condition: 'N/A',
    amount: '$400',
    status: 'In Escrow 🔒',
  },
  {
    buyer: 'Amanda',
    seller: 'School ABC',
    itemName: 'School Payment',
    location: 'Lagos, Nigeria',
    condition: 'N/A',
    amount: '$3,500',
    status: 'Active 🔵',
  },
  {
    buyer: 'Chloe',
    seller: 'Consulting Firm',
    itemName: 'Consulting Payment',
    location: 'Abuja, Nigeria',
    condition: 'N/A',
    amount: '$1,800',
    status: 'Escrowed 🔒',
  },
];

const DealsInProgress = () => {
  const [allDeals, setAllDeals] = useState(mockDeals);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch real deals from backend (optional)
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const res = await API.get('/deals/public');
        if (Array.isArray(res?.data) && res.data.length > 0) {
          const realDeals = res.data.map((deal) => ({
            buyer: deal.buyer_name || 'User',
            seller: deal.seller_name || 'Seller',
            itemName: deal.title,
            location: deal.location || 'Unknown',
            condition: deal.condition || 'N/A',
            amount: `$${deal.amount}`,
            status: deal.status || 'Pending',
          }));
          setAllDeals([...realDeals, ...mockDeals]);
        }
      } catch (err) {
        console.error('Failed to fetch real deals:', err.message);
      }
    };

    fetchDeals();
  }, []);

  // Cycle through deals every 7 seconds
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
        {/* Section Title */}
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
            <h3 className="text-xl font-semibold mb-4">
              {currentDeal?.buyer} purchasing {currentDeal?.itemName} from{' '}
              {currentDeal?.seller}
            </h3>
            <div className="space-y-2 text-left">
              <p>
                <strong>Location:</strong> {currentDeal?.location}
              </p>
              <p>
                <strong>Condition:</strong> {currentDeal?.condition}
              </p>
              <p>
                <strong>Amount:</strong> {currentDeal?.amount}
              </p>
              <p>
                <strong>Status:</strong>{' '}
                <span className="px-2 py-1 bg-white/20 rounded-md">
                  {currentDeal?.status}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Progress Dots */}
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