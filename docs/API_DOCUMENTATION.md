# API Documentation: HireMind AI Platform

This document describes all server-side REST API endpoints exposed by the **HireMind AI** backend service, including requests, authorization rules, expected payloads, and response JSON formats.

---

## 1. Authentication Endpoints (`/api/auth`)

### 1.1. User Registration
* **Endpoint**: `POST /api/auth/register`
* **Access**: Public
* **Request Body**:
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123",
  "role": "CANDIDATE" // Options: "CANDIDATE", "RECRUITER"
}
```
* **Success Response (201 Created)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "e44d3b6f-870a-4bf7-a55e-e67c87c71d2b",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "CANDIDATE"
  }
}
```

### 1.2. User Login
* **Endpoint**: `POST /api/auth/login`
* **Access**: Public
* **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "Password123"
}
```
* **Success Response (200 OK)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "e44d3b6f-870a-4bf7-a55e-e67c87c71d2b",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "CANDIDATE"
  }
}
```

---

## 2. Candidate Endpoints (`/api/candidate`)

### 2.1. Upload Credentials / Documents
* **Endpoint**: `POST /api/candidate/upload-credentials`
* **Access**: Private (Role: `CANDIDATE` only)
* **Request Type**: `multipart/form-data`
* **Request Files**:
  * `degree` (File, single, PDF/TXT degree certificate)
  * `certificates` (Files, multiple, PDF/TXT credentials certificates)
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Credentials uploaded successfully",
  "data": {
    "id": "87e35b71-12c8-47bc-ad78-d7b37cd7b78f",
    "userId": "e44d3b6f-870a-4bf7-a55e-e67c87c71d2b",
    "degreeUrl": "https://res.cloudinary.com/demo/raw/upload/v1/credentials/degree.pdf",
    "certUrls": [
      {
        "name": "AWS_Cloud_Practitioner",
        "url": "https://res.cloudinary.com/demo/raw/upload/v1/credentials/aws.pdf",
        "uploadedAt": "2026-06-02T19:00:00.000Z"
      }
    ]
  }
}
```

### 2.2. Generate AI Cover Letter
* **Endpoint**: `POST /api/candidate/cover-letter`
* **Access**: Private (Role: `CANDIDATE` only)
* **Request Body**:
```json
{
  "jobId": "f78d37de-1c39-4d2a-8f92-ec6d82d909f1"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": "Dear Hiring Manager,\n\nI am writing to express my interest in the Software Engineer position..."
}
```

### 2.3. Bookmark Job
* **Endpoint**: `POST /api/candidate/saved-jobs/:jobId`
* **Access**: Private (Role: `CANDIDATE` only)
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Job saved successfully",
  "data": {
    "saved": true
  }
}
```

---

## 3. Recruiter Endpoints (`/api/recruiter`)

### 3.1. Issue Offer Letter PDF
* **Endpoint**: `POST /api/application/:applicationId/offer-letter`
* **Access**: Private (Role: `RECRUITER` only)
* **Request Body**:
```json
{
  "companyName": "Acme Corporation",
  "role": "Software Engineer",
  "salary": "12,00,000",
  "joiningDate": "2026-07-01"
}
```
* **Success Response (200 OK)**:
```json
{
  "message": "Offer letter generated successfully",
  "application": {
    "id": "a90b4d90-349f-4318-ae7f-947b7dfb8cf8",
    "status": "OFFERED",
    "offerLetterUrl": "https://res.cloudinary.com/demo/raw/upload/v1/offer-letters/offer.pdf",
    "offerLetterDetails": {
      "companyName": "Acme Corporation",
      "role": "Software Engineer",
      "salary": "12,00,000",
      "joiningDate": "2026-07-01"
    }
  }
}
```

### 3.2. Move Candidate Kanban Column
* **Endpoint**: `PATCH /api/recruiter/pipeline/move`
* **Access**: Private (Role: `RECRUITER` only)
* **Request Body**:
```json
{
  "applicationId": "a90b4d90-349f-4318-ae7f-947b7dfb8cf8",
  "newStage": "Shortlisted" // Options: "Applied", "Reviewed", "Shortlisted", "InterviewScheduled", "Selected", "Hired"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "id": "a90b4d90-349f-4318-ae7f-947b7dfb8cf8",
    "pipelineStage": "Shortlisted",
    "status": "SHORTLISTED"
  }
}
```

### 3.3. AI Candidate Ranking
* **Endpoint**: `POST /api/recruiter/rank-candidates`
* **Access**: Private (Role: `RECRUITER` only)
* **Request Body**:
```json
{
  "jobId": "f78d37de-1c39-4d2a-8f92-ec6d82d909f1"
}
```
* **Success Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
      "candidateId": "user-uuid-1",
      "name": "Jane Doe",
      "fitScore": 92,
      "fitPercentage": "92%",
      "strengths": ["React expert", "Microservices architecture"],
      "concerns": ["Limited experience in Java"],
      "recommendation": "Highly suitable candidate for Senior React Role."
    }
  ]
}
```

---

## 4. Job Endpoints (`/api/jobs`)

### 4.1. Retrieve Scraped External Jobs
* **Endpoint**: `GET /api/jobs/external`
* **Access**: Public
* **Query Parameters**:
  * `search` (String, e.g. "React")
  * `location` (String, e.g. "Remote")
  * `category` (String, e.g. "Frontend")
  * `experienceLevel` (String, e.g. "Senior")
  * `source` (String, e.g. "TELEGRAM")
* **Success Response (200 OK)**:
```json
[
  {
    "id": "ext-job-uuid-1",
    "title": "Remote React Developer",
    "company": "Remote Company",
    "location": "Remote",
    "description": "Scraped remote job details...",
    "skills": ["REACT", "JAVASCRIPT"],
    "salary": "$80,000 - $110,000",
    "applyUrl": "https://remoteok.com/remote-jobs/...",
    "source": "RemoteOK",
    "sourceType": "RSS",
    "summary": "AI summary of the job description.",
    "category": "Frontend",
    "experienceLevel": "Mid"
  }
}
```

---

## 5. Admin Endpoints (`/api/admin`)

### 5.1. Retrieve System Activity Audit Trail
* **Endpoint**: `GET /api/admin/activity-logs`
* **Access**: Private (Role: `ADMIN` only)
* **Success Response (200 OK)**:
```json
[
  {
    "id": "log-uuid-1",
    "action": "OFFER_LETTER_GENERATED",
    "details": "Offer letter generated for \"Jane Doe\" (Role: \"React Developer\") by recruiter",
    "userId": "recruiter-user-uuid",
    "createdAt": "2026-06-02T19:22:45.000Z"
  }
]
```
