const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  streamNotifications,
} = require('../controllers/notificationController');

// SSE stream authenticates via ?token= (EventSource can't set headers)
router.get('/stream', streamNotifications);
router.get('/', protect, getNotifications);
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
