const {
  calculateMatchScore,
} = require('../services/matchingService');

const fs = require('fs');
const pdfParse = require('pdf-parse');

const {
  extractResumeData,
  scoreResumeWithGemini,
} = require('../services/aiService');

const prisma = require('../config/prisma');

const cloudinary =
  require("../config/cloudinary");

const {
  sendStatusEmail,
  sendInterviewEmail,
} = require(
  "../services/emailService"
);

const {
  createNotification,
} = require(
  "../utils/notificationHelper"
);

const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.body;

    const candidateProfile =
      await prisma.candidateProfile.findUnique({
        where: {
          userId: req.user.id,
        },
      });

    const job =
      await prisma.job.findUnique({
        where: {
          id: jobId,
        },
      });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

        const candidateSkills =
      candidateProfile?.skills || [];

    const candidateExperience =
      candidateProfile?.experience || "";

    const candidateEducation =
      candidateProfile?.education || "";

    // 1. Calculate heuristic as fallback
    const heuristicMatch =
      calculateMatchScore(
        candidateSkills,
        job.skillsRequired,
        candidateExperience,
        candidateEducation
      );

    let finalScore = heuristicMatch.score;
    let finalFeedback = heuristicMatch.feedback;

    // 2. Attempt Gemini ATS match
    if (candidateProfile) {
      const resumeText = `
Skills: ${(candidateProfile.skills || []).join(", ")}
Professional Summary: ${candidateProfile.professionalSummary || "No summary"}
Experience: ${candidateProfile.experience || "No experience summary"}
Education: ${candidateProfile.education || "No education details"}
Strengths: ${(candidateProfile.strengths || []).join(", ")}
Weaknesses: ${(candidateProfile.weaknesses || []).join(", ")}
`;

      const jobDescriptionText = `
Title: ${job.title}
Description: ${job.description}
Skills Required: ${(job.skillsRequired || []).join(", ")}
Location: ${job.location}
`;

      try {
        const geminiResult = await scoreResumeWithGemini(resumeText, jobDescriptionText);
        if (geminiResult && typeof geminiResult.score === "number") {
          finalScore = geminiResult.score;
          const missing = geminiResult.missingSkills && geminiResult.missingSkills.length > 0
            ? `\nMissing Skills: ${geminiResult.missingSkills.join(", ")}`
            : "";
          finalFeedback = `${geminiResult.summary || "AI match evaluation completed."}${missing}`;
        }
      } catch (err) {
        console.error("Gemini match calculation failed. Using fallback.", err);
      }
    }
    
    const existingApplication =
      await prisma.application.findFirst({
        where: {
          candidateId: req.user.id,
          jobId,
        },
      });

    if (existingApplication) {
      return res.status(400).json({
        message:
          "Already applied to this job",
      });
    }
    
    const application =
      await prisma.application.create({
        data: {
          candidateId:
            req.user.id,
          jobId,
          matchScore:
            finalScore,
          aiFeedback:
            finalFeedback,
        },
      });

    // Create in-app notification for the recruiter
    await createNotification(
      job.recruiterId,
      "New Job Application",
      `Candidate "${req.user.fullName}" has applied for "${job.title}".`
    );

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "APPLICATION_SUBMITTED",
        details: `Candidate "${req.user.fullName}" applied for job "${job.title}"`,
        userId: req.user.id,
      },
    });

    res.status(201).json({
      message:
        'Applied successfully',
      matchScore:
        application.matchScore || finalScore,
      application,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        error.message,
    });
  }
};

