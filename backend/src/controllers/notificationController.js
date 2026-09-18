const prisma = require('../config/prisma');
const jwt = require('jsonwebtoken');
const { addClient, removeClient } = require('../utils/sseManager');

// SSE stream: EventSource can't send Authorization headers,
// so the JWT arrives as ?token=<jwt> (header token also accepted).
const streamNotifications = async (req, res) => {
  try {
    const headerToken = req.headers.authorization?.split(' ')[1];
    const token = headerToken || req.query.token;
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return res.status(401).json({ message: 'User does not exist' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Account suspended.' });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    addClient(user.id, res);
    res.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

    const keepAlive = setInterval(() => {
      try { res.write(': ping\n\n'); } catch { clearInterval(keepAlive); }
    }, 30000);

    req.on('close', () => {
      clearInterval(keepAlive);
      removeClient(user.id, res);
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(401).json({ message: 'Invalid token' });
    }
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await prisma.notification.updateMany({
      where: {
        id,
        userId: req.user.id,
      },
      data: { isRead: true },
    });
    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id },
      data: { isRead: true },
    });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  streamNotifications,
};
