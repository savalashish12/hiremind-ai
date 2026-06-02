const prisma = require("../config/prisma");
const { rankCandidatesAI } = require("../services/aiService");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// AI candidate ranking
const rankCandidates = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: "Job not found" });
    }

    // Fetch all applicants for this job
    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          include: { candidateProfile: true },
        },
      },
    });

    if (applications.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    // Format candidate array for Gemini
    const candidates = applications.map((app) => {
      const prof = app.candidate.candidateProfile;
      const resumeText = prof
        ? `Skills: ${(prof.skills || []).join(", ")}. Experience: ${prof.experience || ""}. Education: ${prof.education || ""}. Summary: ${prof.professionalSummary || ""}. Strengths: ${(prof.strengths || []).join(", ")}.`
        : "No profile details.";

      return {
        candidateId: app.candidate.id,
        name: app.candidate.fullName,
        resumeText,
      };
    });

    const jobTitle = job.title;
    const requirements = (job.skillsRequired || []).join(", ") + ". " + job.description;

    const ranking = await rankCandidatesAI(jobTitle, requirements, candidates);

    res.status(200).json({
      success: true,
      data: ranking,
    });
  } catch (error) {
    console.error("Rank candidates controller error:", error);
    res.status(500).json({ success: false, message: "Failed to rank candidates" });
  }
};

// Pipeline management: GET candidates by stage
const getPipeline = async (req, res) => {
  try {
    const { jobId } = req.params;
    if (!jobId) {
      return res.status(400).json({ success: false, message: "Job ID is required" });
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      include: {
        candidate: {
          include: { candidateProfile: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Get pipeline error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch hiring pipeline" });
  }
};

// Pipeline management: PATCH move stage
const movePipelineStage = async (req, res) => {
  try {
    const { applicationId, newStage } = req.body;
    if (!applicationId || !newStage) {
      return res.status(400).json({ success: false, message: "applicationId and newStage are required" });
    }

    // Update the stage
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: {
        pipelineStage: newStage,
        // sync existing status field too if applicable
        status: newStage.toUpperCase() === "INTERVIEWSCHEDULED" ? "INTERVIEW_SCHEDULED" : newStage.toUpperCase(),
      },
    });

    res.status(200).json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Move pipeline stage error:", error);
    res.status(500).json({ success: false, message: "Failed to update pipeline stage" });
  }
};

// Recruiter Company Profile GET
const getCompanyProfile = async (req, res) => {
  try {
    const recruiterId = req.params.recruiterId || req.user?.id;

    if (!recruiterId) {
      return res.status(400).json({ success: false, message: "Recruiter ID is required" });
    }

    const profile = await prisma.companyProfile.findUnique({
      where: { recruiterId },
    });

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get company profile error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch company profile" });
  }
};

// Recruiter Company Profile POST (create)
const createCompanyProfile = async (req, res) => {
  try {
    const { companyName, logo, website, industry, teamSize, about, location, founded } = req.body;

    if (!companyName) {
      return res.status(400).json({ success: false, message: "Company name is required" });
    }

    const profile = await prisma.companyProfile.create({
      data: {
        recruiterId: req.user.id,
        companyName,
        logo,
        website,
        industry,
        teamSize,
        about,
        location,
        founded,
      },
    });

    res.status(201).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Create company profile error:", error);
    res.status(500).json({ success: false, message: "Failed to create company profile" });
  }
};

// Recruiter Company Profile PATCH (update)
const updateCompanyProfile = async (req, res) => {
  try {
    const { companyName, logo, website, industry, teamSize, about, location, founded } = req.body;

    const profile = await prisma.companyProfile.upsert({
      where: { recruiterId: req.user.id },
      update: {
        companyName,
        logo,
        website,
        industry,
        teamSize,
        about,
        location,
        founded,
      },
      create: {
        recruiterId: req.user.id,
        companyName: companyName || "My Company",
        logo,
        website,
        industry,
        teamSize,
        about,
        location,
        founded,
      },
    });

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Update company profile error:", error);
    res.status(500).json({ success: false, message: "Failed to update company profile" });
  }
};

// Upload company logo helper
const uploadCompanyLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No logo image file uploaded" });
    }

    const filePath = req.file.path;
    const uploadedFile = await cloudinary.uploader.upload(filePath, {
      folder: "company-logos",
    });

    // delete temp local file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.status(200).json({
      success: true,
      data: {
        url: uploadedFile.secure_url,
      },
    });
  } catch (error) {
    console.error("Upload logo error:", error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ success: false, message: "Failed to upload logo to Cloudinary" });
  }
};

