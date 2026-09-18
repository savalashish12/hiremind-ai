const prisma = require('../config/prisma');

const createJob = async (req, res) => {

  try {

    const {
      title,
      description,
      location,
      salary,
      jobType,
      skillsRequired,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !salary ||
      !jobType
    ) {
      return res.status(400).json({
        message:
          "All fields are required",
      });
    }

    const job =
      await prisma.job.create({
        data: {
          title,
          description,
          location,
          salary,
          jobType,
          skillsRequired,
          recruiterId:
            req.user.id,
        },
      });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "JOB_CREATED",
        details: `Job "${title}" was created by recruiter "${req.user.fullName}"`,
        userId: req.user.id,
      },
    });

    res.status(201).json(job);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, location, jobType, skills, status } = req.query;

    const where = {};

    // Public board defaults to OPEN roles only; explicit ?status=ALL overrides.
    if (status && status !== 'ALL') {
      where.status = status;
    } else if (!status) {
      where.status = 'OPEN';
    }

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (jobType && jobType !== 'ALL') {
      where.jobType = jobType;
    }

    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? skills
        : skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        where.skillsRequired = { hasSome: skillsArray };
      }
    }

    const total = await prisma.job.count({ where });
    const jobs = await prisma.job.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true, title: true, description: true, location: true,
        salary: true, jobType: true, skillsRequired: true, status: true,
        createdAt: true, recruiterId: true,
        recruiter: { select: { id: true, fullName: true, recruiterProfile: true, companyProfile: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      jobs,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications =
      await prisma.application.findMany({
        where: {
          jobId,
        },

        include: {
          candidate: {
            include: {
              candidateProfile: true,
            },
          },
        },

        orderBy: {
          matchScore: 'desc',
        },
      });

    res.status(200).json(applications);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


const getRecruiterJobs =
async (req, res) => {

  try {

    const jobs =
      await prisma.job.findMany({

        where: {
          recruiterId:
            req.user.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    res.status(200).json(
      jobs
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

const getRecruiterAnalytics = async (req, res) => {
  try {
    const recruiterJobs = await prisma.job.findMany({
      where: {
        recruiterId: req.user.id,
      },
      include: {
        applications: {
          include: {
            candidate: {
              include: {
                candidateProfile: true,
              },
            },
          },
        },
      },
    });

    const totalJobs = recruiterJobs.length;
    let totalApplications = 0;
    let shortlistedCount = 0;
    let rejectedCount = 0;

    // Stage counts for hiring funnel
    const stages = {
      APPLIED: 0,
      REVIEWING: 0,
      SHORTLISTED: 0,
      INTERVIEW_SCHEDULED: 0,
      INTERVIEWED: 0,
      SELECTED: 0,
      REJECTED: 0,
      HIRED: 0,
    };

    // Applications per month
    const monthlyData = {};

    // Skills tracker
    const skillsMap = {};

    let mostPopularJob = null;
    let maxApplicants = 0;

    recruiterJobs.forEach((job) => {
      const appCount = job.applications.length;
      totalApplications += appCount;

      if (appCount > maxApplicants) {
        maxApplicants = appCount;
        mostPopularJob = { title: job.title, count: appCount };
      }

      job.applications.forEach((application) => {
        const currentStatus = application.status || "APPLIED";
        if (stages[currentStatus] !== undefined) {
          stages[currentStatus]++;
        }
        if (currentStatus === "SHORTLISTED") {
          shortlistedCount++;
        }
        if (currentStatus === "REJECTED") {
          rejectedCount++;
        }

        // Parse creation month
        const monthName = new Date(application.createdAt).toLocaleString("default", { month: "short" });
        monthlyData[monthName] = (monthlyData[monthName] || 0) + 1;

        // Skills parsing
        const skills = application.candidate?.candidateProfile?.skills || [];
        skills.forEach((skill) => {
          const normSkill = skill.trim();
          if (normSkill) {
            skillsMap[normSkill] = (skillsMap[normSkill] || 0) + 1;
          }
        });
      });
    });

    // Format monthly data
    const monthNamesOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const applicationsPerMonth = monthNamesOrder
      .map((m) => ({
        month: m,
        count: monthlyData[m] || 0,
      }));

    // Format funnel data
    const hiringFunnel = Object.keys(stages).map((stage) => ({
      stage,
      count: stages[stage],
    }));

    // Format top skills (top 8)
    const topSkills = Object.keys(skillsMap)
      .map((skill) => ({ skill, count: skillsMap[skill] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    res.status(200).json({
      totalJobs,
      totalApplications,
      shortlistedCount,
      rejectedCount,
      applicationsPerMonth,
      hiringFunnel,
      topSkills,
      mostPopularJob: mostPopularJob || { title: "N/A", count: 0 },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: error.message,
    });
  }
};


const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updateData = req.body;

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this job" });
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: updateData,
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "JOB_UPDATED",
        details: `Job "${updatedJob.title}" was updated by recruiter "${req.user.fullName}"`,
        userId: req.user.id,
      },
    });

    res.status(200).json(updatedJob);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    if (job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this job" });
    }

    // Delete associated applications first
    await prisma.application.deleteMany({
      where: { jobId: jobId },
    });

    await prisma.job.delete({
      where: { id: jobId },
    });

    res.status(200).json({ message: "Job deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true, title: true, description: true, location: true,
        salary: true, jobType: true, skillsRequired: true, status: true,
        createdAt: true, recruiterId: true,
        recruiter: { select: { id: true, fullName: true, email: true, recruiterProfile: true, companyProfile: true } },
        _count: { select: { applications: true } },
      },
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.status(200).json(job);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getExternalJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, location, category, experienceLevel, source, skills } = req.query;

    const where = { isActive: true };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (category && category !== 'ALL') {
      where.category = { equals: category };
    }

    if (experienceLevel && experienceLevel !== 'ALL') {
      where.experienceLevel = { equals: experienceLevel };
    }

    if (source && source !== 'ALL') {
      where.sourceType = { equals: source };
    }

    if (skills) {
      const skillsArray = Array.isArray(skills)
        ? skills
        : skills.split(',').map(s => s.trim()).filter(Boolean);
      if (skillsArray.length > 0) {
        where.skills = { hasSome: skillsArray };
      }
    }

    const total = await prisma.externalJob.count({ where });
    const jobs = await prisma.externalJob.findMany({
      where,
      skip,
      take: limit,
      orderBy: { postedDate: 'desc' },
    });

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      jobs,
      total,
      page,
      totalPages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createJob,
  getAllJobs,
  getJobById,
  getExternalJobs,
  getJobApplicants,
  getRecruiterJobs,
  getRecruiterAnalytics,
  updateJob,
  deleteJob,
};