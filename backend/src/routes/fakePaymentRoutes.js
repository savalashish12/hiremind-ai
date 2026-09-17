const express = require('express');
const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const {
  createFakeOrder,
  processFakePayment,
  getPaymentHistory,
  getAdminPaymentStats,
  downloadInvoice,
} = require('../controllers/fakePaymentController');

// All payment route interactions are protected by authorization check
router.use(protect);

router.post('/fake/create', createFakeOrder);
router.post('/fake/process', processFakePayment);
router.get('/fake/history', getPaymentHistory);
router.get('/fake/invoice/:paymentId', downloadInvoice);

// Admin exclusive reporting API
router.get('/fake/admin/stats', authorizeRoles('ADMIN'), getAdminPaymentStats);

module.exports = router;
