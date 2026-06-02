# HireMind AI – AI Recruitment & Career Intelligence Platform

**HireMind AI** is a full-stack, AI-powered recruitment and career intelligence platform designed for candidate screening, career guidance, and automated applicant tracking. It is built to meet final-year university MCA presentation standards.

---

## 🚀 Key Features

* **AI Resume Parser & ATS Score Optimizer**: Evaluates resumes, parses key skills, and provides suggestions to improve ATS compliance.
* **AI Mock MCQ Test Engine**: Generates 50 multiple-choice questions custom-tailored to target companies (e.g. Google, Amazon, TCS) and roles, with evaluation metrics.
* **External Job Scraper Engine**: Aggregates job postings from remote platforms (RemoteOK, Internshala, Telegram) every 12 hours, using Gemini AI to extract structured metadata.
* **Job Board & Skill Gap Analysis**: Compares candidate profiles to job descriptions to identify skill gaps, provide course resources, and generate custom cover letters.
* **Recruiter Kanban Pipeline & Interview Scheduler**: Provides a drag-and-drop board to manage applicants, schedule video interviews, and send automated notifications.
* **Verified Credentials Hub**: Allows candidates to upload degree certificates and course certificates to Cloudinary, visible to recruiters.
* **PDF Offer Letter Generator**: Recruiter issues a formal employment offer letter PDF, stored on Cloudinary and downloadable by the candidate.
* **RAG Policy Assistant Chatbot**: Allows recruiters to upload company handbooks and query policy information.
* **Admin Dashboard & System Audit trail**: Audits platform analytics, toggles user suspensions, deletes jobs, and views system logs.

---

## 🛠️ Technology Stack

* **Frontend**: React (Vite), Tailwind CSS, Recharts, React Router Dom, Axios, jsPDF
* **Backend**: Node.js, Express.js, Prisma Client ORM, pdfkit, node-cron, Cheerio
* **Database**: PostgreSQL (Neon RDS cloud)
* **Integrations**: Google Gemini AI (gemini-2.5-flash), Cloudinary Media Storage API, GitHub API

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js v18 or v20
* PostgreSQL local instance or Neon Cloud URI

### 1. Database Setup & Migrations
Ensure you have created a PostgreSQL database. Navigate to the backend folder and copy `.env.example` to `.env`. Update the `DATABASE_URL` string:
```bash
DATABASE_URL="postgresql://postgres:7433@localhost:5432/hiremind_ai?connection_limit=10"
GEMINI_API_KEY="your-gemini-key"
CLOUDINARY_URL="your-cloudinary-url"
```
Run Prisma migrations:
```bash
cd backend
npx prisma db push
npx prisma generate
```

### 2. Seed Demo Data
To populate the database with demo data (10 recruiters, 20 candidates, 50 jobs, 100 applications, scheduled interviews, and activity logs), run:
```bash
npm run seed
```

### 3. Start Backend Services
```bash
npm install
npm run dev
```

### 4. Start Frontend Client
Open a new terminal window:
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Verification & Automated Testing
To run the automated QA suite verifying Auth tokens, AI endpoints, and activity logs:
```bash
cd backend
npm run test
```

---

## 📂 Documentation Directory
Comprehensive university-ready academic reports are located in the [docs/](file:///F:/HireMind%20AI/docs) folder:
* [PROJECT_ARCHITECTURE.md](file:///F:/HireMind%20AI/docs/PROJECT_ARCHITECTURE.md): Three-tier data flow and sequence diagrams.
* [DATABASE_DESIGN.md](file:///F:/HireMind%20AI/docs/DATABASE_DESIGN.md): PostgreSQL ERDs and Data Dictionaries.
* [API_DOCUMENTATION.md](file:///F:/HireMind%20AI/docs/API_DOCUMENTATION.md): Endpoint specifications and JSON payloads.
* [USER_MANUAL.md](file:///F:/HireMind%20AI/docs/USER_MANUAL.md): Visual user guides for all roles.
* [TESTING_REPORT.md](file:///F:/HireMind%20AI/docs/TESTING_REPORT.md): Testing scenarios and verification results.
* [FINAL_PROJECT_REPORT.md](file:///F:/HireMind%20AI/docs/FINAL_PROJECT_REPORT.md): Comprehensive final project thesis.
