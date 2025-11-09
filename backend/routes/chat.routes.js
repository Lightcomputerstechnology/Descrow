const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');
const { uploadMultiple } = require('../middleware/upload.middleware');
const { body } = require('express-validator');

// 🔒 Apply authentication to all chat routes
router.use(authenticate);

/**
 * @route   GET /api/v1/chat/unread-count
 * @desc    Get total unread messages for current user
 */
router.get('/unread-count', chatController.getUnreadCount);

/**
 * @route   GET /api/v1/chat/:escrowId/messages
 * @desc    Fetch all messages for a specific escrow
 */
router.get('/:escrowId/messages', chatController.getMessages);

/**
 * @route   POST /api/v1/chat/:escrowId/messages
 * @desc    Send a new message (with optional attachments)
 */
router.post(
  '/:escrowId/messages',
  uploadMultiple('attachments', 3),
  [
    body('message')
      .trim()
      .notEmpty()
      .withMessage('Message content is required')
  ],
  async (req, res) => {
    req.body.attachments = req.fileUrls || [];
    await chatController.sendMessage(req, res);
  }
);

module.exports = router;
