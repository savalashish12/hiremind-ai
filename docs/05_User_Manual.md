# CHAPTER 6: USER MANUAL

This user manual outlines the key workflows and actions available to Candidates, Recruiters, and Administrators within the **HireMind AI** platform.

---

## 5.1 Candidate Guide

### 1. Register & Login
1.  Navigate to the login page.
2.  To create a new account, click the **Sign Up** tab.
3.  Fill in the registration form: Full Name, Email, Password, and set the user role toggle to **Candidate**.
4.  Click **Create Account**. After successful registration, use your credentials on the Login screen to log in.

### 2. Upload Resume
1.  From the Candidate Dashboard, click **Upload Resume** in the top navigation bar or sidebar menu.
2.  Click the drag-and-drop zone to select a PDF resume file from your local storage.
3.  Confirm the file selection (file size must be under 5MB).
4.  Click **Process Resume** to upload and parse the document.

### 3. ATS Analysis
1.  Once your resume is processed, click the **ATS Review** tab.
2.  View the computed ATS Match Score gauge (e.g. 85%).
3.  Review the listed resume feedback, categorized into **Strengths**, **Weaknesses**, and **Hiring Recommendations**.
4.  Check the **Missing Skills** list to identify areas where your resume can be improved for target job listings.

### 4. Career Roadmap
1.  Navigate to the **Career Guide** section in the main menu.
2.  Select your target job role (e.g., Frontend Engineer, Data Analyst).
3.  Click **Generate Roadmap**.
4.  Review the step-by-step career path, which outlines technical competencies to study and lists recommended learning resources.

### 5. Apply for Jobs
1.  Click **Job Openings** in the sidebar.
2.  Browse active job listings, or filter them by keywords, location, and salary requirements.
3.  Click on a job card to view its description, required skills, and calculated match score.
4.  Click **Apply Now** to submit your profile and resume.

### 6. Notifications
1.  Check the **Notification Panel** icon (bell symbol) in the top-right header.
2.  View updates regarding application status changes (e.g. "Screened" or "Offered").
3.  Click on individual notifications to read details or clear them from the list.

### 7. Mock Interview
1.  Navigate to the **Practice Hub** section.
2.  Select your target company (e.g., Google, Amazon) and assessment type (e.g. Technical MCQ, HR Round).
3.  Click **Start Assessment** to load 25 customized multiple-choice questions.
4.  Select your answers within the allotted time.
5.  Click **Submit Assessment** to view your score, breakdown of correct answers, and recommended topics for review.

### 8. Saved Jobs
1.  While browsing jobs, click the **Bookmark** icon on any job card.
2.  Access these listings later by navigating to the **Saved Jobs** tab in the sidebar.
3.  Apply to saved listings directly from this view, or remove them from bookmarks.

---

## 5.2 Recruiter Guide

### 1. Login & Company Profile
1.  Log in to the platform with your Recruiter account credentials.
2.  Navigate to the **Company Profile** tab in the settings menu.
3.  Fill in company details: Logo URL, Official Website, Industry Type, Team Size, and Location.
4.  Click **Save Profile** to update these public details.

### 2. Create Job Posting
1.  Go to the Recruiter Dashboard and click **Post a Job**.
2.  Enter job details: Title, Location, Salary Range, Job Type (Full-time, Internship, etc.), required skills, and the full job description.
3.  Click **Submit Job** to publish the listing.

### 3. Edit & Delete Jobs
1.  Navigate to the **Manage Jobs** section.
2.  Click the **Edit** icon next to a job listing to update details like description or required skills.
3.  Click the **Delete** icon to remove old listings. Deleted listings are archived, removing them from candidate search views.

### 4. View Applicants
1.  Go to the **Applicants** tab.
2.  Select a job posting from the dropdown menu to view the candidate pipeline.
3.  The Kanban pipeline categorizes applicants into columns: **Applied**, **Screened**, **Interview**, **Offered**, and **Rejected**.
4.  Drag-and-drop candidate cards across columns to update application statuses.

### 5. Schedule Interview
1.  Select a candidate card in the pipeline.
2.  Click **Schedule Interview**.
3.  Enter interview details: Date, Time slot, Video Meeting Link, and Interviewer instructions.
4.  Click **Save Schedule** to notify the candidate.

### 6. Candidate Comparison
1.  In the applicant tracking view, select checkboxes next to candidate profiles.
2.  Click **Compare Profiles**.
3.  View candidate profiles side-by-side to compare overall ATS match scores, key skills, and experience history.

### 7. Analytics Dashboard
1.  From the recruiter home page, click **Analytics**.
2.  Review visual charts detailing recruitment metrics, including application volumes and pipeline stage distributions.

### 8. Offer Letter Generation
1.  Advance a candidate's status to the **Offered** stage.
2.  Click **Generate Offer Letter**.
3.  Enter joining details: Candidate Name, Job Title, Annual Salary (CTC), and Onboarding Date.
4.  Click **Issue Offer** to generate a PDF offer letter, which is saved to Cloudinary and made available to the candidate.

---

## 5.3 Admin Guide

### 1. User Management
1.  Log in with your administrator credentials.
2.  Navigate to the **User Accounts** section in the admin panel.
3.  View lists of registered user profiles categorized by role (Candidate or Recruiter).

### 2. Recruiter Management
1.  Click the **Recruiters** sub-menu to view registered recruiters and company affiliations.
2.  Verify new recruiter credentials, and update profiles when requested.

### 3. Candidate Management
1.  Go to the **Candidates** sub-menu to view candidate profiles.
2.  Administrators can review profiles to ensure uploaded resumes comply with platform guidelines.

### 4. Job Management
1.  Access the **Global Job Postings** dashboard.
2.  Review postings across all companies. Administrators can edit or delete job listings that violate posting terms.

### 5. Analytics Dashboard
1.  The Admin home page displays global metrics, including:
    *   Total system users (Candidates vs. Recruiters).
    *   Total job postings.
    *   System activity logs.
2.  Review these metrics to monitor overall platform engagement.

### 6. Suspend Accounts
1.  If a user violates platform guidelines, go to their user details page.
2.  Click **Suspend Account**.
3.  This sets `isSuspended` to true, blocking the user from logging in. Click **Activate Account** to restore access.
