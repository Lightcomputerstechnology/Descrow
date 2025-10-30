const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protectAdmin, checkPermission, masterOnly } = require('../middleware/admin.middleware');
const { body } = require('express-validator');

// Public route
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
  ],
  adminController.login
);

// Protected admin routes
router.get('/dashboard', protectAdmin, adminController.getDashboardStats);

// Transactions
router.get('/transactions', protectAdmin, checkPermission('viewTransactions'), adminController.getTransactions);

// Disputes
router.get('/disputes', protectAdmin, checkPermission('manageDisputes'), adminController.getDisputes);
router.put('/disputes/:disputeId/resolve', protectAdmin, checkPermission('manageDisputes'), adminController.resolveDispute);

// Users
router.get('/users', protectAdmin, checkPermission('verifyUsers'), adminController.getUsers);
router.put('/users/:userId/verify', protectAdmin, checkPermission('verifyUsers'), adminController.verifyUser);
router.put('/users/:userId/toggle-status', protectAdmin, checkPermission('verifyUsers'), adminController.toggleUserStatus);

// Analytics
router.get('/analytics', protectAdmin, checkPermission('viewAnalytics'), adminController.getAnalytics);

// Admin Management (Master only)
router.get('/admins', protectAdmin, masterOnly, adminController.getAdmins);
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
router.put('/admins/:adminId/permissions', protectAdmin, masterOnly, adminController.updateSubAdminPermissions);
router.put('/admins/:adminId/toggle-status', protectAdmin, masterOnly, adminController.toggleAdminStatus);
router.delete('/admins/:adminId', protectAdmin, masterOnly, adminController.deleteSubAdmin);

module.exports = router;
