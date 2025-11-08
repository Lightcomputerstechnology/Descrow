const Notification = require('../models/Notification');

/**
 * Create a notification for a user
 */
const createNotification = async (userId, type, title, message, link, metadata = {}) => {
  try {
    await Notification.create({
      user: userId,
      type,
      title,
      message,
      link,
      metadata
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Notify both parties in an escrow transaction
 */
const notifyEscrowParties = async (escrow, type, buyerMessage, sellerMessage) => {
  const link = `/escrow/${escrow._id}`;
  
  // Notify buyer
  await createNotification(
    escrow.buyer,
    type,
    `Escrow #${escrow._id.toString().slice(-6)}`,
    buyerMessage,
    link,
    { escrowId: escrow._id, amount: escrow.amount }
  );

  // Notify seller
  await createNotification(
    escrow.seller,
    type,
    `Escrow #${escrow._id.toString().slice(-6)}`,
    sellerMessage,
    link,
    { escrowId: escrow._id, amount: escrow.amount }
  );
};

module.exports = { createNotification, notifyEscrowParties };
