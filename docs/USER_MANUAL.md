# User Manual: HireMind AI Platform

Welcome to the **HireMind AI** user manual. This document guides candidates, recruiters, and system administrators through the features of the platform.

---

## 1. Candidate User Guide

### 1.1. Setup & Resume Analysis
1. Register your candidate account on the registration page and log in.
2. Under the **Dashboard** tab, locate the **Resume Workspace**.
3. Drag and drop your CV/Resume in PDF or Text format to trigger the parsing service.
4. Go to **ATS Optimizer** in the navigation bar. You will see:
   - Your overall ATS Match Score out of 100.
   - Specific feedback categories (Skills, Formatting, Experience, and Keywords).
   - Suggestions for improvements (e.g. missing skills and keywords).
5. Archiving old versions: Re-uploading a resume automatically moves the previous file to the **Resume History** archive tab for recovery.

### 1.2. Degree & Credentials Upload
1. Under **Portfolio Space** in the Navbar, locate the **Degree & Certificates Verification Hub** card.
2. Select your Degree PDF or course certificate files and click **Upload Selected Documents**.
3. Uploading saves the documents directly to Cloudinary and marks them as verified. Recruiters can audit these documents in the applicants view.

### 1.3. Job Board & Skill Gap
1. Click **Browse Jobs** to view all active openings.
2. Switch tabs between **🌐 All Positions**, **💼 Internal Jobs**, and **🤖 External Scraped Web Jobs**.
   - **Internal Jobs**: Posted directly by recruiters on HireMind.
   - **External Web Jobs**: Scraped from sites like RemoteOK, Internshala, and Telegram, enhanced by Gemini AI metadata summaries.
3. Click **View Details** on any job card.
4. Select the **Skill Gap Analysis** tab. The AI will compare your skills to the requirements, pinpointing gaps and providing course resources.
5. Select the **AI Cover Letter** tab and click **Generate Cover Letter** to generate a custom-tailored cover letter based on your resume and the job details. Copy the text or download it as a PDF.
6. Click **Apply Now** for internal jobs or **Apply Externally ↗** to go to external job listings.

### 1.4. Practice Mock MCQ Tests
1. Click **Mock Interview** in the navigation bar.
2. Search and select a target company (e.g., Google, TCS), designation role, and assessment type (e.g., HR Interview, Coding, Logical Reasoning).
3. The AI generates 50 multiple-choice questions. Select your options and navigate using the **Next** and **Previous** buttons.
4. Submit the test. The scorecard displays:
   - Correct, Wrong, and Unanswered counts.
   - Competency analysis (Strengths, Weaknesses, Recommended Certifications).
   - Scrollable question list showing the correct answer keys alongside your answers.
5. Download your performance report as a PDF by clicking **Download PDF Report**.

---

## 2. Recruiter User Guide

### 2.1. Company Configuration & Job Postings
1. Register a recruiter account and configure your **Company Profile** (Logo, Description, Web URL, Industry type, Size).
2. Go to your dashboard and click **Create Job Posting**.
3. Input the Title, Description, Location, Salary, Job Type (Full Time, Internship, etc.), and Required Skills tags, then post it.

### 2.2. Screening Candidates
1. Click **View Applicants** on any active job on your dashboard.
2. Click **🤖 AI Rank Candidates**. Gemini AI will analyze candidate resumes and rank them by match percentage.
3. Select candidates to compare side-by-side using the checklist boxes (max 2 candidates) and click **Compare Selected**.
4. To audit documents, view the applicant cards. You can download their Degree PDFs or verification certificates under the **Verified Educational Credentials** section.

### 2.3. Drag-and-Drop Pipeline Board (Kanban)
1. Go to **Applicants** and click **View Kanban Board**.
2. Drag and drop candidate cards across stages (**Applied**, **Reviewed**, **Shortlisted**, **Interview Scheduled**, **Selected**, **Hired**).
3. Double-click any candidate card to open the **Interview Scheduler** popup. Provide dates, meeting URLs (Zoom/Google Meet), and instructions. Updates will notify the candidate.

### 2.4. RAG Assistant
1. Upload company policies, benefit booklets, or handbooks.
2. Query the chatbot (e.g., "What is the training probation policy?") to receive answers sourced strictly from your uploaded files.

### 2.5. Issuing Offer Letters
1. Click **Generate Official Offer Letter PDF** on any candidate's application card.
2. Input the Company Name, Designation Role, Salary CTC, and Expected Joining Date, then click **Generate**.
3. The backend generates a signed PDF and uploads it to Cloudinary. The candidate will receive a notification and a download button on their dashboard.

---

## 3. Admin User Guide

### 3.1. Dashboards and Platform KPIs
1. Log in with an Administrator account and navigate to the **Admin Panel**.
2. Review system counts (Candidates, Recruiters, Jobs, Applications) and roles charts.

### 3.2. Account Moderation
1. Under the **Manage Users** tab, search for registered accounts by email.
2. Click **Suspend** to restrict login access, or **Activate** to lift suspensions.
3. Click **Delete** to permanently erase a user profile and their associated data.

### 3.3. Job Monitoring
1. Select the **Manage Jobs** tab to audit postings.
2. Click **Delete Posting** to remove inappropriate job postings.

### 3.4. Activity Audit Logs
1. Select the **Activity Audit Logs** tab.
2. Audit the system trail (event types, operational details, initiator IDs, and timestamps).
