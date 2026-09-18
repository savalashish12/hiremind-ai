const prisma = require('../config/prisma');
const { pushToUser } = require('./sseManager');

const createNotification = async (userId, title, message) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
    // Real-time push if the user has an open SSE stream (never throws)
    pushToUser(userId, { type: 'notification', title, message, notification });
    return notification;
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
  }
};

module.exports = {
  createNotification,
};
