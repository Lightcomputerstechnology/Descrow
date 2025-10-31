const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const chatController = require('../controllers/chat.controller');
const { uploadMultiple } = require('../middleware/upload.middleware');
const { body } = require('express-validator');

// Send message
router.post(
  '/send',
  protect,
  uploadMultiple('attachments', 3),
  [
    body('escrowId').notEmpty().withMessage('Escrow ID required'),
    body('message').notEmpty().withMessage('Message required')
  ],
  (req, res) => {
    req.body.attachments = req.fileUrls || [];
    chatController.sendMessage(req, res);
  }
);

// Get chat messages
router.get('/:escrowId', protect, chatController.getChatMessages);

// Mark messages as read
router.put('/:escrowId/read', protect, chatController.markAsRead);

module.exports = router;