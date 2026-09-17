const {
  generateInterviewQuestions,
  compareCandidates,
  generateResumeSuggestions,
  generateCareerRoadmap,
  askKnowledgeBase,
} = require("../services/aiService");
const prisma = require("../config/prisma");
const { calculateMatchScore } = require("../services/matchingService");
const fs = require("fs");
const pdfParse = require("pdf-parse");

const getInterviewQuestions = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        candidate: {
          include: { candidateProfile: true },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    const { job, candidate } = application;
    const { candidateProfile } = candidate;

    if (!candidateProfile) {
      return res.status(400).json({ message: "Candidate profile not complete" });
    }

    const questions = await generateInterviewQuestions(
      candidateProfile.professionalSummary || candidateProfile.experience || "No summary available",
      candidateProfile.skills || [],
      job.title
    );

    res.status(200).json(questions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate questions" });
  }
};

const compareTwoCandidates = async (req, res) => {
  try {
    const { candidateId1, candidateId2, jobId } = req.body;

    if (!candidateId1 || !candidateId2 || !jobId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });

    const getCandidateData = async (id) => {
      return prisma.candidateProfile.findUnique({
        where: { userId: id },
      });
    };

    const [candidateA, candidateB] = await Promise.all([
      getCandidateData(candidateId1),
      getCandidateData(candidateId2),
    ]);

    if (!candidateA || !candidateB) {
      return res.status(404).json({ message: "One or both candidates not found" });
    }

    const comparisonResult = await compareCandidates(candidateA, candidateB, job.title);

    res.status(200).json(comparisonResult);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to compare candidates" });
  }
};

const getResumeSuggestions = async (req, res) => {
  try {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!candidateProfile) {
      return res.status(404).json({ message: "Candidate profile not found. Please upload a resume first." });
    }

    const resumeText = `
Professional Summary: ${candidateProfile.professionalSummary || "No summary"}
Experience: ${candidateProfile.experience || "No experience summary"}
Education: ${candidateProfile.education || "No education details"}
Strengths: ${(candidateProfile.strengths || []).join(", ")}
Weaknesses: ${(candidateProfile.weaknesses || []).join(", ")}
    `;

    const suggestions = await generateResumeSuggestions(resumeText, candidateProfile.skills || []);
    res.status(200).json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate resume suggestions" });
  }
};

const getCareerRoadmap = async (req, res) => {
  try {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!candidateProfile) {
      return res.status(404).json({ message: "Candidate profile not found. Please upload a resume first." });
    }

    const { targetRole } = req.query;

    const roadmap = await generateCareerRoadmap(
      candidateProfile.skills || [],
      candidateProfile.experience || "Entry level",
      targetRole
    );

    res.status(200).json(roadmap);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to generate career roadmap" });
  }
};

const getAIJobRecommendations = async (req, res) => {
  try {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!candidateProfile) {
      return res.status(404).json({ message: "Candidate profile not found. Please upload a resume first." });
    }

    const jobs = await prisma.job.findMany({
      where: { status: "OPEN" },
      include: { recruiter: { include: { recruiterProfile: true } } },
    });

    const recommendations = jobs.map((job) => {
      const match = calculateMatchScore(
        candidateProfile.skills,
        job.skillsRequired,
        candidateProfile.experience || "",
        candidateProfile.education || ""
      );

      return {
        ...job,
        matchScore: match.score,
        aiFeedback: match.feedback,
      };
    });

    // Sort descending by matchScore
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(recommendations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch job recommendations" });
  }
};

// RAG / Knowledge Assistant endpoints
const uploadCompanyDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a document file (PDF or Text)" });
    }

    const filePath = req.file.path;
    let parsedText = "";

    if (req.file.mimetype === "application/pdf") {
      const pdfBuffer = fs.readFileSync(filePath);
      const parsedPdf = await pdfParse(pdfBuffer);
      parsedText = parsedPdf.text;
    } else {
      // Treat as plain text
      parsedText = fs.readFileSync(filePath, "utf-8");
    }

    // Clean up local temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const { title, category } = req.body;

    const cleaned = String(parsedText || "").replace(/\r/g, "").trim();
    if (cleaned.length < 20) {
      return res.status(400).json({ message: "Document has no readable text. Upload a text-based PDF or .txt file." });
    }
    // Cap stored content so a 5MB handbook can't blow up the prompt window
    const MAX_DOC_CHARS = 200000;
    const content = cleaned.length > MAX_DOC_CHARS ? cleaned.slice(0, MAX_DOC_CHARS) : cleaned;

    const doc = await prisma.companyDocument.create({
      data: {
        title: (title || req.file.originalname || "Untitled").slice(0, 200),
        category: (category || "GENERAL").toUpperCase(),
        content,
        recruiterId: req.user.id,
      },
    });

    res.status(201).json({
      message: `Document uploaded and indexed (${content.length} chars, ~${Math.ceil(content.length / 900)} chunks)`,
      document: { ...doc, content: doc.content.slice(0, 500) },
    });
  } catch (error) {
    console.error(error);
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

const getCompanyDocuments = async (req, res) => {
  try {
    const documents = await prisma.companyDocument.findMany({
      where: { recruiterId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(documents);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteCompanyDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await prisma.companyDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    if (document.recruiterId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this document" });
    }

    await prisma.companyDocument.delete({
      where: { id },
    });

    res.status(200).json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

const askKnowledgeAssistant = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || String(question).trim().length < 3) {
      return res.status(400).json({ message: "Ask a specific question (min 3 characters)." });
    }
    if (String(question).length > 1000) {
      return res.status(400).json({ message: "Question too long (max 1000 characters)." });
    }

    const documents = await prisma.companyDocument.findMany({
      where: { recruiterId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    if (documents.length === 0) {
      return res.status(400).json({
        message: "No documents uploaded. Please upload company policies or guidelines first in the Knowledge Hub.",
      });
    }

    const result = await askKnowledgeBase(documents, String(question).trim());
    // Back-compat: older clients read res.data.answer as string
    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Knowledge base query failed" });
  }
};

module.exports = {
  getInterviewQuestions,
  compareTwoCandidates,
  getResumeSuggestions,
  getCareerRoadmap,
  getAIJobRecommendations,
  uploadCompanyDocument,
  getCompanyDocuments,
  deleteCompanyDocument,
  askKnowledgeAssistant,
};
