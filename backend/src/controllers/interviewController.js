const prisma = require("../config/prisma");
const {
  generateMockInterviewQuestions,
  evaluateMockInterviewAnswers,
  generateMcqQuestionsAI,
  evaluateMcqTestAI,
} = require("../services/aiService");
const questionBank = require("../data/questionBank");

const mapCategoryToBankKey = (testType) => {
  const t = testType.toLowerCase();
  if (t.includes("aptitude") && !t.includes("quantitative")) return "Aptitude";
  if (t.includes("cognitive") || t.includes("reasoning") || t.includes("behavioral")) return "Logical Reasoning";
  if (t.includes("quantitative") || t.includes("quant")) return "Quantitative";
  if (t.includes("verbal") || t.includes("communication") || t.includes("discussion")) return "Communication";
  if (t.includes("programming") || t.includes("coding")) return "Coding Round";
  if (t.includes("hr")) return "HR Questions";
  return "Technical"; // fallback to Technical MCQ
};

const startInterview = async (req, res) => {
  try {
    const { jobRole } = req.body;
    if (!jobRole) {
      return res.status(400).json({
        success: false,
        message: "jobRole is required",
      });
    }

    const questions = await generateMockInterviewQuestions(jobRole);
    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("Start interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate interview questions",
    });
  }
};

const evaluateInterview = async (req, res) => {
  try {
    const { jobRole, qaPairs } = req.body; // qaPairs format: [{ question: '...', answer: '...' }]
    if (!jobRole || !qaPairs || !Array.isArray(qaPairs)) {
      return res.status(400).json({
        success: false,
        message: "jobRole and qaPairs array are required",
      });
    }

    const evaluation = await evaluateMockInterviewAnswers(jobRole, qaPairs);
    res.status(200).json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error("Evaluate interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to evaluate interview answers",
    });
  }
};

const saveInterview = async (req, res) => {
  try {
    const {
      jobRole,
      questions,
      answers,
      communicationScore,
      technicalScore,
      confidenceScore,
      overallRating,
      recommendation,
    } = req.body;

    if (!jobRole || !questions || !answers) {
      return res.status(400).json({
        success: false,
        message: "Missing required interview session fields",
      });
    }

    const interview = await prisma.mockInterview.create({
      data: {
        candidateId: req.user.id,
        jobRole,
        questions,
        answers,
        communicationScore: parseInt(communicationScore) || 0,
        technicalScore: parseInt(technicalScore) || 0,
        confidenceScore: parseInt(confidenceScore) || 0,
        overallRating,
        recommendation,
      },
    });

    res.status(201).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Save interview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save interview session",
    });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const history = await prisma.mockInterview.findMany({
      where: { candidateId: req.user.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error("Get interview history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview history",
    });
  }
};

const getInterviewReport = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
      include: {
        candidate: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview report not found",
      });
    }

    if (req.user.role === "CANDIDATE" && interview.candidateId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this report",
      });
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Get interview report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview report",
    });
  }
};

const generateMcqTest = async (req, res) => {
  try {
    const { company, role, testType } = req.body;
    if (!company || !role || !testType) {
      return res.status(400).json({
        success: false,
        message: "company, role, and testType are required",
      });
    }

    const bankKey = mapCategoryToBankKey(testType);
    const baseQuestions = questionBank[bankKey] || questionBank["Technical"];

    // Seed PRNG based on company + testType to yield repeatable company-specific questions
    const seedString = `${company.toLowerCase()}-${testType.toLowerCase()}`;
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed * 31 + seedString.charCodeAt(i)) & 0xffffffff;
    }

    const prng = () => {
      seed = (1103515245 * seed + 12345) & 0xffffffff;
      return (seed >>> 16) / 32768;
    };

    // Deep copy and shuffle
    const clonedQuestions = JSON.parse(JSON.stringify(baseQuestions));
    for (let i = clonedQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(prng() * (i + 1));
      const temp = clonedQuestions[i];
      clonedQuestions[i] = clonedQuestions[j];
      clonedQuestions[j] = temp;
    }

    // Take exactly 25 questions
    const selectedQuestions = clonedQuestions.slice(0, 25);

    // Personalize questions to reference the company
    const personalized = selectedQuestions.map((q, index) => {
      q.id = index + 1;
      if (index % 3 === 0) {
        q.question = `At ${company}, ${q.question.charAt(0).toLowerCase() + q.question.slice(1)}`;
      } else if (index % 3 === 1) {
        q.question = `${q.question.replace(/\ba person\b/gi, `a team at ${company}`).replace(/\ba vendor\b/gi, `a procurement lead at ${company}`)}`;
      }
      return q;
    });

    res.status(200).json({
      success: true,
      data: personalized,
    });
  } catch (error) {
    console.error("MCQ generation controller error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate MCQ questions",
    });
  }
};

