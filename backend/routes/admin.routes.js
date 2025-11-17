// backend/routes/admin.routes.js - COMPLETE MERGED VERSION
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protectAdmin, checkPermission, masterOnly } = require('../middleware/admin.middleware');
const { body } = require('express-validator');

// ======================================================
// =============== PUBLIC ADMIN ROUTES ==================
// ======================================================

// Admin Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  adminController.login
);

// ======================================================
// =============== PROTECTED ADMIN ROUTES ===============
// ======================================================

// Dashboard Overview
router.get(
  '/dashboard',
  protectAdmin,
  adminController.getDashboardStats
);

// ----------------- Transactions -----------------
router.get(
  '/transactions',
  protectAdmin,
  checkPermission('viewTransactions'),
  adminController.getTransactions
);

// ----------------- Disputes -----------------
router.get(
  '/disputes',
  protectAdmin,
  checkPermission('manageDisputes'),
  adminController.getDisputes
);

router.put(
  '/disputes/:disputeId/resolve',
  protectAdmin,
  checkPermission('manageDisputes'),
  adminController.resolveDispute
);

// ----------------- Users -----------------
router.get(
  '/users',
  protectAdmin,
  checkPermission('verifyUsers'),
  adminController.getUsers
);

router.put(
  '/users/:userId/tier',
  protectAdmin,
  checkPermission('verifyUsers'),
  adminController.changeUserTier
);

router.put(
  '/users/:userId/kyc',
  protectAdmin,
  checkPermission('verifyUsers'),
  adminController.reviewKYC
);

router.put(
  '/users/:userId/toggle-status',
  protectAdmin,
  checkPermission('verifyUsers'),
  adminController.toggleUserStatus
);

// ----------------- Analytics & Stats -----------------
router.get(
  '/analytics',
  protectAdmin,
  checkPermission('viewAnalytics'),
  adminController.getAnalytics
);

router.get(
  '/platform-stats',
  protectAdmin,
  checkPermission('viewAnalytics'),
  adminController.getPlatformStats
);

// ======================================================
// ========== ADMIN MANAGEMENT (MASTER ONLY) ============
// ======================================================

// Get all admins
router.get(
  '/admins',
  protectAdmin,
  masterOnly,
  adminController.getAdmins
);

// Create new sub-admin
router.post(
  '/admins',
  protectAdmin,
  masterOnly,
  [
    body('name').notEmpty().withMessage('Name required'),
    body('email').isEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  adminController.createSubAdmin
);

// Update sub-admin permissions
router.put(
  '/admins/:adminId/permissions',
  protectAdmin,
  masterOnly,
  adminController.updateSubAdminPermissions
);

// Toggle sub-admin active/suspended state
router.put(
  '/admins/:adminId/toggle-status',
  protectAdmin,
  masterOnly,
  adminController.toggleAdminStatus
);

// Delete sub-admin
router.delete(
  '/admins/:adminId',
  protectAdmin,
  masterOnly,
  adminController.deleteSubAdmin
);

// ======================================================
// =========== FEE MANAGEMENT (MASTER ONLY) =============
// ======================================================

// Get current fee settings
router.get(
  '/fees',
  protectAdmin,
  masterOnly,
  adminController.getFeeSettings
);

// Update individual fee setting
router.put(
  '/fees/update',
  protectAdmin,
  masterOnly,
  [
    body('tier').isIn(['starter', 'growth', 'enterprise', 'api']).withMessage('Invalid tier'),
    body('feeType').isIn(['fees', 'monthlyCost', 'setupFee', 'maxTransactionAmount', 'maxTransactionsPerMonth']).withMessage('Invalid fee type'),
    body('value').notEmpty().withMessage('Value required')
  ],
  adminController.updateFeeSettings
);

// Bulk update tier fees
router.put(
  '/fees/bulk-update',
  protectAdmin,
  masterOnly,
  [
    body('tier').isIn(['starter', 'growth', 'enterprise', 'api']).withMessage('Invalid tier'),
    body('updates').isObject().withMessage('Updates object required')
  ],
  adminController.bulkUpdateTierFees
);

// Update gateway costs
router.put(
  '/fees/gateway-costs',
  protectAdmin,
  masterOnly,
  [
    body('gateway').isIn(['paystack', 'flutterwave', 'crypto']).withMessage('Invalid gateway'),
    body('field').notEmpty().withMessage('Field required'),
    body('value').notEmpty().withMessage('Value required')
  ],
  adminController.updateGatewayCosts
);

// Get fee settings history
router.get(
  '/fees/history',
  protectAdmin,
  masterOnly,
  adminController.getFeeSettingsHistory
);

// Reset fees to default
router.post(
  '/fees/reset',
  protectAdmin,
  masterOnly,
  [
    body('tier').isIn(['starter', 'growth', 'enterprise', 'api', 'all']).withMessage('Invalid tier')
  ],
  adminController.resetFeesToDefault
);

module.exports = router;