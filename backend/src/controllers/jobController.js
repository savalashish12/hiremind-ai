const prisma = require('../config/prisma');

const createJob = async (req, res) => {

  try {

    const {
      title,
      description,
      location,
      salary,
      jobType,
      skillsRequired,
    } = req.body;

    if (
      !title ||
      !description ||
      !location ||
      !salary ||
      !jobType
    ) {
      return res.status(400).json({
        message:
          "All fields are required",
      });
    }

    const job =
      await prisma.job.create({
        data: {
          title,
          description,
          location,
          salary,
          jobType,
          skillsRequired,
          recruiterId:
            req.user.id,
        },
      });

    res.status(201).json(job);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

const getAllJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      include: {
        recruiter: true,
      },
    });

    res.status(200).json(jobs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getJobApplicants = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications =
      await prisma.application.findMany({
        where: {
          jobId,
        },

        include: {
          candidate: {
            include: {
              candidateProfile: true,
            },
          },
        },

        orderBy: {
          matchScore: 'desc',
        },
      });

    res.status(200).json(applications);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


const getRecruiterJobs =
async (req, res) => {

  try {

    const jobs =
      await prisma.job.findMany({

        where: {
          recruiterId:
            req.user.id,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    res.status(200).json(
      jobs
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};

const getRecruiterAnalytics =
async (req, res) => {

  try {

    const recruiterJobs =
      await prisma.job.findMany({

        where: {
          recruiterId:
            req.user.id,
        },

        include: {
          applications: true,
        },
      });

    const totalJobs =
      recruiterJobs.length;

    let totalApplications = 0;

    let shortlistedCount = 0;

    let rejectedCount = 0;

    recruiterJobs.forEach(
      (job) => {

        totalApplications +=
          job.applications.length;

        job.applications.forEach(
          (application) => {

            if (
              application.status ===
              "SHORTLISTED"
            ) {

              shortlistedCount++;
            }

            if (
              application.status ===
              "REJECTED"
            ) {

              rejectedCount++;
            }
          }
        );
      }
    );

    res.status(200).json({

      totalJobs,

      totalApplications,

      shortlistedCount,

      rejectedCount,
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
  createJob,
  getAllJobs,
  getJobApplicants,
  getRecruiterJobs,
  getRecruiterAnalytics,
};