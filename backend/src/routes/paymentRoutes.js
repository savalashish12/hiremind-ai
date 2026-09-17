const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const {
  createOrder,
  verifyPayment,
  handleWebhook
} = require('../controllers/paymentController');

// Protected endpoints
router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifyPayment);

// Public webhook endpoint for Razorpay asynchronous calls
router.post('/webhook', handleWebhook);

module.exports = router;
