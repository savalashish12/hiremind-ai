const prisma = require("../config/prisma");
const { generateCoverLetterAI } = require("../services/aiService");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");
const axios = require("axios");
const PDFDocument = require("pdfkit");

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
        resource_type: "auto",
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
          resource_type: "auto",
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

const viewDocument = async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send("Document URL is required");
    }

    if (!url.startsWith("https://res.cloudinary.com/") && !url.startsWith("http://res.cloudinary.com/")) {
      return res.status(403).send("Access denied: Invalid document domain");
    }

    // Parse Cloudinary URL to get public_id, format, resource_type, type
    const match = url.match(/https?:\/\/res\.cloudinary\.com\/([^/]+)\/([^/]+)\/([^/]+)\/(?:v\d+\/)?(.+)/);
    if (!match) {
      return res.status(400).send("Invalid Cloudinary URL format");
    }

    const resourceType = match[2]; // e.g. "image" or "raw"
    const type = match[3];         // e.g. "upload"
    let fullPath = match[4];       // e.g. "hiremind-resumes/1780470187452_bliduf.pdf"

    let publicId = fullPath;
    let format = "";

    if (resourceType === "image") {
      const lastDotIndex = fullPath.lastIndexOf(".");
      if (lastDotIndex !== -1) {
        publicId = fullPath.substring(0, lastDotIndex);
        format = fullPath.substring(lastDotIndex + 1);
      }
    }

    // Generate signed private download URL using Cloudinary SDK
    const downloadUrl = cloudinary.utils.private_download_url(
      publicId,
      format,
      {
        resource_type: resourceType,
        type: type
      }
    );

    const response = await axios.get(downloadUrl, {
      responseType: "arraybuffer",
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=\"document.pdf\"");
    res.send(response.data);
  } catch (error) {
    console.error("View document proxy error:", error.message);
    res.status(500).send("Failed to load PDF document");
  }
};

