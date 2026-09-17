const express = require("express");
const router = express.Router();
const upload = require('../config/multer');

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  rankCandidates,
  getPipeline,
  movePipelineStage,
  getCompanyProfile,
  createCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  getDashboardStats,
  getCalendarInterviews,
} = require("../controllers/recruiterController");

// Public company profile lookup
router.get("/company-profile/:recruiterId", getCompanyProfile);

// Recruiter AI Candidate Ranking
router.post("/rank-candidates", protect, authorizeRoles("RECRUITER"), rankCandidates);

// Kanban board pipeline endpoints
router.get("/pipeline/:jobId", protect, authorizeRoles("RECRUITER"), getPipeline);
router.patch("/pipeline/move", protect, authorizeRoles("RECRUITER"), movePipelineStage);

// Company Profile CRUD
router.get("/company-profile", protect, authorizeRoles("RECRUITER"), getCompanyProfile);
router.post("/company-profile", protect, authorizeRoles("RECRUITER"), createCompanyProfile);
router.patch("/company-profile", protect, authorizeRoles("RECRUITER"), updateCompanyProfile);
router.post(
  "/company-profile/logo",
  protect,
  authorizeRoles("RECRUITER"),
  upload.single("logo"),
  uploadCompanyLogo
);

// Recruiter Dashboard Stats
router.get("/dashboard/stats", protect, authorizeRoles("RECRUITER"), getDashboardStats);

// Interview Calendar
router.get("/interviews/calendar", protect, authorizeRoles("RECRUITER"), getCalendarInterviews);

module.exports = router;
