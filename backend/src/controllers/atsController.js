const prisma = require("../config/prisma");
const { analyzeATS } = require("../services/aiService");
const { GoogleGenAI } = require("@google/genai");

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
genAI.getGenerativeModel = ({ model }) => ({
  generateContent: async (prompt) => {
    const res = await genAI.models.generateContent({
      model,
      contents: prompt
    });
    return {
      response: {
        text: () => res.text
      }
    };
  }
});

const getATSAnalysis = async (req, res) => {
  try {
    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id },
    });

    if (!candidateProfile) {
      return res.status(404).json({
        success: false,
        message: "Candidate profile not found. Please upload a resume first.",
      });
    }

    const resumeText = `
Skills: ${(candidateProfile.skills || []).join(", ")}
Professional Summary: ${candidateProfile.professionalSummary || "No summary"}
Experience: ${candidateProfile.experience || "No experience summary"}
Education: ${candidateProfile.education || "No education details"}
Strengths: ${(candidateProfile.strengths || []).join(", ")}
Weaknesses: ${(candidateProfile.weaknesses || []).join(", ")}
`;

    const analysis = await analyzeATS(resumeText);
    res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("ATS controller error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform ATS analysis",
    });
  }
};

const getMatchPreview = async (req, res) => {
  try {
    const { jobId } = req.query;
    if (!jobId) return res.status(400).json({ success: false, message: 'jobId is required' });

    const candidateProfile = await prisma.candidateProfile.findUnique({
      where: { userId: req.user.id }
    });
    if (!candidateProfile) return res.json({ success: true, data: { matchScore: null, matchingSkills: [], missingSkills: [], tip: 'Complete your profile to see match score.' } });

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const candidateSkills = (candidateProfile.skills || []).join(', ') || 'Not specified';
    const jobSkills = (job.skillsRequired || job.skillsNeeded || []).join(', ') || job.description?.slice(0, 300) || 'Not specified';

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `Compare this candidate's skills to the job requirements.
Candidate skills: ${candidateSkills}
Job required skills: ${jobSkills}
Job title: ${job.title}
Return ONLY valid JSON (no markdown): {"matchScore": <0-100>, "matchingSkills": ["..."], "missingSkills": ["..."], "tip": "<one short sentence advice>"}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/\`\`\`json|\`\`\`/g, '').trim();
    const parsed = JSON.parse(text);

    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getATSAnalysis,
  getMatchPreview,
};
