const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../config/multer");

const {
  getInterviewQuestions,
  compareTwoCandidates,
  getResumeSuggestions,
  getCareerRoadmap,
  getAIJobRecommendations,
  uploadCompanyDocument,
  getCompanyDocuments,
  deleteCompanyDocument,
  askKnowledgeAssistant,
} = require("../controllers/aiController");

const { sanitizeInput } = require("../middleware/validationMiddleware");

// Recruiter AI tools
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

// Recruiter Knowledge Hub (RAG)
router.post(
  "/knowledge/upload",
  protect,
  authorizeRoles("RECRUITER"),
  upload.single("file"),
  uploadCompanyDocument
);

router.get(
  "/knowledge/documents",
  protect,
  authorizeRoles("RECRUITER"),
  getCompanyDocuments
);

router.delete(
  "/knowledge/documents/:id",
  protect,
  authorizeRoles("RECRUITER"),
  deleteCompanyDocument
);

router.post(
  "/knowledge/ask",
  protect,
  authorizeRoles("RECRUITER"),
  sanitizeInput,
  askKnowledgeAssistant
);

// Candidate AI tools
router.get(
  "/resume-suggestions",
  protect,
  authorizeRoles("CANDIDATE"),
  getResumeSuggestions
);

router.get(
  "/career-roadmap",
  protect,
  authorizeRoles("CANDIDATE"),
  getCareerRoadmap
);

router.get(
  "/job-recommendations",
  protect,
  authorizeRoles("CANDIDATE"),
  getAIJobRecommendations
);

module.exports = router;
