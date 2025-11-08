import React from 'react';
import { Check } from 'lucide-react';
import { getTimelineSteps } from '../../utils/escrowHelpers';

const StatusStepper = ({ currentStatus, timeline = [] }) => {
  const steps = getTimelineSteps();
  
  // Map status to step index
  const statusToIndex = {
    'pending': 0,
    'accepted': 1,
    'funded': 2,
    'delivered': 3,
    'completed': 4,
    'paid_out': 5,
    'cancelled': -1,
    'disputed': -1
  };

  const currentIndex = statusToIndex[currentStatus] ?? 0;
  const isTerminal = ['cancelled', 'disputed'].includes(currentStatus);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        Transaction Progress
      </h3>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
            style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isPast = index < currentIndex;
            const isCurrent = index === currentIndex;
            const timelineEntry = timeline.find(t => t.status === step.key);

            return (
              <div key={step.key} className="flex flex-col items-center">
                {/* Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isPast || isCurrent
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {isPast ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                </div>

                {/* Label */}
                <div className="mt-3 text-center">
                  <p
                    className={`text-sm font-medium ${
                      isPast || isCurrent
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {step.label}
                  </p>
                  {timelineEntry && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(timelineEntry.timestamp).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Terminal Status Warning */}
      {isTerminal && (
        <div className={`mt-6 p-4 rounded-lg ${
          currentStatus === 'cancelled'
            ? 'bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <p className={`text-sm font-medium ${
            currentStatus === 'cancelled'
              ? 'text-gray-900 dark:text-white'
              : 'text-red-900 dark:text-red-200'
          }`}>
            {currentStatus === 'cancelled' ? '❌ Transaction Cancelled' : '⚠️ Transaction Disputed'}
          </p>
        </div>
      )}
    </div>
  );
};

export default StatusStepper;