const uploadResume = async (req, res) => {
  try {
    const filePath = req.file.path;

    const uploadedFile =
      await cloudinary.uploader.upload(
        filePath,
        {
          resource_type: "auto",
          folder:
            "hiremind-resumes",
          use_filename: true,
          unique_filename: true,
        }
      );

    const pdfBuffer = fs.readFileSync(filePath);
    const parsedPdf = await pdfParse(pdfBuffer);

    // Delete local temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const extractedData = await extractResumeData(parsedPdf.text);

    // Resume History Tracking
    const existingProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });

    let history = [];
    if (existingProfile && existingProfile.resumeHistory) {
      history = Array.isArray(existingProfile.resumeHistory)
        ? existingProfile.resumeHistory
        : JSON.parse(JSON.stringify(existingProfile.resumeHistory));
    }

    if (existingProfile && existingProfile.resumeUrl) {
      const archivedResume = {
        url: existingProfile.resumeUrl,
        name: existingProfile.resumeUrl.split("/").pop() || "Previous Resume",
        uploadedAt: existingProfile.createdAt || new Date(),
      };
      history.push(archivedResume);
    }

    const updatedProfile = await prisma.candidateProfile.upsert({
      where: { userId: req.user.id },
      update: {
        resumeUrl: uploadedFile.secure_url,
        skills: extractedData.skills,
        education: extractedData.education,
        experience: extractedData.experience,
        professionalSummary: extractedData.professionalSummary,
        strengths: extractedData.strengths,
        weaknesses: extractedData.weaknesses,
        hiringRecommendation: extractedData.hiringRecommendation,
        resumeHistory: history,
      },
      create: {
        userId: req.user.id,
        resumeUrl: uploadedFile.secure_url,
        skills: extractedData.skills,
        education: extractedData.education,
        experience: extractedData.experience,
        professionalSummary: extractedData.professionalSummary,
        strengths: extractedData.strengths,
        weaknesses: extractedData.weaknesses,
        hiringRecommendation: extractedData.hiringRecommendation,
        resumeHistory: history,
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "RESUME_UPLOADED",
        details: `Candidate "${req.user.fullName}" uploaded a resume for AI Analysis`,
        userId: req.user.id,
      },
    });

    res.status(200).json({
      message: 'Resume analyzed successfully',
      extractedData,
      profile: updatedProfile,
    });
  } catch (error) {
    console.log(error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications =
      await prisma.application.findMany({
        where: {
          candidateId:
            req.user.id,
        },
        include: {
          job: {
            include: {
              recruiter: {
                select: {
                  id: true,
                  fullName: true,
                  recruiterProfile: true,
                  companyProfile: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

    res.status(200).json(
      applications
    );
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        error.message,
    });
  }
};

const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;

    const application =
      await prisma.application.findUnique({
        where: {
          id: applicationId,
        },
        include: {
          candidate: true,
          job: true,
        },
      });

    if (!application) {
      return res.status(404).json({
        message:
          "Application not found",
      });
    }

    const updatedApplication =
      await prisma.application.update({
        where: {
          id: applicationId,
        },
        data: {
          status,
        },
      });

    // Send email invitation or status email
    await sendStatusEmail(
      application.candidate.email,
      application.candidate.fullName,
      status,
      application.job.title
    );

    // Create Candidate In-App Notification
    await createNotification(
      application.candidateId,
      "Application Status Update",
      `Your application for the role "${application.job.title}" has been updated to: ${status}.`
    );

    res.status(200).json({
      message:
        "Application status updated successfully",
      updatedApplication,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message:
        error.message,
    });
  }
};

const updateRecruiterNotes = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { notes } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update notes for this application" });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: { recruiterNotes: notes },
    });

    res.status(200).json({
      message: "Notes updated successfully",
      updatedApplication,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const scheduleInterview = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const dateVal = req.body.interviewDate || req.body.date;
    const timeVal = req.body.interviewTime || req.body.time;
    const linkVal = req.body.interviewLink || req.body.link;
    const notesVal = req.body.interviewerNotes || req.body.notes;

    if (!dateVal || !linkVal) {
      return res.status(400).json({ message: "Interview date and meeting link are required" });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        interviewDate: new Date(dateVal),
        interviewTime: timeVal || null,
        interviewLink: linkVal,
        interviewerNotes: notesVal || null,
        status: "INTERVIEW_SCHEDULED",
      },
    });

    // Send automated email invite
    await sendInterviewEmail(
      application.candidate.email,
      application.candidate.fullName,
      application.job.title,
      dateVal,
      timeVal,
      linkVal,
      notesVal
    );

    // Send Candidate Notification
    await createNotification(
      application.candidateId,
      "Interview Scheduled",
      `An interview for "${application.job.title}" has been scheduled for ${new Date(dateVal).toLocaleDateString()} at ${timeVal || 'scheduled time'}. Link: ${linkVal}`
    );

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "INTERVIEW_SCHEDULED",
        details: `Interview scheduled for candidate "${application.candidate.fullName}" (Job: "${application.job.title}")`,
        userId: req.user.id,
      },
    });

    res.status(200).json({
      message: "Interview scheduled successfully and notification sent",
      updatedApplication,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const PDFDocument = require("pdfkit");
const path = require("path");

const generateOfferLetter = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { salary, joiningDate, role, companyName } = req.body;

    if (!salary || !joiningDate || !role || !companyName) {
      return res.status(400).json({ message: "Salary, joining date, role, and company name are required" });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: true,
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    // Ensure uploads folder exists
    const uploadsDir = path.join(__dirname, "../../uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const tempFileName = `offer_${applicationId}_${Date.now()}.pdf`;
    const tempFilePath = path.join(uploadsDir, tempFileName);

    // Generate PDF via pdfkit
    const doc = new PDFDocument({ margin: 50 });
    const writeStream = fs.createWriteStream(tempFilePath);
    doc.pipe(writeStream);

    doc.fontSize(24).font("Helvetica-Bold").fillColor("#1e3a8a").text("OFFER OF EMPLOYMENT", { align: "center" });
    doc.moveDown(2);

    doc.fontSize(10).font("Helvetica").fillColor("#4b5563").text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown(1);

    doc.fontSize(12).font("Helvetica-Bold").fillColor("#111827").text(`To: ${application.candidate.fullName}`);
    doc.moveDown(0.5);

    doc.font("Helvetica").fillColor("#374151").text(
      `Dear ${application.candidate.fullName},\n\nWe are pleased to offer you the position of ${role} with ${companyName}. We were extremely impressed by your credentials and look forward to welcoming you to our team.`
    );
    doc.moveDown(1);

    doc.font("Helvetica-Bold").text("Employment Details:");
    doc.font("Helvetica").text(`- Role: ${role}`);
    doc.text(`- Salary: INR ${salary} per annum`);
    doc.text(`- Joining Date: ${new Date(joiningDate).toLocaleDateString()}`);
    doc.moveDown(1.5);

    doc.text(
      "Please sign and return a copy of this offer letter within 7 days to confirm your acceptance. If you have any questions, do not hesitate to contact us."
    );
    doc.moveDown(2.5);

    doc.font("Helvetica-Bold").text("Sincerely,");
    doc.moveDown(0.5);
    doc.text(`${companyName} HR & Recruiting Team`);

    doc.end();

    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // Upload file to Cloudinary
    const uploadedFile = await cloudinary.uploader.upload(tempFilePath, {
      folder: "offer-letters",
      resource_type: "auto",
    });

    // Delete local temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    // Save offer letter details to DB
    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        offerLetterUrl: uploadedFile.secure_url,
        offerLetterDetails: {
          salary,
          joiningDate,
          role,
          companyName,
        },
        status: "OFFERED",
      },
    });

    // Create Candidate In-App Notification
    await createNotification(
      application.candidateId,
      "Job Offer Received",
      `Congratulations! You have received a job offer from "${companyName}" for the role of "${role}".`
    );

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "OFFER_LETTER_GENERATED",
        details: `Offer letter generated for "${application.candidate.fullName}" (Role: "${role}") by recruiter`,
        userId: req.user.id,
      },
    });

    res.status(200).json({
      message: "Offer letter generated successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Offer letter generation error:", error);
    res.status(500).json({ message: error.message });
  }
};

