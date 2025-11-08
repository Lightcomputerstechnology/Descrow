/**
 * Get status display info (color, icon, text)
 */
export const getStatusInfo = (status) => {
  const statusMap = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      text: 'Pending Acceptance',
      icon: '⏳'
    },
    accepted: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      text: 'Awaiting Payment',
      icon: '💳'
    },
    funded: {
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      text: 'Funded - Awaiting Delivery',
      icon: '💰'
    },
    delivered: {
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
      text: 'Delivered - Awaiting Confirmation',
      icon: '📦'
    },
    completed: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      text: 'Completed',
      icon: '✅'
    },
    paid_out: {
      color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
      text: 'Paid Out',
      icon: '💸'
    },
    cancelled: {
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      text: 'Cancelled',
      icon: '❌'
    },
    disputed: {
      color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      text: 'Disputed',
      icon: '⚠️'
    }
  };

  return statusMap[status] || statusMap.pending;
};

/**
 * Get next action for user based on status and role
 */
export const getNextAction = (escrow, userRole) => {
  const { status } = escrow;

  if (userRole === 'buyer') {
    switch (status) {
      case 'pending':
        return { text: 'Waiting for seller to accept', action: null, disabled: true };
      case 'accepted':
        return { text: 'Pay Now', action: 'fund', disabled: false, primary: true };
      case 'funded':
        return { text: 'Waiting for delivery', action: null, disabled: true };
      case 'delivered':
        return { text: 'Confirm Receipt', action: 'confirm', disabled: false, primary: true };
      case 'completed':
        return { text: 'Rate Seller', action: 'rate', disabled: false };
      case 'paid_out':
        return { text: 'Transaction Complete', action: null, disabled: true };
      default:
        return { text: 'View Details', action: 'view', disabled: false };
    }
  }

  if (userRole === 'seller') {
    switch (status) {
      case 'pending':
        return { text: 'Accept Deal', action: 'accept', disabled: false, primary: true };
      case 'accepted':
        return { text: 'Waiting for buyer payment', action: null, disabled: true };
      case 'funded':
        return { text: 'Mark as Delivered', action: 'deliver', disabled: false, primary: true };
      case 'delivered':
        return { text: 'Waiting for buyer confirmation', action: null, disabled: true };
      case 'completed':
        return { text: 'Rate Buyer', action: 'rate', disabled: false };
      case 'paid_out':
        return { text: 'Payment Received', action: null, disabled: true };
      default:
        return { text: 'View Details', action: 'view', disabled: false };
    }
  }

  return { text: 'View Details', action: 'view', disabled: false };
};

/**
 * Format currency
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return formatDate(date);
};

/**
 * Calculate progress percentage based on status
 */
export const getProgressPercentage = (status) => {
  const progressMap = {
    pending: 16,
    accepted: 33,
    funded: 50,
    delivered: 66,
    completed: 83,
    paid_out: 100,
    cancelled: 0,
    disputed: 50
  };

  return progressMap[status] || 0;
};

/**
 * Get timeline steps for status stepper
 */
export const getTimelineSteps = () => {
  return [
    { key: 'pending', label: 'Created', icon: '📝' },
    { key: 'accepted', label: 'Accepted', icon: '✅' },
    { key: 'funded', label: 'Funded', icon: '💰' },
    { key: 'delivered', label: 'Delivered', icon: '📦' },
    { key: 'completed', label: 'Confirmed', icon: '👍' },
    { key: 'paid_out', label: 'Paid Out', icon: '💸' }
  ];
};

/**
 * Check if status is terminal (can't change)
 */
export const isTerminalStatus = (status) => {
  return ['completed', 'paid_out', 'cancelled', 'disputed'].includes(status);
};

/**
 * Check if user can cancel escrow
 */
export const canCancel = (status, userRole) => {
  // Can only cancel before funding
  return ['pending', 'accepted'].includes(status);
};

/**
 * Check if user can raise dispute
 */
export const canDispute = (status) => {
  // Can dispute after funding but before completion
  return ['funded', 'delivered'].includes(status);
};
