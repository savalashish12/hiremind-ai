const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  startInterview,
  evaluateInterview,
  saveInterview,
  getInterviewHistory,
  getInterviewReport,
  generateMcqTest,
  evaluateMcqTest,
  saveMcqTest,
} = require("../controllers/interviewController");

router.post("/start", protect, authorizeRoles("CANDIDATE"), startInterview);
router.post("/evaluate", protect, authorizeRoles("CANDIDATE"), evaluateInterview);
router.post("/save", protect, authorizeRoles("CANDIDATE"), saveInterview);
router.get("/history", protect, authorizeRoles("CANDIDATE"), getInterviewHistory);
router.get("/report/:interviewId", protect, getInterviewReport);

// MCQ Assessment System Routes
router.post("/mcq/generate", protect, authorizeRoles("CANDIDATE"), generateMcqTest);
router.post("/mcq/evaluate", protect, authorizeRoles("CANDIDATE"), evaluateMcqTest);
router.post("/mcq/save", protect, authorizeRoles("CANDIDATE"), saveMcqTest);

module.exports = router;
