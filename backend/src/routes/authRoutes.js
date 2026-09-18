const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const {
  registerUser,
  loginUser,
  updateCandidateProfile,
  getUserProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');

const {
  sanitizeInput,
  validateRegistration,
  validateLogin,
} = require('../middleware/validationMiddleware');

router.post('/register', sanitizeInput, validateRegistration, registerUser);
router.post('/login', sanitizeInput, validateLogin, loginUser);

// Email verification + password recovery (rate-limited via authLimiter in app.js)
router.post('/verify-email/:token', verifyEmail);
router.post('/resend-verification', sanitizeInput, resendVerification);
router.post('/forgot-password', sanitizeInput, forgotPassword);
router.post('/reset-password', sanitizeInput, resetPassword);

router.get('/profile', protect, getUserProfile);
router.put(
  '/candidate/profile',
  protect,
  authorizeRoles('CANDIDATE'),
  sanitizeInput,
  updateCandidateProfile
);

module.exports = router;