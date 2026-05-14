const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const prisma = require('../config/prisma');

// Admin Analytics
router.get('/analytics', protect, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeRecruiters = await prisma.user.count({ where: { role: 'RECRUITER' } });
    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.application.count();

    res.json({ totalUsers, activeRecruiters, totalJobs, totalApplications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage Users
router.get('/users', protect, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, fullName: true, email: true, role: true, createdAt: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete User
router.delete('/users/:id', protect, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Simplistic delete for demonstration (in production use soft delete)
    await prisma.user.delete({ where: { id } });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
