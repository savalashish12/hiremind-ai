const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorizeRoles = require('../middleware/roleMiddleware');
const prisma = require('../config/prisma');
const logActivity = require('../utils/activityLogger');

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

    logActivity({ userId: req.user.id, action: isSuspended ? 'USER_SUSPENDED' : 'USER_ACTIVATED', entity: 'User', entityId: id, details: `${user.email} ${isSuspended ? 'suspended' : 'activated'} by admin`, req });

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

    const deletedEmail = user.email;
    await prisma.user.delete({ where: { id } });

    logActivity({ userId: req.user.id, action: 'USER_DELETED', entity: 'User', entityId: id, details: `${deletedEmail} deleted by admin`, req });

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

    const deletedTitle = job.title;
    await prisma.job.delete({ where: { id } });

    logActivity({ userId: req.user.id, action: 'JOB_DELETED', entity: 'Job', entityId: id, details: `"${deletedTitle}" deleted by admin`, req });

    res.json({ message: 'Job posting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Activity Logs (paginated + filters)
router.get('/activity-logs', protect, authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { action, search, startDate, endDate, page = 1, limit = 25 } = req.query;
    const where = {};
    if (action && action !== 'ALL') where.action = action;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { userId: { contains: search, mode: 'insensitive' } },
        { details: { contains: search, mode: 'insensitive' } },
        { action: { contains: search, mode: 'insensitive' } },
      ];
    }
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    // Attach user info (best-effort; users may have been deleted)
    const userIds = [...new Set(logs.map((l) => l.userId))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true, email: true, role: true },
    });
    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));
    res.json({
      logs: logs.map((l) => ({ ...l, user: userMap[l.userId] || null })),
      pagination: { total, page: pageNum, limit: pageSize, pages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
