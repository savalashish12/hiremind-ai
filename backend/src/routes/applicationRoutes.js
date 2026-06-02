const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const upload = require('../config/multer');

const {
  applyToJob,
  uploadResume,
  getMyApplications,
  updateApplicationStatus,
  updateRecruiterNotes,
  scheduleInterview,
  generateOfferLetter,
  downloadOfferLetter,
} = require(
  "../controllers/applicationController"
);

router.post(
  '/apply',
  protect,
  authorizeRoles('CANDIDATE'),
  applyToJob
);

router.post(
  '/upload-resume',
  protect,
  authorizeRoles('CANDIDATE'),
  upload.single('resume'),
  uploadResume
);

router.get(
  "/my-applications",
  protect,
  authorizeRoles(
    "CANDIDATE"
  ),
  getMyApplications
);

router.put(
  "/:applicationId/status",

  protect,

  authorizeRoles(
    "RECRUITER"
  ),

  updateApplicationStatus
);

router.put(
  "/:applicationId/notes",
  protect,
  authorizeRoles("RECRUITER"),
  updateRecruiterNotes
);

router.put(
  "/:applicationId/interview",
  protect,
  authorizeRoles("RECRUITER"),
  scheduleInterview
);

router.post(
  "/:applicationId/offer-letter",
  protect,
  authorizeRoles("RECRUITER"),
  generateOfferLetter
);

router.get(
  "/:applicationId/offer-letter/download",
  protect,
  downloadOfferLetter
);

module.exports = router;