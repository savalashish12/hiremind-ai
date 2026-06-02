const prisma = require("../config/prisma");
const { generateCoverLetterAI } = require("../services/aiService");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

// Cover Letter Generator
const generateCoverLetter = async (req, res) => {
  try {
    const { jobId } = req.body;
    let { resumeText } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { recruiter: { include: { recruiterProfile: true } } },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    if (!resumeText) {
      const candidateProfile = await prisma.candidateProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!candidateProfile) {
        return res.status(404).json({
          success: false,
          message: "Candidate profile not found. Please upload a resume first or provide resumeText.",
        });
      }

      resumeText = `
Skills: ${(candidateProfile.skills || []).join(", ")}
Professional Summary: ${candidateProfile.professionalSummary || ""}
Experience: ${candidateProfile.experience || ""}
Education: ${candidateProfile.education || ""}
`;
    }

    const companyName = job.recruiter?.recruiterProfile?.companyName || "the Hiring Company";
    const coverLetter = await generateCoverLetterAI(job.title, companyName, job.description, resumeText);

    res.status(200).json({
      success: true,
      data: coverLetter,
    });
  } catch (error) {
    console.error("Cover letter controller error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate cover letter",
    });
  }
};

// Saved Jobs toggle
const toggleSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    const existing = await prisma.savedJob.findUnique({
      where: {
        candidateId_jobId: {
          candidateId: req.user.id,
          jobId,
        },
      },
    });

    if (existing) {
      await prisma.savedJob.delete({
        where: {
          candidateId_jobId: {
            candidateId: req.user.id,
            jobId,
          },
        },
      });
      return res.status(200).json({
        success: true,
        message: "Job removed from saved jobs",
        data: { saved: false },
      });
    } else {
      const saved = await prisma.savedJob.create({
        data: {
          candidateId: req.user.id,
          jobId,
        },
      });
      return res.status(200).json({
        success: true,
        message: "Job saved successfully",
        data: { saved: true, savedJob: saved },
      });
    }
  } catch (error) {
    console.error("Toggle saved job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle saved job",
    });
  }
};

// List all saved jobs
const getSavedJobs = async (req, res) => {
  try {
    const saved = await prisma.savedJob.findMany({
      where: { candidateId: req.user.id },
      include: {
        job: {
          include: {
            recruiter: {
              include: { recruiterProfile: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: saved,
    });
  } catch (error) {
    console.error("Get saved jobs error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved jobs",
    });
  }
};

// Delete saved job
const deleteSavedJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required",
      });
    }

    await prisma.savedJob.delete({
      where: {
        candidateId_jobId: {
          candidateId: req.user.id,
          jobId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Saved job deleted successfully",
    });
  } catch (error) {
    console.error("Delete saved job error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete saved job or it did not exist",
    });
  }
};

// Candidate Portfolio GET
const getPortfolio = async (req, res) => {
  try {
    const candidateId = req.params.candidateId || req.user?.id;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message: "Candidate ID is required",
      });
    }

    const portfolio = await prisma.candidatePortfolio.findUnique({
      where: { candidateId },
      include: { candidate: { include: { candidateProfile: true } } },
    });

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate portfolio",
    });
  }
};

// Candidate Portfolio Save/Upsert
const savePortfolio = async (req, res) => {
  try {
    const { githubUrl, linkedinUrl, portfolioUrl, projects, certifications, achievements } = req.body;

    const portfolio = await prisma.candidatePortfolio.upsert({
      where: { candidateId: req.user.id },
      update: {
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        projects: projects || undefined,
        certifications: certifications || undefined,
        achievements: achievements || undefined,
      },
      create: {
        candidateId: req.user.id,
        githubUrl,
        linkedinUrl,
        portfolioUrl,
        projects: projects || undefined,
        certifications: certifications || undefined,
        achievements: achievements || undefined,
      },
    });

    res.status(200).json({
      success: true,
      data: portfolio,
    });
  } catch (error) {
    console.error("Save portfolio error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save portfolio",
    });
  }
};

const uploadCredentials = async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files;

    if (!files || (!files.degree && !files.certificates)) {
      return res.status(400).json({ success: false, message: "No degree or certificate files provided" });
    }

    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId },
    });

    if (!candidateProfile) {
      return res.status(404).json({ success: false, message: "Candidate profile not found. Please upload a resume first." });
    }

    let degreeUrl = candidateProfile.degreeUrl;
    let certUrls = Array.isArray(candidateProfile.certUrls)
      ? candidateProfile.certUrls
      : JSON.parse(JSON.stringify(candidateProfile.certUrls || "[]"));

    if (typeof certUrls === 'string') {
      try {
        certUrls = JSON.parse(certUrls);
      } catch {
        certUrls = [];
      }
    }

    // 1. Upload Degree if exists
    if (files.degree && files.degree[0]) {
      const degreeFile = files.degree[0];
      const uploadedDegree = await cloudinary.uploader.upload(degreeFile.path, {
        folder: "credentials",
        resource_type: "raw",
      });
      degreeUrl = uploadedDegree.secure_url;

      if (fs.existsSync(degreeFile.path)) {
        fs.unlinkSync(degreeFile.path);
      }
    }

    // 2. Upload Certificates if exists
    if (files.certificates && files.certificates.length > 0) {
      for (const file of files.certificates) {
        const uploadedCert = await cloudinary.uploader.upload(file.path, {
          folder: "credentials",
          resource_type: "raw",
        });
        certUrls.push({
          name: file.originalname.split(".")[0],
          url: uploadedCert.secure_url,
          uploadedAt: new Date(),
        });

        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }
    }

    // Update candidate profile
    const updatedProfile = await prisma.candidateProfile.update({
      where: { userId },
      data: {
        degreeUrl,
        certUrls,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "CREDENTIALS_UPLOADED",
        details: `Candidate "${req.user.fullName}" uploaded educational degree/credentials`,
        userId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Credentials uploaded successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error("Credentials upload controller error:", error);
    // Cleanup files
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        req.files[key].forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  generateCoverLetter,
  toggleSavedJob,
  getSavedJobs,
  deleteSavedJob,
  getPortfolio,
  savePortfolio,
  uploadCredentials,
};
