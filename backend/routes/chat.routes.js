const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const chatController = require('../controllers/chat.controller');
const { protect } = require('../middleware/auth.middleware');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/chat-files/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
  }
});

// Get messages for an escrow
router.get('/:escrowId/messages', protect, chatController.getMessages);

// Send a message
router.post('/:escrowId/messages', protect, chatController.sendMessage);

// Upload file in chat
router.post('/:escrowId/upload',
  protect,
  upload.single('file'),
  chatController.uploadFile
);

module.exports = router;