const evaluateMcqTest = async (req, res) => {
  try {
    const { company, role, testType, questions, answers, elapsedSeconds } = req.body;
    if (!company || !role || !testType || !questions || !answers) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameters company, role, testType, questions, and answers",
      });
    }

    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    questions.forEach((q) => {
      const candidateAns = answers[q.id];
      if (!candidateAns) {
        unanswered++;
      } else if (candidateAns.toUpperCase() === q.correctAnswer.toUpperCase()) {
        correct++;
      } else {
        wrong++;
      }
    });

    const total = questions.length;
    const scorePercentage = Math.round((correct / total) * 100);
    const accuracy = total - unanswered > 0 ? Math.round((correct / (total - unanswered)) * 100) : 0;
    
    const minutes = Math.floor((elapsedSeconds || 0) / 60);
    const seconds = (elapsedSeconds || 0) % 60;
    const timeTaken = `${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${seconds !== 1 ? 's' : ''}`;

    const aiEval = await evaluateMcqTestAI(company, role, testType, questions, answers);

    res.status(200).json({
      success: true,
      data: {
        total,
        correct,
        wrong,
        unanswered,
        scorePercentage,
        accuracy,
        timeTaken,
        ...aiEval,
      },
    });
  } catch (error) {
    console.error("MCQ evaluation controller error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to evaluate MCQ test",
    });
  }
};

const saveMcqTest = async (req, res) => {
  try {
    const {
      company,
      role,
      testType,
      questions,
      answers,
      correct,
      wrong,
      unanswered,
      scorePercentage,
      percentileEstimate,
      difficultyLevel,
      strengths,
      weaknesses,
      improvementAreas,
      recommendedTopics,
      recommendedCertifications,
      recommendedLearningResources,
      detailedFeedback,
      timeTaken,
      accuracy,
    } = req.body;

    if (!company || !role || !testType || !questions || !answers) {
      return res.status(400).json({
        success: false,
        message: "Missing parameters to save MCQ test",
      });
    }

    const jobRoleSerialized = `[MCQ] Company: ${company} | Role: ${role} | Type: ${testType}`;

    const recommendationPayload = JSON.stringify({
      percentileEstimate,
      difficultyLevel,
      strengths,
      weaknesses,
      improvementAreas,
      recommendedTopics,
      recommendedCertifications,
      recommendedLearningResources,
      detailedFeedback,
      timeTaken: timeTaken || "N/A",
      accuracy: accuracy || scorePercentage,
    });

    const testAttempt = await prisma.mockInterview.create({
      data: {
        candidateId: req.user.id,
        jobRole: jobRoleSerialized,
        questions: questions,
        answers: answers,
        communicationScore: parseInt(wrong) || 0,
        technicalScore: parseInt(correct) || 0,
        confidenceScore: parseInt(unanswered) || 0,
        overallRating: `Score: ${scorePercentage}% | Percentile: ${percentileEstimate}`,
        recommendation: recommendationPayload,
      },
    });

    res.status(201).json({
      success: true,
      data: testAttempt,
    });
  } catch (error) {
    console.error("Save MCQ test error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save MCQ test session",
    });
  }
};

module.exports = {
  startInterview,
  evaluateInterview,
  saveInterview,
  getInterviewHistory,
  getInterviewReport,
  generateMcqTest,
  evaluateMcqTest,
  saveMcqTest,
};
