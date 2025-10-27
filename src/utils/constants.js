// Escrow Status
export const ESCROW_STATUS = {
  IN_ESCROW: 'in_escrow',
  AWAITING_DELIVERY: 'awaiting_delivery',
  COMPLETED: 'completed',
  DISPUTED: 'disputed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
};

// User Tiers
export const USER_TIERS = {
  FREE: {
    name: 'free',
    maxTransactionAmount: 500,
    maxTransactionsPerMonth: 5,
    transactionFee: 0.05, // 5%
    price: 0
  },
  BASIC: {
    name: 'basic',
    maxTransactionAmount: 5000,
    maxTransactionsPerMonth: 50,
    transactionFee: 0.03, // 3%
    price: 10
  },
  PRO: {
    name: 'pro',
    maxTransactionAmount: 50000,
    maxTransactionsPerMonth: -1, // Unlimited
    transactionFee: 0.02, // 2%
    price: 50
  },
  ENTERPRISE: {
    name: 'enterprise',
    maxTransactionAmount: -1, // Unlimited
    maxTransactionsPerMonth: -1, // Unlimited
    transactionFee: 0.015, // 1.5%
    price: null // Custom pricing
  }
};

// Delivery Methods
export const DELIVERY_METHODS = {
  COURIER: 'courier',
  PERSONAL: 'personal',
  OTHER: 'other'
};

// Courier Companies
export const COURIER_COMPANIES = [
  'DHL Express',
  'FedEx',
  'UPS',
  'USPS',
  'China Post',
  'SF Express',
  'Aramex',
  'TNT',
  'Other'
];

// Vehicle Types
export const VEHICLE_TYPES = [
  { value: 'car', label: 'Car' },
  { value: 'motorcycle', label: 'Motorcycle' },
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'bicycle', label: 'Bicycle' }
];

// Dispute Reasons
export const DISPUTE_REASONS = [
  { value: 'not_received', label: 'Item Not Received' },
  { value: 'wrong_item', label: 'Wrong Item Delivered' },
  { value: 'damaged', label: 'Item Damaged/Defective' },
  { value: 'not_as_described', label: 'Item Not As Described' },
  { value: 'counterfeit', label: 'Counterfeit/Fake Item' },
  { value: 'other', label: 'Other Issue' }
];

// Supported Currencies
export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' }
];

// Payment Methods
export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_TRANSFER: 'bank_transfer',
  MOBILE_MONEY: 'mobile_money',
  PAYPAL: 'paypal',
  CRYPTO: 'crypto'
};

// Auto-release duration (in days)
export const AUTO_RELEASE_DAYS = 3;

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB in bytes
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg', 'video/quicktime'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Notification Types
export const NOTIFICATION_TYPES = {
  PAYMENT_RECEIVED: 'payment_received',
  ITEM_SHIPPED: 'item_shipped',
  DELIVERY_CONFIRMED: 'delivery_confirmed',
  PAYMENT_RELEASED: 'payment_released',
  DISPUTE_OPENED: 'dispute_opened',
  DISPUTE_RESOLVED: 'dispute_resolved',
  MESSAGE_RECEIVED: 'message_received'
};

// User Roles
export const USER_ROLES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin'
};

// API Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  INSUFFICIENT_FUNDS: 'Insufficient funds in escrow.',
  TRANSACTION_LIMIT_REACHED: 'You have reached your transaction limit for this tier.',
  INVALID_SIGNATURE: 'Invalid signature. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  ESCROW_CREATED: 'Escrow created successfully!',
  PAYMENT_COMPLETED: 'Payment completed successfully!',
  DELIVERY_PROOF_UPLOADED: 'Delivery proof uploaded successfully!',
  DELIVERY_CONFIRMED: 'Delivery confirmed! Payment released to seller.',
  DISPUTE_SUBMITTED: 'Dispute submitted successfully. Our team will review it.',
  MESSAGE_SENT: 'Message sent successfully!'
};

export default {
  ESCROW_STATUS,
  USER_TIERS,
  DELIVERY_METHODS,
  COURIER_COMPANIES,
  VEHICLE_TYPES,
  DISPUTE_REASONS,
  CURRENCIES,
  PAYMENT_METHODS,
  AUTO_RELEASE_DAYS,
  FILE_LIMITS,
  NOTIFICATION_TYPES,
  USER_ROLES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
};
