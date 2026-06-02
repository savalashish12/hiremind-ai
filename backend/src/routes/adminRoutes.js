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
    const totalCandidates = await prisma.user.count({ where: { role: 'CANDIDATE' } });
    const totalJobs = await prisma.job.count();
    const totalApplications = await prisma.application.count();

    res.json({ totalUsers, activeRecruiters, totalCandidates, totalJobs, totalApplications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Manage Users (Detailed list)
router.get('/users', protect, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        isSuspended: true,
        createdAt: true,
        candidateProfile: true,
        recruiterProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Suspend/Unsuspend User
router.put('/users/:id/suspend', protect, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'Cannot suspend an Administrator account' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isSuspended },
    });

    res.json({ message: `User account is now ${isSuspended ? 'suspended' : 'activated'}`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete User Account
router.delete('/users/:id', protect, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'ADMIN') {
      return res.status(400).json({ message: 'Cannot delete an Administrator account' });
    }

    // Delete related profiles, jobs, applications first (cascading deletes)
    await prisma.candidateProfile.deleteMany({ where: { userId: id } });
    await prisma.recruiterProfile.deleteMany({ where: { userId: id } });
    
    // If they were a recruiter, delete their jobs first
    const recruiterJobs = await prisma.job.findMany({ where: { recruiterId: id } });
    const recruiterJobIds = recruiterJobs.map(j => j.id);
    
    await prisma.application.deleteMany({ where: { jobId: { in: recruiterJobIds } } });
    await prisma.job.deleteMany({ where: { recruiterId: id } });
    
    // If they were a candidate, delete their applications
    await prisma.application.deleteMany({ where: { candidateId: id } });

    await prisma.user.delete({ where: { id } });

    res.json({ message: 'User and all related profiles and data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// View all jobs
router.get('/jobs', protect, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        recruiter: {
          select: { fullName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete any job posting
router.delete('/jobs/:id', protect, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;

    const job = await prisma.job.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Delete related applications first
    await prisma.application.deleteMany({ where: { jobId: id } });
    await prisma.savedJob.deleteMany({ where: { jobId: id } });

    await prisma.job.delete({ where: { id } });

    res.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Activity Logs
router.get('/activity-logs', protect, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
