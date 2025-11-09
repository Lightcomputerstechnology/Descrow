const Chat = require('../models/Chat.model');
const Escrow = require('../models/Escrow.model');
const { createNotification } = require('../utils/notificationHelper');

/**
 * Get messages for an escrow
 */
exports.getMessages = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 50 } = req.query;

    // Verify user is part of the escrow
    const escrow = await Escrow.findById(escrowId);
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    const isBuyer = escrow.buyer.toString() === userId;
    const isSeller = escrow.seller.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat'
      });
    }

    // Fetch messages
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [messages, total] = await Promise.all([
      Chat.find({ escrow: escrowId })
        .populate('sender', 'name profilePicture')
        .sort({ createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Chat.countDocuments({ escrow: escrowId })
    ]);

    // Mark messages as read
    await Chat.updateMany(
      { 
        escrow: escrowId, 
        sender: { $ne: userId },
        isRead: false 
      },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch messages'
    });
  }
};

/**
 * Send a message
 */
exports.sendMessage = async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { message, attachments } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty'
      });
    }

    // Verify user is part of the escrow
    const escrow = await Escrow.findById(escrowId).populate('buyer seller', 'name');
    if (!escrow) {
      return res.status(404).json({
        success: false,
        message: 'Escrow not found'
      });
    }

    const isBuyer = escrow.buyer._id.toString() === userId;
    const isSeller = escrow.seller._id.toString() === userId;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this chat'
      });
    }

    // Create message
    const chat = await Chat.create({
      escrow: escrowId,
      sender: userId,
      message: message.trim(),
      attachments: attachments || []
    });

    await chat.populate('sender', 'name profilePicture');

    // Notify other party
    const otherParty = isBuyer ? escrow.seller : escrow.buyer;
    await createNotification(
      otherParty._id,
      'message_received',
      'New Message',
      `${req.user.name} sent you a message in escrow #${escrow._id.toString().slice(-6)}`,
      `/escrow/${escrow._id}`,
      { escrowId: escrow._id }
    );

    res.status(201).json({
      success: true,
      data: chat
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send message'
    });
  }
};

/**
 * Get unread message count for user
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all escrows where user is buyer or seller
    const escrows = await Escrow.find({
      $or: [{ buyer: userId }, { seller: userId }]
    }).select('_id');

    const escrowIds = escrows.map(e => e._id);

    // Count unread messages
    const unreadCount = await Chat.countDocuments({
      escrow: { $in: escrowIds },
      sender: { $ne: userId },
      isRead: false
    });

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch unread count'
    });
  }
};