const downloadOfferLetter = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application || !application.offerLetterUrl) {
      return res.status(404).json({ message: "Offer letter not found" });
    }

    res.redirect(application.offerLetterUrl);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const respondToOffer = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { decision } = req.body; // "ACCEPT" | "DECLINE"

    if (!["ACCEPT", "DECLINE"].includes(decision)) {
      return res.status(400).json({ message: 'Decision must be "ACCEPT" or "DECLINE".' });
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: { select: { title: true, recruiterId: true } } },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    if (application.candidateId !== req.user.id) {
      return res.status(403).json({ message: "Not your application." });
    }
    if (application.status !== "OFFERED") {
      return res.status(400).json({ message: `Only OFFERED applications can be answered (current: ${application.status}).` });
    }

    const newStatus = decision === "ACCEPT" ? "HIRED" : "DECLINED";
    const updated = await prisma.application.update({
      where: { id: applicationId },
      data: { status: newStatus },
    });

    await createNotification(
      application.job.recruiterId,
      decision === "ACCEPT" ? "Offer Accepted 🎉" : "Offer Declined",
      `Candidate ${decision === "ACCEPT" ? "accepted" : "declined"} your offer for "${application.job.title}".`
    );

    await prisma.activityLog.create({
      data: {
        action: decision === "ACCEPT" ? "OFFER_ACCEPTED" : "OFFER_DECLINED",
        details: `Candidate responded ${decision} to offer for "${application.job.title}"`,
        userId: req.user.id,
      },
    });

    res.status(200).json({ message: `Offer ${decision === "ACCEPT" ? "accepted" : "declined"} successfully`, application: updated });
  } catch (error) {
    console.error("Offer response error:", error);
    res.status(500).json({ message: error.message });
  }
};

const bulkUpdateStatus = async (req, res) => {
  try {
    const { applicationIds, stage } = req.body;
    if (!applicationIds?.length || !stage) {
      return res.status(400).json({ success: false, message: 'applicationIds array and stage are required' });
    }
    const result = await prisma.application.updateMany({
      where: { id: { in: applicationIds } },
      data: { pipelineStage: stage }
    });
    res.json({ success: true, updated: result.count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  applyToJob,
  uploadResume,
  getMyApplications,
  updateApplicationStatus,
  updateRecruiterNotes,
  scheduleInterview,
  generateOfferLetter,
  downloadOfferLetter,
  respondToOffer,
  bulkUpdateStatus,
};