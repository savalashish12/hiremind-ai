const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getATSAnalysis } = require("../controllers/atsController");

router.post(
  "/analyze",
  protect,
  authorizeRoles("CANDIDATE"),
  getATSAnalysis
);

module.exports = router;
