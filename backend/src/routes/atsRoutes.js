const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getATSAnalysis, getMatchPreview } = require("../controllers/atsController");

router.post(
  "/analyze",
  protect,
  authorizeRoles("CANDIDATE"),
  getATSAnalysis
);

router.get(
  "/match",
  protect,
  authorizeRoles("CANDIDATE"),
  getMatchPreview
);

module.exports = router;
