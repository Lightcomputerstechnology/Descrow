const Chat = require('../models/Chat.model');
const Escrow = require('../models/Escrow.model');
const { validationResult } = require('express-validator');

// Send Message
exports.sendMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { escrowId, message, attachments } = req.body;

    // Find escrow
    const escrow = await Escrow.findOne({ escrowId });
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Check if chat is unlocked
    if (!escrow.chatUnlocked) {
      return res.status(403).json({
        success: false,
        message: 'Chat is locked until payment is confirmed'
      });
    }

    // Verify user is part of this escrow
    const userId = req.user._id.toString();
    if (escrow.buyer.toString() !== userId && escrow.seller.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    // Create or get chat
    let chat = await Chat.findOne({ escrow: escrow._id });
    if (!chat) {
      chat = await Chat.create({
        escrow: escrow._id,
        participants: [escrow.buyer, escrow.seller],
        messages: []
      });
    }

    // Add message
    chat.messages.push({
      sender: req.user._id,
      message,
      attachments: attachments || [],
      timestamp: new Date()
    });

    chat.lastMessage = message;
    chat.lastMessageAt = new Date();
    await chat.save();

    // Populate sender info
    await chat.populate('messages.sender', 'name avatar');

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      chat: chat.messages[chat.messages.length - 1]
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
      error: error.message
    });
  }
};

// Get Chat Messages
exports.getChatMessages = async (req, res) => {
  try {
    const { escrowId } = req.params;

    // Find escrow
    const escrow = await Escrow.findOne({ escrowId });
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    // Verify user is part of this escrow
    const userId = req.user._id.toString();
    if (escrow.buyer.toString() !== userId && escrow.seller.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this chat'
      });
    }

    // Get chat
    let chat = await Chat.findOne({ escrow: escrow._id })
      .populate('messages.sender', 'name avatar');

    if (!chat) {
      // Return empty chat if doesn't exist yet
      return res.status(200).json({
        success: true,
        chat: {
          escrow: escrow._id,
          messages: [],
          chatUnlocked: escrow.chatUnlocked
        }
      });
    }

    res.status(200).json({
      success: true,
      chat: {
        ...chat.toObject(),
        chatUnlocked: escrow.chatUnlocked
      }
    });

  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat messages',
      error: error.message
    });
  }
};

// Mark Messages as Read
exports.markAsRead = async (req, res) => {
  try {
    const { escrowId } = req.params;

    const escrow = await Escrow.findOne({ escrowId });
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    const chat = await Chat.findOne({ escrow: escrow._id });
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Mark all messages as read for current user
    chat.messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString()) {
        msg.read = true;
      }
    });

    await chat.save();

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
};
