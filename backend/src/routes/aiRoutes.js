const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getInterviewQuestions, compareTwoCandidates } = require("../controllers/aiController");

router.get(
  "/interview-questions/:applicationId",
  protect,
  authorizeRoles("RECRUITER"),
  getInterviewQuestions
);

router.post(
  "/compare",
  protect,
  authorizeRoles("RECRUITER"),
  compareTwoCandidates
);

module.exports = router;
