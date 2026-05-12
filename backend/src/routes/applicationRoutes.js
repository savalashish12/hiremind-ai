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

module.exports = router;