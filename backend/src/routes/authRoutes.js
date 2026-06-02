const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  registerUser,
  loginUser,
  updateCandidateProfile,
  getUserProfile,
} = require('../controllers/authController');

const {
  sanitizeInput,
  validateRegistration,
  validateLogin,
} = require('../middleware/validationMiddleware');

router.post('/register', sanitizeInput, validateRegistration, registerUser);
router.post('/login', sanitizeInput, validateLogin, loginUser);

router.get('/profile', protect, getUserProfile);
router.put(
  '/candidate/profile',
  protect,
  authorizeRoles('CANDIDATE'),
  sanitizeInput,
  updateCandidateProfile
);

module.exports = router;