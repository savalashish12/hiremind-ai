const express = require('express');

const router = express.Router();

const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');

const {
  createJob,
  getAllJobs,
  getJobApplicants,
  getRecruiterJobs,
  getRecruiterAnalytics,
} = require('../controllers/jobController');

router.post(
  '/',
  protect,
  authorizeRoles('RECRUITER'),
  createJob
);

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

module.exports = router;