// File: src/components/DealsInProgress.jsx
import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import API from '../utils/api';
import { toast } from 'react-hot-toast';

// Complete mock deals with international transactions
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
    buyer: 'Helena Schmidt',
    seller: 'Web Dev Agency',
    itemName: 'Web Development Services',
    location: 'Berlin, Germany',
    condition: 'New',
    amount: '$4,200',
    status: 'Locked 🔒',
  },
  {
    buyer: 'Thomas Chen',
    seller: 'Amazon Global',
    itemName: 'Amazon International Order',
    location: 'Shanghai, China',
    condition: 'New',
    amount: '$850',
    status: 'Pending ⏳',
  },
  {
    buyer: 'Bryan Rodriguez',
    seller: 'Design Co.',
    itemName: 'Design Contract',
    location: 'Mexico City, Mexico',
    condition: 'N/A',
    amount: '$1,500',
    status: 'Secured 🔒',
  },
  {
    buyer: 'Kelvin Williams',
    seller: 'Crypto Exchange',
    itemName: 'Crypto Exchange',
    location: 'Dubai, UAE',
    condition: 'N/A',
    amount: '$7,500',
    status: 'Locked 🔒',
  },
  {
    buyer: 'Mike Anderson',
    seller: 'Used Cars Ltd',
    itemName: 'Used Car Purchase',
    location: 'London, UK',
    condition: 'Good',
    amount: '$12,800',
    status: 'In Progress ⏳',
  },
  {
    buyer: 'Tina Patel',
    seller: 'Furniture Co.',
    itemName: 'Furniture Delivery',
    location: 'Mumbai, India',
    condition: 'New',
    amount: '$2,100',
    status: 'Completed ✅',
  },
  {
    buyer: 'Joe Kim',
    seller: 'Freelance Video Editor',
    itemName: 'Freelance Video Edit',
    location: 'Seoul, South Korea',
    condition: 'N/A',
    amount: '$600',
    status: 'In Escrow 🔒',
  },
  {
    buyer: 'Amanda Silva',
    seller: 'School ABC',
    itemName: 'International School Payment',
    location: 'São Paulo, Brazil',
    condition: 'N/A',
    amount: '$3,500',
    status: 'Active 🔵',
  },
  {
    buyer: 'Chloe Martin',
    seller: 'Consulting Firm',
    itemName: 'Consulting Payment',
    location: 'Paris, France',
    condition: 'N/A',
    amount: '$2,800',
    status: 'Escrowed 🔒',
  },
  {
    buyer: 'David Wilson',
    seller: 'Tech Startup',
    itemName: 'Software License',
    location: 'Toronto, Canada',
    condition: 'Digital',
    amount: '$1,200',
    status: 'Processing 🔄',
  },
  {
    buyer: 'Maria Garcia',
    seller: 'Fashion Boutique',
    itemName: 'Luxury Handbag',
    location: 'Madrid, Spain',
    condition: 'Brand New',
    amount: '$2,300',
    status: 'Shipped 📦',
  },
  {
    buyer: 'James Brown',
    seller: 'Electronics Store',
    itemName: 'Gaming Laptop',
    location: 'Sydney, Australia',
    condition: 'Refurbished',
    amount: '$1,800',
    status: 'Delivered ✅',
  },
  {
    buyer: 'Lisa Taylor',
    seller: 'Art Gallery',
    itemName: 'Original Painting',
    location: 'Rome, Italy',
    condition: 'Antique',
    amount: '$5,600',
    status: 'Verified ✅',
  },
  {
    buyer: 'Robert Lee',
    seller: 'Real Estate Co.',
    itemName: 'Property Deposit',
    location: 'Singapore',
    condition: 'N/A',
    amount: '$25,000',
    status: 'Secured 🔒',
  }
];

const DealsInProgress = () => {
  const [allDeals, setAllDeals] = useState(mockDeals);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch real deals from backend (FIXED ENDPOINT)
  useEffect(() => {
    const fetchDeals = async () => {
      try {
        // ✅ FIXED: Changed from '/deals/public' to '/escrow/public'
        const res = await API.get('/escrow/public');
        
        // Your backend returns { success: true, deals: array }
        if (res.data.success && Array.isArray(res.data.deals) && res.data.deals.length > 0) {
          const realDeals = res.data.deals.map((deal) => ({
            buyer: 'User', // Backend doesn't return buyer/seller names for privacy
            seller: 'Seller',
            itemName: deal.title || 'Transaction',
            location: 'Online', // Backend doesn't return location
            condition: deal.category === 'services' ? 'N/A' : 'New',
            amount: `$${deal.amount}`,
            status: 'Completed ✅', // These are completed deals from backend
          }));
          setAllDeals([...realDeals, ...mockDeals]);
        }
      } catch (err) {
        console.error('Failed to fetch real deals:', err.message);
        // Keep using mock data if API fails
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

        {/* Live Stats */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            🔄 Live updates every 7 seconds • {allDeals.length} active transactions worldwide
          </p>
        </div>
      </div>
    </section>
  );
};

export default DealsInProgress;