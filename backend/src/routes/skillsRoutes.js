const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getSkillGapAnalysis } = require("../controllers/skillsController");

router.post(
  "/gap-analysis",
  protect,
  authorizeRoles("CANDIDATE"),
  getSkillGapAnalysis
);

module.exports = router;