// Recruiter Dashboard Stats
const getDashboardStats = async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // Get all jobs posted by this recruiter
    const recruiterJobs = await prisma.job.findMany({
      where: { recruiterId },
      select: { id: true, title: true, status: true },
    });

    const jobIds = recruiterJobs.map((j) => j.id);
    const totalJobsPosted = recruiterJobs.length;
    const activeJobs = recruiterJobs.filter((j) => j.status === "OPEN").length;

    // Find all applications for recruiter's jobs
    const applications = await prisma.application.findMany({
      where: {
        jobId: { in: jobIds },
      },
      select: {
        id: true,
        createdAt: true,
        pipelineStage: true,
        status: true,
        job: { select: { title: true } },
      },
    });

    const totalApplications = applications.length;

    // Applications in current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthApplications = applications.filter((app) => new Date(app.createdAt) >= startOfMonth).length;

    // Interviews scheduled
    const scheduledInterviews = await prisma.application.findMany({
      where: {
        jobId: { in: jobIds },
        status: "INTERVIEW_SCHEDULED",
      },
      select: {
        id: true,
        interviewDate: true,
        interviewTime: true,
        interviewLink: true,
        interviewerNotes: true,
        candidate: {
          select: {
            fullName: true,
            email: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
    });
    const totalInterviewsScheduled = scheduledInterviews.length;
    const upcomingInterviews = scheduledInterviews.filter(
      (int) => int.interviewDate && new Date(int.interviewDate) >= new Date()
    ).length;

    // Hires
    const totalHired = applications.filter(
      (app) => app.pipelineStage === "Hired" || app.status === "HIRED"
    ).length;
    const hiringSuccessRate = totalApplications > 0 ? Math.round((totalHired / totalApplications) * 100) : 0;

    // Monthly trends (group applications and hires by month)
    const monthlyTrendsMap = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyTrendsMap[mLabel] = { month: mLabel, applications: 0, hires: 0 };
    }

    applications.forEach((app) => {
      const date = new Date(app.createdAt);
      const label = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
      if (monthlyTrendsMap[label]) {
        monthlyTrendsMap[label].applications += 1;
        if (app.pipelineStage === "Hired" || app.status === "HIRED") {
          monthlyTrendsMap[label].hires += 1;
        }
      }
    });
    const monthlyTrends = Object.values(monthlyTrendsMap);

    // Top jobs by application count
    const jobCounts = {};
    recruiterJobs.forEach((job) => {
      jobCounts[job.title] = 0;
    });
    applications.forEach((app) => {
      if (jobCounts[app.job.title] !== undefined) {
        jobCounts[app.job.title] += 1;
      }
    });

    const topJobs = Object.keys(jobCounts)
      .map((title) => ({ jobTitle: title, applicationCount: jobCounts[title] }))
      .sort((a, b) => b.applicationCount - a.applicationCount)
      .slice(0, 5);

    // Applications by pipeline stage
    const stages = ["Applied", "Reviewed", "Shortlisted", "InterviewScheduled", "Selected", "Hired"];
    const stageCounts = {};
    stages.forEach((s) => {
      stageCounts[s] = 0;
    });
    applications.forEach((app) => {
      const s = app.pipelineStage || "Applied";
      if (stageCounts[s] !== undefined) {
        stageCounts[s] += 1;
      } else {
        stageCounts[s] = 1;
      }
    });
    const applicationsByStage = Object.keys(stageCounts).map((key) => ({
      stage: key,
      count: stageCounts[key],
    }));

    res.status(200).json({
      success: true,
      data: {
        totalJobsPosted,
        activeJobs,
        totalApplications,
        thisMonthApplications,
        totalInterviewsScheduled,
        upcomingInterviews,
        scheduledInterviewsList: scheduledInterviews,
        totalHired,
        hiringSuccessRate,
        monthlyTrends,
        topJobs,
        applicationsByStage,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard stats" });
  }
};

module.exports = {
  rankCandidates,
  getPipeline,
  movePipelineStage,
  getCompanyProfile,
  createCompanyProfile,
  updateCompanyProfile,
  uploadCompanyLogo,
  getDashboardStats,
};
