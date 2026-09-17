const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  getPayeeConfig,
  createManualOrder,
  submitManualPayment,
  getMyPayments,
  getPendingPayments,
  approvePayment,
  rejectPayment,
} = require("../controllers/manualPaymentController");

router.use(protect);

router.get("/payee", getPayeeConfig);
router.post("/create", createManualOrder);
router.post("/submit", submitManualPayment);
router.get("/history", getMyPayments);

// Admin verification queue
router.get("/admin/pending", authorizeRoles("ADMIN"), getPendingPayments);
router.post("/admin/:id/approve", authorizeRoles("ADMIN"), approvePayment);
router.post("/admin/:id/reject", authorizeRoles("ADMIN"), rejectPayment);

module.exports = router;
