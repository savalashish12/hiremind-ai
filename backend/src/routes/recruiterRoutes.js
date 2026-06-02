const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

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
} = require("../controllers/recruiterController");

// Setup simple disk storage for company logo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const uploadLogo = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
});

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
  uploadLogo.single("logo"),
  uploadCompanyLogo
);

// Recruiter Dashboard Stats
router.get("/dashboard/stats", protect, authorizeRoles("RECRUITER"), getDashboardStats);

module.exports = router;
