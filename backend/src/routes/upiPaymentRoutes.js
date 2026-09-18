const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const {
  createUpiOrder,
  processUpiPayment,
  getPaymentHistory,
  getAdminPaymentStats,
  downloadInvoice,
} = require('../controllers/upiPaymentController');

// All payment route interactions are protected by authorization check
router.use(protect);

router.post('/create', createUpiOrder);
router.post('/process', processUpiPayment);
router.get('/history', getPaymentHistory);
router.get('/invoice/:paymentId', downloadInvoice);

// Admin exclusive reporting API
router.get('/admin/stats', authorizeRoles('ADMIN'), getAdminPaymentStats);

module.exports = router;
