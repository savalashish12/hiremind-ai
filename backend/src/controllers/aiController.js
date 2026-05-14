const { generateInterviewQuestions, compareCandidates } = require("../services/aiService");
const prisma = require("../config/prisma");

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

module.exports = {
  getInterviewQuestions,
  compareTwoCandidates,
};
