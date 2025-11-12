// src/components/Escrow/StatusStepper.jsx - PRODUCTION READY
import React from 'react';
import { CheckCircle, Clock, CreditCard, Package, ThumbsUp, DollarSign, XCircle } from 'lucide-react';

const StatusStepper = ({ currentStatus, timeline }) => {
  const steps = [
    { 
      key: 'pending', 
      label: 'Created', 
      icon: Clock,
      description: 'Escrow created'
    },
    { 
      key: 'accepted', 
      label: 'Accepted', 
      icon: CheckCircle,
      description: 'Seller accepted'
    },
    { 
      key: 'funded', 
      label: 'Funded', 
      icon: CreditCard,
      description: 'Payment received'
    },
    { 
      key: 'delivered', 
      label: 'Delivered', 
      icon: Package,
      description: 'Item delivered'
    },
    { 
      key: 'completed', 
      label: 'Confirmed', 
      icon: ThumbsUp,
      description: 'Delivery confirmed'
    },
    { 
      key: 'paid_out', 
      label: 'Paid Out', 
      icon: DollarSign,
      description: 'Seller paid'
    }
  ];

  const statusOrder = {
    'pending': 0,
    'accepted': 1,
    'funded': 2,
    'delivered': 3,
    'completed': 4,
    'paid_out': 5,
    'cancelled': -1,
    'disputed': -1
  };

  const currentIndex = statusOrder[currentStatus];
  const isCancelled = currentStatus === 'cancelled';
  const isDisputed = currentStatus === 'disputed';

  const getStepStatus = (stepIndex) => {
    if (isCancelled || isDisputed) {
      if (stepIndex <= currentIndex) return 'completed';
      return 'upcoming';
    }
    
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 dark:bg-green-900/30 border-green-500 text-green-600 dark:text-green-400';
      case 'current':
        return 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400 ring-4 ring-blue-100 dark:ring-blue-900/50';
      default:
        return 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500';
    }
  };

  const getLineColor = (stepIndex) => {
    if (isCancelled || isDisputed) return 'bg-gray-300 dark:bg-gray-700';
    return stepIndex < currentIndex ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700';
  };

  if (isCancelled) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
        <div className="flex items-center gap-3 justify-center">
          <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-red-900 dark:text-red-100">
              Escrow Cancelled
            </p>
            <p className="text-sm text-red-700 dark:text-red-300">
              This transaction has been cancelled
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isDisputed) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
        <div className="flex items-center gap-3 justify-center">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/40 rounded-full">
            <XCircle className="w-8 h-8 text-yellow-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
              Dispute Active
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              This transaction is under review
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Transaction Progress
      </h3>
      
      {/* Desktop View */}
      <div className="hidden md:block">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-300 dark:bg-gray-700" 
               style={{ marginLeft: '3rem', marginRight: '3rem' }}>
            <div 
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(index);
              const isActive = status === 'current';

              return (
                <div key={step.key} className="flex flex-col items-center" style={{ flex: 1 }}>
                  <div className={`
                    w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10
                    ${getStepColor(status)}
                    ${isActive ? 'scale-110' : ''}
                  `}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="mt-3 text-center">
                    <p className={`text-sm font-semibold ${
                      status === 'completed' ? 'text-green-600 dark:text-green-400' :
                      status === 'current' ? 'text-blue-600 dark:text-blue-400' :
                      'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="md:hidden space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const status = getStepStatus(index);
          const isActive = status === 'current';

          return (
            <div key={step.key} className="flex items-center gap-4">
              <div className={`
                w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${getStepColor(status)}
              `}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className={`font-semibold ${
                  status === 'completed' ? 'text-green-600 dark:text-green-400' :
                  status === 'current' ? 'text-blue-600 dark:text-blue-400' :
                  'text-gray-500 dark:text-gray-400'
                }`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
              {status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusStepper;