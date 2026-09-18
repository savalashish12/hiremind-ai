const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // 1. Delete existing data in proper dependency order
  console.log("Cleaning existing database records...");
  await prisma.mockInterview.deleteMany({});
  await prisma.candidatePortfolio.deleteMany({});
  await prisma.companyProfile.deleteMany({});
  await prisma.savedJob.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.companyDocument.deleteMany({});
  await prisma.application.deleteMany({});
  await prisma.job.deleteMany({});
  await prisma.candidateProfile.deleteMany({});
  await prisma.recruiterProfile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Database clean-up complete.");

  // Password for all seeded accounts
  const plainPassword = "123456";
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // 2. Seed Recruiters
  const recruiterCompanies = [
    { name: "Accenture", email: "accenture@test.com" },
    { name: "TCS", email: "tcs@test.com" },
    { name: "Infosys", email: "infosys@test.com" },
    { name: "Wipro", email: "wipro@test.com" },
    { name: "Cognizant", email: "cognizant@test.com" },
    { name: "Capgemini", email: "capgemini@test.com" },
    { name: "HCL", email: "hcl@test.com" },
    { name: "IBM", email: "ibm@test.com" },
    { name: "Deloitte", email: "deloitte@test.com" },
    { name: "Tech Mahindra", email: "techmahindra@test.com" },
  ];

  const recruiters = [];
  console.log("Seeding recruiters...");

  for (const company of recruiterCompanies) {
    const user = await prisma.user.create({
      data: {
        fullName: `${company.name} HR Team`,
        email: company.email,
        password: hashedPassword,
        role: "RECRUITER",
      },
    });

    await prisma.recruiterProfile.create({
      data: {
        userId: user.id,
        companyName: company.name,
        companyWebsite: `https://www.${company.name.toLowerCase().replace(" ", "")}.com`,
        companyDescription: `Leading global professional services and consulting firm driving digital transformation.`,
        industry: "Information Technology",
        companySize: "10,000+ employees",
      },
    });

    await prisma.companyProfile.create({
      data: {
        recruiterId: user.id,
        companyName: company.name,
        website: `https://www.${company.name.toLowerCase().replace(" ", "")}.com`,
        industry: "Consulting & Services",
        teamSize: "10000+",
        about: `Global leader in next-generation digital services and consulting. We enable clients in more than 50 countries to navigate their digital transformation.`,
        location: "Mumbai, India",
        founded: "1995",
      },
    });

    recruiters.push(user);
  }

  // 3. Seed Candidates (20 Realistic Profiles)
  const candidateNames = [
    "Aarav Mehta", "Ananya Iyer", "Aditya Rao", "Sneha Patel", "Rahul Sharma",
    "Aditi Deshmukh", "Vijay Kumar", "Priya Nair", "Vikram Singh", "Kavita Reddy",
    "Siddharth Joshi", "Meera Sen", "Amit Verma", "Nehal Shah", "Rohan Gupta",
    "Divya Chawla", "Abhishek Das", "Shreya Ghoshal", "Kunal Kapoor", "Tanvi Bhatia"
  ];

  const candidateSkills = [
    ["React", "Node.js", "Express", "MongoDB", "JavaScript", "HTML", "CSS"],
    ["Java", "Spring Boot", "MySQL", "Hibernate", "Microservices", "REST APIs"],
    ["Python", "Django", "PostgreSQL", "Flask", "Docker", "Git"],
    ["AWS", "DevOps", "Kubernetes", "Docker", "CI/CD", "Linux", "Terraform"],
    ["React Native", "Swift", "Kotlin", "Android", "Mobile Development", "Firebase"],
    ["Data Science", "Python", "Pandas", "Machine Learning", "SQL", "Tableau"],
    ["UI/UX Design", "Figma", "Adobe XD", "Wireframing", "Prototyping", "HTML"],
    ["C#", ".NET Core", "SQL Server", "Azure", "Entity Framework"],
  ];

  const candidates = [];
  console.log("Seeding candidates...");

  for (let i = 0; i < candidateNames.length; i++) {
    const email = `candidate${i + 1}@test.com`;
    const user = await prisma.user.create({
      data: {
        fullName: candidateNames[i],
        email: email,
        password: hashedPassword,
        role: "CANDIDATE",
      },
    });

    const skills = candidateSkills[i % candidateSkills.length];
    
    // Sample resume history
    const resumeHistory = [
      {
        name: `Resume_${candidateNames[i].replace(" ", "_")}_v1.pdf`,
        url: "https://res.cloudinary.com/demo/image/upload/v1700000000/resumes/dummy_v1.pdf",
        uploadedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        name: `Resume_${candidateNames[i].replace(" ", "_")}_v2.pdf`,
        url: "https://res.cloudinary.com/demo/image/upload/v1700000000/resumes/dummy_v2.pdf",
        uploadedAt: new Date().toISOString()
      }
    ];

    await prisma.candidateProfile.create({
      data: {
        userId: user.id,
        skills: skills,
        education: "Master of Computer Applications (MCA)",
        experience: `${(i % 3) + 1} years of experience in Software Development lifecycle.`,
        resumeUrl: "https://res.cloudinary.com/demo/image/upload/v1700000000/resumes/dummy_v2.pdf",
        professionalSummary: `Dedicated MCA graduate seeking to build robust software systems using modern technology stacks. Experienced in team collaboration and agile workflows.`,
        strengths: ["Problem Solving", "Technical Competency", "Team Collaboration"],
        weaknesses: ["Public Speaking", "Over-documentation"],
        hiringRecommendation: "Highly recommended for core developer roles.",
        linkedinUrl: `https://linkedin.com/in/${candidateNames[i].toLowerCase().replace(" ", "")}`,
        githubUrl: `https://github.com/${candidateNames[i].toLowerCase().replace(" ", "")}`,
        portfolioUrl: `https://${candidateNames[i].toLowerCase().replace(" ", "")}.dev`,
        certifications: ["AWS Cloud Practitioner", "Oracle Certified Java Associate"],
        resumeHistory: resumeHistory,
      },
    });

    await prisma.candidatePortfolio.create({
      data: {
        candidateId: user.id,
        githubUrl: `https://github.com/${candidateNames[i].toLowerCase().replace(" ", "")}`,
        linkedinUrl: `https://linkedin.com/in/${candidateNames[i].toLowerCase().replace(" ", "")}`,
        portfolioUrl: `https://${candidateNames[i].toLowerCase().replace(" ", "")}.dev`,
        projects: [
          { name: "E-Commerce Microservices", description: "Spring boot microservices backend", stars: 12 },
          { name: "AI Resume Parser", description: "Vite + Express app using Gemini API", stars: 24 }
        ],
        certifications: [
          { title: "React Certified Expert", issuer: "Meta" }
        ],
        achievements: [
          { title: "Smart India Hackathon Finalist", year: "2025" }
        ]
      }
    });

    candidates.push(user);
  }

  // 4. Seed Jobs (50 Realistic Postings)
  const jobRoles = [
    { title: "React Developer", skills: ["React", "JavaScript", "HTML", "CSS", "Git"], desc: "Responsible for building responsive client-side web applications using React Vite. Work closely with product designers and backend engineers." },
    { title: "Node.js Developer", skills: ["Node.js", "Express", "PostgreSQL", "REST APIs", "Git"], desc: "Build stable REST endpoints and database integrations using Express.js and Prisma ORM. Ensure speed, security, and scalability." },
    { title: "Java Engineer", skills: ["Java", "Spring Boot", "MySQL", "Hibernate", "Microservices"], desc: "Design and implement scalable corporate backend systems using Spring Boot and Oracle database. Collaborate in an Agile DevOps environment." },
    { title: "DevOps Architect", skills: ["AWS", "DevOps", "Docker", "Kubernetes", "CI/CD"], desc: "Manage server deployments on AWS, configure continuous integration pipelines, and write CloudFormation or Terraform templates." },
    { title: "Python Analyst", skills: ["Python", "Django", "SQL", "Pandas", "PostgreSQL"], desc: "Leverage Python data analytical libraries to build statistics feeds, automate reports generation, and manage database queries." },
  ];

  const cities = ["Bangalore", "Pune", "Hyderabad", "Noida", "Chennai", "Remote"];
  const salaries = ["6 LPA - 8 LPA", "8 LPA - 12 LPA", "12 LPA - 16 LPA", "16 LPA - 22 LPA"];
  const types = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT"];

  const jobs = [];
  console.log("Seeding jobs...");

  let jobCounter = 0;
  for (const rec of recruiters) {
    // Each recruiter posts 5 jobs
    for (let j = 0; j < 5; j++) {
      const role = jobRoles[j % jobRoles.length];
      const city = cities[jobCounter % cities.length];
      const sal = salaries[jobCounter % salaries.length];
      const type = types[jobCounter % types.length];

      const job = await prisma.job.create({
        data: {
          title: `${role.title}`,
          description: `${role.desc} Candidates must have strong problem-solving skills, basic debugging skills, and a solid understanding of software designs.`,
          location: city,
          salary: sal,
          jobType: type,
          skillsRequired: role.skills,
          status: "OPEN",
          recruiterId: rec.id,
        },
      });

      jobs.push(job);
      jobCounter++;
    }
  }

  // 5. Seed Applications (100 Applications with mixed statuses)
  console.log("Seeding applications...");
  let appCounter = 0;
  const statuses = ["APPLIED", "SHORTLISTED", "INTERVIEW_SCHEDULED", "SELECTED", "REJECTED"];
  const pipelineStages = ["Applied", "Reviewed", "Shortlisted", "InterviewScheduled", "Selected", "Hired"];

  // Loop candidates and assign to jobs
  for (let cIdx = 0; cIdx < candidates.length; cIdx++) {
    const candidate = candidates[cIdx];
    // Each candidate applies to 5 random jobs
    for (let aIdx = 0; aIdx < 5; aIdx++) {
      const job = jobs[(cIdx * 5 + aIdx) % jobs.length];
      const status = statuses[appCounter % statuses.length];
      
      let pStage = "Applied";
      if (status === "SHORTLISTED") pStage = "Shortlisted";
      else if (status === "INTERVIEW_SCHEDULED") pStage = "InterviewScheduled";
      else if (status === "SELECTED") pStage = "Selected";
      else if (status === "REJECTED") pStage = "Rejected";

      const score = Math.floor(Math.random() * 40) + 55; // 55 to 95%
      
      const interviewDate = status === "INTERVIEW_SCHEDULED" ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) : null;
      const interviewTime = status === "INTERVIEW_SCHEDULED" ? "11:00 AM" : null;
      const interviewLink = status === "INTERVIEW_SCHEDULED" ? "https://meet.google.com/abc-defg-hij" : null;
      const notes = status === "INTERVIEW_SCHEDULED" ? "Bring your resume and prepare for basic coding puzzles and OOPs concepts questions." : null;

      await prisma.application.create({
        data: {
          candidateId: candidate.id,
          jobId: job.id,
          matchScore: score,
          aiFeedback: `Candidate is a strong match for ${job.title} with solid knowledge in ${job.skillsRequired.slice(0, 3).join(", ")}. Strong academic MCA background.`,
          status: status,
          pipelineStage: pStage,
          interviewDate: interviewDate,
          interviewTime: interviewTime,
          interviewLink: interviewLink,
          interviewerNotes: notes,
          recruiterNotes: "Initial resume check passed.",
        },
      });

      // Seed notification for candidate
      await prisma.notification.create({
        data: {
          userId: candidate.id,
          title: `Application Update: ${job.title}`,
          message: `Your application to ${job.title} status has been updated to ${status.replace("_", " ")}.`,
          isRead: false,
        },
      });

      // Seed notification for recruiter
      await prisma.notification.create({
        data: {
          userId: job.recruiterId,
          title: "New Application Received",
          message: `${candidate.fullName} has applied for your job opening: ${job.title}. Match score: ${score}%.`,
          isRead: false,
        },
      });

      appCounter++;
    }
  }

  // 6. Seed Admin Account
  console.log("Seeding admin account...");
  await prisma.user.create({
    data: {
      fullName: "Admin Controller",
      email: "admin@test.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Seeding complete! Admin, candidates and recruiters generated.");
  console.log("--------------------------------------------------");
  console.log("Logins list for evaluation:");
  console.log("Admin: admin@test.com / 123456");
  console.log("Recruiter: accenture@test.com / 123456");
  console.log("Candidate: candidate1@test.com / 123456");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
