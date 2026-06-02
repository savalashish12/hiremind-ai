const prisma = require("../config/prisma");
const { analyzeATS } = require("../services/aiService");

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

module.exports = {
  getATSAnalysis,
};