const buildResume = async (req, res) => {
  try {
    const { fullName, email, phone, summary, experience, education, skills, certifications } = req.body;

    if (!fullName || !email) {
      return res.status(400).json({ message: "Full Name and Email are required" });
    }

    const doc = new PDFDocument({ margin: 50 });
    let chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    const pdfBufferPromise = new Promise((resolve, reject) => {
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));
    });

    // Color definitions
    const textColor = "#1e293b";
    const headingColor = "#3b82f6";
    const secondaryColor = "#64748b";
    const borderColor = "#cbd5e1";

    // 1. Header
    doc.fillColor(textColor);
    doc.fontSize(24).font("Helvetica-Bold").text(fullName, { align: "center" });
    doc.moveDown(0.2);
    
    doc.fillColor(secondaryColor);
    doc.fontSize(10).font("Helvetica").text(`${email}  |  ${phone || ""}`, { align: "center" });
    doc.moveDown(1.5);

    // 2. Summary
    if (summary) {
      doc.fillColor(headingColor).fontSize(12).font("Helvetica-Bold").text("PROFESSIONAL SUMMARY");
      doc.strokeColor(borderColor).lineWidth(1).moveTo(50, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.5);
      
      doc.fillColor(textColor).fontSize(10).font("Helvetica").text(summary, { lineGap: 3 });
      doc.moveDown(1.5);
    }

    // 3. Experience
    if (experience && Array.isArray(experience) && experience.length > 0) {
      doc.fillColor(headingColor).fontSize(12).font("Helvetica-Bold").text("WORK EXPERIENCE");
      doc.strokeColor(borderColor).lineWidth(1).moveTo(50, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.5);

      experience.forEach((exp) => {
        if (!exp.role && !exp.company) return;
        
        const currentY = doc.y;
        doc.fillColor(textColor).fontSize(10).font("Helvetica-Bold");
        doc.text(exp.role || "", 50, currentY);
        
        const roleWidth = doc.widthOfString(exp.role || "");
        doc.fillColor(secondaryColor).font("Helvetica").text(` at ${exp.company || ""}`, 50 + roleWidth, currentY);
        
        doc.fillColor(secondaryColor).font("Helvetica").text(exp.duration || "", 400, currentY, { align: "right", width: 160 });
        doc.moveDown(0.3);

        doc.fillColor(textColor).fontSize(10).font("Helvetica");
        if (exp.description) {
          const bullets = exp.description.split("\n").map(b => b.trim()).filter(Boolean);
          bullets.forEach((bullet) => {
            doc.text(`• ${bullet}`, 60, doc.y, { lineGap: 2 });
          });
        }
        doc.moveDown(0.8);
      });
      doc.x = 50; // Reset X
      doc.moveDown(0.7);
    }

    // 4. Education
    if (education && Array.isArray(education) && education.length > 0) {
      doc.fillColor(headingColor).fontSize(12).font("Helvetica-Bold").text("EDUCATION");
      doc.strokeColor(borderColor).lineWidth(1).moveTo(50, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.5);

      education.forEach((edu) => {
        if (!edu.institution && !edu.degree) return;
        doc.fillColor(textColor).fontSize(10).font("Helvetica-Bold").text(edu.degree || "", { continued: true });
        doc.fillColor(secondaryColor).font("Helvetica").text(` from ${edu.institution || ""} (${edu.year || ""})`);
        doc.moveDown(0.5);
      });
      doc.moveDown(1);
    }

    // 5. Skills
    if (skills) {
      doc.fillColor(headingColor).fontSize(12).font("Helvetica-Bold").text("KEY SKILLS");
      doc.strokeColor(borderColor).lineWidth(1).moveTo(50, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.5);

      const skillsArray = Array.isArray(skills) 
        ? skills 
        : skills.split(",").map((s) => s.trim()).filter(Boolean);

      doc.fillColor(textColor).fontSize(10).font("Helvetica");
      // Render in two columns
      const mid = Math.ceil(skillsArray.length / 2);
      const col1 = skillsArray.slice(0, mid).join(", ");
      const col2 = skillsArray.slice(mid).join(", ");
      
      const skillY = doc.y;
      if (col1) doc.text(col1, 50, skillY, { width: 240 });
      if (col2) doc.text(col2, 310, skillY, { width: 240 });
      
      doc.x = 50;
      doc.y = skillY + Math.max(doc.heightOfString(col1, { width: 240 }), doc.heightOfString(col2, { width: 240 }));
      doc.moveDown(1.5);
    }

    // 6. Certifications
    if (certifications) {
      doc.fillColor(headingColor).fontSize(12).font("Helvetica-Bold").text("CERTIFICATIONS");
      doc.strokeColor(borderColor).lineWidth(1).moveTo(50, doc.y).lineTo(560, doc.y).stroke();
      doc.moveDown(0.5);

      const certsArray = Array.isArray(certifications)
        ? certifications
        : certifications.split(",").map((c) => c.trim()).filter(Boolean);

      doc.fillColor(textColor).fontSize(10).font("Helvetica");
      certsArray.forEach((cert) => {
        doc.text(`• ${cert}`, 60, doc.y, { lineGap: 2 });
      });
      doc.x = 50;
    }

    doc.end();

    const pdfBuffer = await pdfBufferPromise;

    // Upload buffer to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "hiremind/built-resumes",
          resource_type: "raw",
          format: "pdf",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.write(pdfBuffer);
      uploadStream.end();
    });

    const resumeUrl = uploadResult.secure_url;

    // Save Cloudinary URL to CandidateProfile
    await prisma.candidateProfile.upsert({
      where: { userId: req.user.id },
      update: {
        resumeUrl,
        skills: Array.isArray(skills) ? skills : skills?.split(",").map(s => s.trim()).filter(Boolean) || [],
        education: education && education.length > 0 ? `${education[0].degree} from ${education[0].institution} (${education[0].year})` : undefined,
        experience: experience && experience.length > 0 ? `${experience[0].role} at ${experience[0].company} (${experience[0].duration})` : undefined,
        professionalSummary: summary || undefined,
      },
      create: {
        userId: req.user.id,
        resumeUrl,
        skills: Array.isArray(skills) ? skills : skills?.split(",").map(s => s.trim()).filter(Boolean) || [],
        education: education && education.length > 0 ? `${education[0].degree} from ${education[0].institution} (${education[0].year})` : "",
        experience: experience && experience.length > 0 ? `${experience[0].role} at ${experience[0].company} (${experience[0].duration})` : "",
        professionalSummary: summary || "",
      },
    });

    res.status(200).json({
      resumeUrl,
      message: "Resume built and saved successfully",
    });
  } catch (error) {
    console.error("Build Resume Error:", error);
    res.status(500).json({ message: error.message });
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
  viewDocument,
  buildResume,
};
