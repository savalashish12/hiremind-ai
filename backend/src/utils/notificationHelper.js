const prisma = require('../config/prisma');

const createNotification = async (userId, title, message) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create in-app notification:', error);
  }
};

module.exports = {
  createNotification,
};
