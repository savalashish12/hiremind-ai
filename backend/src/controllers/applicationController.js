const {
  calculateMatchScore,
} = require('../services/matchingService');

const fs = require('fs');
const pdfParse = require('pdf-parse');

const {
  extractResumeData,
} = require('../services/aiService');

const prisma = require('../config/prisma');

const cloudinary =
  require("../config/cloudinary");

const {
  sendStatusEmail,
} = require(
  "../services/emailService"
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

    const candidateSkills =
      candidateProfile?.skills || [];

    const candidateExperience =
      candidateProfile?.experience || "";

    const candidateEducation =
      candidateProfile?.education || "";

    const matchResult =
      calculateMatchScore(
        candidateSkills,
        job.skillsRequired,
        candidateExperience,
        candidateEducation
      );
    
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
            matchResult.score,

          aiFeedback:
            matchResult.feedback,
        },
      });

    res.status(201).json({

      message:
        'Applied successfully',

      matchScore:
        matchResult.score,

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
          resource_type: "raw",
          folder: "hiremind-resumes",
        }
      );

    const pdfBuffer = fs.readFileSync(filePath);

    const parsedPdf = await pdfParse(pdfBuffer);

    const extractedData =
      await extractResumeData(parsedPdf.text);

    const updatedProfile =
      await prisma.candidateProfile.upsert({

        where: {
          userId: req.user.id,
        },

        update: {

          resumeUrl:
           uploadedFile.secure_url,

          skills:
            extractedData.skills,

          education:
            extractedData.education,

          experience:
            extractedData.experience,

          professionalSummary:
            extractedData.professionalSummary,

          strengths:
            extractedData.strengths,

          weaknesses:
            extractedData.weaknesses,

          hiringRecommendation:
            extractedData.hiringRecommendation,
        },

        create: {

          userId: req.user.id,

          resumeUrl:
           uploadedFile.secure_url,

          skills:
            extractedData.skills,

          education:
            extractedData.education,

          experience:
            extractedData.experience,

          professionalSummary:
            extractedData.professionalSummary,

          strengths:
            extractedData.strengths,

          weaknesses:
            extractedData.weaknesses,

          hiringRecommendation:
            extractedData.hiringRecommendation,
        },
      });
      
    res.status(200).json({
      message: 'Resume analyzed successfully',
      extractedData,
      profile: updatedProfile,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};

const getMyApplications =
async (req, res) => {

  try {

    const applications =
      await prisma.application.findMany({
        where: {
          candidateId:
            req.user.id,
        },

        include: {
          job: true,
        },
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

const updateApplicationStatus =
  async (req, res) => {

    try {

      const { applicationId } =
        req.params;

      const { status } =
        req.body;

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

      await sendStatusEmail(

        application.candidate.email,

        application.candidate.fullName,

        status,

        application.job.title
      );

      res.status(200).json({

        message:
          "Application updated",

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

module.exports = {
  applyToJob,
  uploadResume,
  getMyApplications,
  updateApplicationStatus,
};