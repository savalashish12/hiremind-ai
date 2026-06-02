# Final Project Report: HireMind AI – Recruitment & Career Intelligence Platform

This report serves as the comprehensive final thesis document for the **HireMind AI** platform. It has been structured to meet university standards for MCA final-year evaluations.

---

## 1. Project Abstract
Traditional hiring pipelines are slow, prone to bias, and lack real-time candidate career guidance. **HireMind AI** is a full-stack, AI-powered recruitment and career intelligence platform designed to streamline hiring processes for recruiters and provide career guidance for job seekers. Mapped over a three-tier architecture (React + Node.js + PostgreSQL) and integrated with Google Gemini AI models, the platform provides automated ATS scanning, skill gap analysis, personalized mock interviews, and automated recruitment workflows.

---

## 2. Introduction & Problem Statement
Recruitment processes suffer from inefficiencies on both ends:
1. **Recruiter Deficit**: Recruiters spend hours manual screening hundreds of resumes, scheduling interviews, and tracking applicant statuses.
2. **Candidate Guidance Gap**: Candidates submit applications without understanding how their skills align with job requirements, and lack tools for interview preparation.

**HireMind AI** addresses these issues by:
* Using AI to parse CVs, compute ATS fit scores, and highlight candidate strengths and weaknesses.
* Providing candidates with skill gap analysis, recommended resources, and mock interviews.
* Providing recruiters with AI-based applicant ranking, Kanban pipeline boards, video interview schedulers, RAG-based policy assistants, and automated offer letter generators.

---

## 3. System Requirements & Specifications

### 3.1. Hardware Requirements
* **Development Workstation**:
  - Processor: Intel Core i5 or higher / AMD Ryzen 5 or higher
  - RAM: 8 GB minimum (16 GB recommended)
  - Storage: 256 GB SSD minimum
* **Deployment Web Servers (Cloud)**:
  - RAM: 1 GB minimum
  - Storage: 10 GB SSD

### 3.2. Software Requirements
* **Operating System**: Windows 10/11, macOS, or Linux (Ubuntu 20.04 LTS+)
* **Runtime Environment**: Node.js runtime environment (v18.x or v20.x+)
* **Database Management System**: PostgreSQL relational engine database (v14 or higher)
* **ORM Engine**: Prisma Client ORM
* **Development Libraries**: Express.js framework, React (Vite template), Tailwind CSS library, Recharts plotting, jsPDF, pdfkit, Gemini API.

---

## 4. System Implementation & Features

### 4.1. Core Stability and Connection Optimization
To ensure database connections remain stable under concurrent loads, a Prisma connection singleton was implemented with Neon connection pool limits, supplemented by a 4-minute keep-alive ping loop to prevent database sleep timeouts. React location-based refetching ensures that dashboards refresh automatically upon navigation.

### 4.2. AI Mock Interview Practice Test Engine
Candidates can select a target company (e.g. Amazon, Google), a role, and an assessment type (e.g. Technical MCQ, HR Interview, Coding). The system uses Gemini to generate 50 multiple-choice questions, saves the answer keys in memory, evaluates candidate responses, and generates a scorecard with strengths and weaknesses. Candidates can also export their scorecards as PDF reports.

### 4.3. External Job Aggregation Engine
Using rss-parser and cheerio scrapers, the system retrieves external job postings from RemoteOK, Internshala, and Telegram channels every 12 hours. The scraped listings are enhanced by Gemini AI to extract structured metadata (skills, experience level, job categories, and summaries), allowing candidates to search and filter both internal and external jobs.

### 4.4. Offer Letter Generator
Recruiters can generate employment offer letters for selected candidates. The system uses `pdfkit` to compile a formal PDF containing the Candidate Name, Company, Salary, Role, and Joining Date. The PDF is stored on Cloudinary, the URL is saved to the database, and the candidate is notified with a download button on their dashboard.

### 4.5. Certificate & Credentials Verification
Candidates can upload university degrees and professional certificates to the Verification Hub. The files are stored on Cloudinary and mapped to their profile, allowing recruiters to view and verify candidate documents on the applicants details page.

### 4.6. Activity Audit Logging
Every critical action (job creations, updates, resume analyses, application submissions, interview setups, credentials uploads, and offer generations) is recorded in the `ActivityLog` table. Administrators can access these records on the Admin Dashboard to maintain a complete system audit trail.

---

## 5. Security & Verification Design
The system uses JWT-based authentication with role-based access controls to restrict routes based on user type (Candidate, Recruiter, Admin). Input validation and rate-limiting protect the backend from denial-of-service attempts. The platform was validated using a test runner verifying core operations, and achieved a 100% test pass rate.

---

## 6. Future Scope
* **Live Video Interview Analysis**: Integrate face/voice sentiment analysis during mock interviews to evaluate candidate confidence.
* **Blockchain-Based Credential Verification**: Use decentralized ledger technology to verify university degrees.
* **Multi-Channel Scrapers**: Expand the job aggregator to crawl corporate career sites and automated job portals.
