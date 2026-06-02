# Testing Report: HireMind AI Platform

This document presents the technical testing methodologies, test cases, and verification results for the **HireMind AI** recruitment platform.

---

## 1. Testing Methodology

The HireMind AI platform was verified using a combination of automated unit/integration test scripts and manual end-to-end user journey walk-throughs:

* **Backend Test Script**: A test runner (`src/utils/testSystem.js`) verified endpoints (Auth guards, candidate actions, recruiter rankings, interview evaluation, admin dashboard activity retrieval).
* **Database Constraints Check**: Database triggers and Prisma ORM constraints were tested to ensure data integrity during cascade deletions.
* **Frontend UI Check**: Visual components were tested across layout viewports to ensure responsive designs, mobile compatibilities, and clean glassmorphism styling.

---

## 2. Detailed Test Cases

### 2.1. Security and User Access

| Test ID | Test Scenario | Inputs | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-SEC-01** | Candidate Registration | `POST /api/auth/register` with new Candidate credentials. | Returns `201 Created` with signed JWT access token. | **PASS** |
| **TC-SEC-02** | Prevent Duplicate Registrations | `POST /api/auth/register` with existing email address. | Returns `400 Bad Request` with "Email already in use". | **PASS** |
| **TC-SEC-03** | Suspended Account Interception | `POST /api/auth/login` for user with `isSuspended: true`. | Returns `403 Forbidden` login blocker message. | **PASS** |
| **TC-SEC-04** | Role Access Guards | Request `GET /api/admin/users` using Candidate JWT header. | Returns `403 Forbidden` unauthorized role message. | **PASS** |

### 2.2. Candidate AI and Portfolios

| Test ID | Test Scenario | Inputs | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-CAND-01**| Resume Upload and Parsing | PDF upload to `POST /api/application/upload-resume`. | Returns `200 OK` with JSON of extracted skills and education. | **PASS** |
| **TC-CAND-02**| ATS Optimization Suggestions| Request `GET /api/ats/analyze` post resume upload. | Returns JSON score matrices (formatting, keywords, experience). | **PASS** |
| **TC-CAND-03**| Job Bookmarking | Request `POST /api/candidate/saved-jobs/:id`. | Saves bookmark record to `SavedJob` table. | **PASS** |
| **TC-CAND-04**| Skill Gap Check | Query `/api/skills/gap-analysis` with jobId. | Returns missing skills list and learning link suggestions. | **PASS** |
| **TC-CAND-05**| Issue Verification Docs | Multi-part upload to `POST /api/candidate/upload-credentials`. | Saves Degree and Certificates to Cloudinary and database. | **PASS** |

### 2.3. AI Mock MCQ Test Engine

| Test ID | Test Scenario | Inputs | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-MCQ-01** | Start AI MCQ generation | Request `POST /api/interview/start` for "Java Dev" role. | Returns 50 multiple choice questions with option arrays. | **PASS** |
| **TC-MCQ-02** | Evaluation & Scoring | Submit QA arrays to `POST /api/interview/evaluate`. | Returns Comm, Tech, and Conf scores, plus feedback. | **PASS** |
| **TC-MCQ-03** | Mock Session Logging | Request `POST /api/interview/save` with evaluation results.| Saves mock session details to database. | **PASS** |

### 2.4. Recruiter Tools & Pipelines

| Test ID | Test Scenario | Inputs | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-REC-01** | AI Candidate Ranking | Call `POST /api/recruiter/rank-candidates` for job. | Returns ranked candidates lists sorted by match percentage. | **PASS** |
| **TC-REC-02** | Kanban column drag move | Request `PATCH /api/recruiter/pipeline/move`. | Updates application column status in database. | **PASS** |
| **TC-REC-03** | RAG Document Upload | Upload policy file to `POST /api/ai/upload-document`. | Indexes doc snippets to database for policy queries. | **PASS** |
| **TC-REC-04** | Issue PDF Offer Letter | Request `POST /api/application/:id/offer-letter`. | Generates a signed PDF via `pdfkit`, saves to Cloudinary. | **PASS** |

### 2.5. Admin Controls & Audits

| Test ID | Test Scenario | Inputs | Expected Output | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-ADM-01** | Audit Trail Logging | Check `GET /api/admin/activity-logs` after database updates. | Returns logs (event types, initiator IDs, details). | **PASS** |
| **TC-ADM-02** | Account Suspension Toggle | Set suspension flag `PUT /api/admin/users/:id/suspend`. | Updates user's `isSuspended` flag in PostgreSQL database. | **PASS** |
| **TC-ADM-03** | Candidate Account Deletion | Call `DELETE /api/admin/users/:id` for Candidate. | Deletes User, CandidateProfile, applications, and saved jobs. | **PASS** |

---

## 3. Testing Summary

* **Total Test Cases**: 17
* **Total Passed**: 17
* **Total Failed**: 0
* **Test Status**: **100% PASS**

All endpoints, middleware filters, AI features, and database triggers have passed verification, confirming the system's stability for the final MCA evaluation.
