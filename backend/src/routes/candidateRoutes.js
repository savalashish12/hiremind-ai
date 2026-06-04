const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../config/multer");
const {
  generateCoverLetter,
  toggleSavedJob,
  getSavedJobs,
  deleteSavedJob,
  getPortfolio,
  savePortfolio,
  uploadCredentials,
  viewDocument,
} = require("../controllers/candidateController");

// Public candidate document/resume proxy viewer
router.get("/document", viewDocument);

// Public candidate portfolio lookup
router.get("/portfolio/:candidateId", getPortfolio);

// Private protected candidate endpoints
router.post("/cover-letter", protect, authorizeRoles("CANDIDATE"), generateCoverLetter);
router.post("/saved-jobs/:jobId", protect, authorizeRoles("CANDIDATE"), toggleSavedJob);
router.get("/saved-jobs", protect, authorizeRoles("CANDIDATE"), getSavedJobs);
router.delete("/saved-jobs/:jobId", protect, authorizeRoles("CANDIDATE"), deleteSavedJob);
router.get("/portfolio", protect, authorizeRoles("CANDIDATE"), getPortfolio);
router.post("/portfolio", protect, authorizeRoles("CANDIDATE"), savePortfolio);
router.patch("/portfolio", protect, authorizeRoles("CANDIDATE"), savePortfolio);
router.post(
  "/upload-credentials",
  protect,
  authorizeRoles("CANDIDATE"),
  upload.fields([
    { name: "degree", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
  ]),
  uploadCredentials
);

module.exports = router;
