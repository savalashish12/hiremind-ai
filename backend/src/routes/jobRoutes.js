const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const {
  createJob,
  getAllJobs,
  getJobById,
  getExternalJobs,
  getJobApplicants,
  getRecruiterJobs,
  getRecruiterAnalytics,
  updateJob,
  deleteJob,
} = require('../controllers/jobController');

router.post(
  '/',
  protect,
  authorizeRoles('RECRUITER'),
  createJob
);

router.get('/external', getExternalJobs);
router.get('/', getAllJobs);

router.get(
  '/my-jobs',
  protect,
  authorizeRoles('RECRUITER'),
  getRecruiterJobs
);


router.get(
  '/analytics/dashboard',

  protect,

  authorizeRoles(
    'RECRUITER'
  ),

  getRecruiterAnalytics
);


router.get(
  '/:jobId/applicants',
  protect,
  authorizeRoles('RECRUITER'),
  getJobApplicants
);

// Public single-job detail (shareable Naukri-style URL).
// Kept AFTER all literal GET routes (/external, /my-jobs, /analytics/...)
// so they are not shadowed by the :jobId param.
router.get(
  '/:jobId',
  getJobById
);

router.put(
  '/:jobId',
  protect,
  authorizeRoles('RECRUITER'),
  updateJob
);

router.delete(
  '/:jobId',
  protect,
  authorizeRoles('RECRUITER'),
  deleteJob
);

module.exports = router;