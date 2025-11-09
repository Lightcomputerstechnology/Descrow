const express = require('express');
const router = express.Router();
const escrowController = require('../controllers/escrow.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { createEscrowValidator } = require('../validators/escrow.validator');

// 🔒 Apply authentication to all escrow routes
router.use(authenticate);

/**
 * @route   POST /api/v1/escrows/create
 * @desc    Create a new escrow transaction
 */
router.post('/create', createEscrowValidator, escrowController.createEscrow);

/**
 * @route   GET /api/v1/escrows/my-escrows
 * @desc    Get all escrows for the authenticated user
 */
router.get('/my-escrows', escrowController.getMyEscrows);

/**
 * @route   GET /api/v1/escrows/dashboard-stats
 * @desc    Get dashboard statistics for the user
 */
router.get('/dashboard-stats', escrowController.getDashboardStats);

/**
 * @route   GET /api/v1/escrows/calculate-fees
 * @desc    Preview escrow service fees before creating
 */
router.get('/calculate-fees', escrowController.calculateFeePreview);

/**
 * @route   GET /api/v1/escrows/:id
 * @desc    Get details of a single escrow by ID
 */
router.get('/:id', escrowController.getEscrowById);

/**
 * @route   POST /api/v1/escrows/:id/accept
 * @desc    Accept an escrow offer (seller action)
 */
// router.post('/:id/accept', isSeller, escrowController.acceptEscrow);
router.post('/:id/accept', escrowController.acceptEscrow);

/**
 * @route   POST /api/v1/escrows/:id/fund
 * @desc    Fund escrow (buyer action)
 */
// router.post('/:id/fund', isBuyer, escrowController.fundEscrow);
router.post('/:id/fund', escrowController.fundEscrow);

/**
 * @route   POST /api/v1/escrows/:id/deliver
 * @desc    Mark escrow item as delivered (seller action)
 */
// router.post('/:id/deliver', isSeller, escrowController.markDelivered);
router.post('/:id/deliver', escrowController.markDelivered);

/**
 * @route   POST /api/v1/escrows/:id/confirm
 * @desc    Confirm delivery (buyer action)
 */
// router.post('/:id/confirm', isBuyer, escrowController.confirmDelivery);
router.post('/:id/confirm', escrowController.confirmDelivery);

/**
 * @route   POST /api/v1/escrows/:id/dispute
 * @desc    Raise a dispute for the escrow (either party)
 */
router.post('/:id/dispute', escrowController.raiseDispute);

/**
 * @route   POST /api/v1/escrows/:id/cancel
 * @desc    Cancel escrow (allowed before funding)
 */
router.post('/:id/cancel', escrowController.cancelEscrow);

module.exports = router;
