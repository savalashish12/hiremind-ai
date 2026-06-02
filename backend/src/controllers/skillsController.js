const prisma = require("../config/prisma");
const { analyzeSkillGap } = require("../services/aiService");

const getSkillGapAnalysis = async (req, res) => {
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

    const gapResult = await analyzeSkillGap(resumeText, job.skillsRequired || []);
    res.status(200).json({
      success: true,
      data: gapResult,
    });
  } catch (error) {
    console.error("Skill Gap controller error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform skill gap analysis",
    });
  }
};

module.exports = {
  getSkillGapAnalysis,
};
