# PROJECT REPORT ON
## HireMind AI – AI Powered Recruitment & Career Intelligence Platform

**Submitted in Partial Fulfillment for the Award of the Degree of**  
**Master of Computer Applications (MCA)**  
*(Under Faculty of Science and Technology)*  
**Savitribai Phule Pune University (SPPU), Pune**  

**Academic Year: 2025–26**

---

### SUBMITTED BY:
**Mr. Ashish Dashrath Saval**  
Seat No: 52104  
Undergraduate Division / Year: MCA Final Year  

### UNDER THE GUIDANCE OF:
**Prof. Satish Kulkarni**  
*Project Guide, Department of Computer Applications*  

### INSTITUTION:
**JSPM’s Jayawantrao Sawant College of Engineering**  
*Department of Computer Applications (MCA)*  
*Hadapsar, Pune – 411028*  

---

<div style="page-break-after: always;"></div>

## CERTIFICATE

This is to certify that the project work entitled **"HireMind AI – AI Powered Recruitment & Career Intelligence Platform"** is a bonafide work completed by **Mr. Ashish Dashrath Saval** (Seat No: 52104) in partial fulfillment of the requirements for the award of the degree of **Master of Computer Applications (MCA)** from **Savitribai Phule Pune University (SPPU)** for the academic year 2025–26.

This project has been carried out under our supervision and guidance, and the content of this report has not been submitted to any other university or institution for the award of any other degree or diploma.


**Prof. Satish Kulkarni**  
*Project Guide*

**Prof. Swayam Shah**  
*Head of Department (HOD)*

**Prof. Dr. Pradeep A. Patil**  
*Principal, JSCOE*

**External Examiner:** ________________________  
**Date:** ____ / ____ / 2026  
**Place:** Hadapsar, Pune  

---

<div style="page-break-after: always;"></div>

## INTERNSHIP CERTIFICATE

### ANVISTAR ITS PVT. LTD.
*Office 402, Supreme Center, IT Park Road, Aundh, Pune – 411007*  
*Email: contact@anvistarits.com | Web: www.anvistarits.com*

**Date: 31st May 2026**

**TO WHOMSOEVER IT MAY CONCERN**

This is to certify that **Mr. Ashish Dashrath Saval**, a final year student of Master of Computer Applications (MCA) at Jayawantrao Sawant College of Engineering (JSCOE), Pune, has successfully completed his industrial internship training at **Anvistar ITS Pvt. Ltd.** from **26th December 2025 to 31st May 2026**.

During the internship tenure, he worked as an **AI & Full Stack Developer Intern** and was actively involved in the development, deployment, and testing of our proprietary application: **"HireMind AI – AI Powered Recruitment & Career Intelligence Platform"**.

During his tenure with us, we found him to be extremely diligent, technically sound, and a keen learner. His implementation of the Google Gemini AI integration and Prisma-PostgreSQL database transactions has been exceptional. He demonstrated strong professional ethics and matched our organizational values in every deliverable.

We wish him all the success in his future academic and professional endeavors.

For **Anvistar ITS Pvt. Ltd.**,  
*Human Resource Manager*  
*Anvistar ITS Pvt. Ltd., Pune*

---

<div style="page-break-after: always;"></div>

## EXPERIENCE LETTER

### ANVISTAR ITS PVT. LTD.
*Office 402, Supreme Center, IT Park Road, Aundh, Pune – 411007*  

**Date: 31st May 2026**

Dear **Ashish Dashrath Saval**,

Following the successful completion of your internship with us, we are pleased to issue this Experience Letter certifying your accomplishments during your tenure at **Anvistar ITS Pvt. Ltd.** from **26th December 2025 to 31st May 2026**.

In your capacity as an **AI & Full Stack Developer Intern**, you contributed directly to our core web solutions. Your key duties and achievements included:

*   **System Architecture & API Design:** Designing robust, scalable REST APIs using Node.js and Express.js, mapped to a PostgreSQL database via Prisma ORM, optimizing query response rates.
*   **Gemini AI System Integration:** Creating automated ATS parsing utilities, resume score algorithms, mock test generators, and cover letter generators leveraging the Gemini AI engine.
*   **Web Frontend Development:** Coding responsive, data-driven interfaces using React.js (Vite), Tailwind CSS, and Recharts, resulting in a 40% user engagement increase on candidate metrics.
*   **Quality Assurance & Database Design:** Developing custom seed scripts, transaction managers, database migration procedures, and running 50+ unit and integration test scripts to secure a bug-free production release.
*   **External Data Aggregators:** Drafting asynchronous scrapers with node-cron and Cheerio to clean and fetch jobs from external platforms.

Throughout your time at Anvistar ITS Pvt. Ltd., you demonstrated outstanding logic, analytical reasoning, and teamwork. Your overall performance was outstanding.

Sincerely,  
*Director of Engineering*  
*Anvistar ITS Pvt. Ltd., Pune*

---

<div style="page-break-after: always;"></div>

## DECLARATION

I, the undersigned, hereby declare that the project report entitled **"HireMind AI – AI Powered Recruitment & Career Intelligence Platform"** is an original work performed by me under the guidance of **Prof. Satish Kulkarni**, Department of Computer Applications, Jayawantrao Sawant College of Engineering, Hadapsar, Pune.

I further declare that this project work has been carried out as part of my industrial internship at **Anvistar ITS Pvt. Ltd.**, Pune. The content, findings, system designs, and code logic documented in this report have not been duplicated from any other project, website, or source without proper academic attribution. 

All sources of literature, libraries, frameworks, and APIs utilized during the implementation phase have been formally acknowledged in the bibliography.


**Date:** ____ / ____ / 2026  
**Place:** Hadapsar, Pune  
**Ashish Dashrath Saval**  
*(Seat No: 52104)*  

---

<div style="page-break-after: always;"></div>

## ACKNOWLEDGEMENT

The satisfaction that accompanies the successful completion of any project would be incomplete without expressing my gratitude to the individuals who made it possible.

First and foremost, I wish to express my deepest gratitude to my project guide, **Prof. Satish Kulkarni**, for his constant support, valuable advice, and continuous guidance throughout the duration of this project. His inputs on system design and database security helped keep this project aligned with academic standards.

I am highly indebted to **Prof. Swayam Shah**, Head of the Department of Computer Applications (MCA), for his scholarly advice, timely approvals, and for providing the resources and environment necessary to complete my final-year academic curriculum.

My special thanks go to **Prof. Dr. Pradeep A. Patil**, Principal of JSCOE, for his support and encouragement throughout my academic studies.

I also extend my sincere appreciation to the engineering team and my supervisor at **Anvistar ITS Pvt. Ltd.** for giving me the opportunity to work as an AI & Full Stack Developer Intern. The hands-on training, code reviews, and mentorship I received during these five months were instrumental in helping me develop full-stack development skills.

Finally, I am extremely grateful to my parents and classmates for their moral support, motivation, and valuable suggestions throughout this project journey.


**Ashish Dashrath Saval**  
*(Seat No: 52104)*  

---

<div style="page-break-after: always;"></div>

## ABSTRACT

Traditional hiring processes are slow, manual, and prone to human bias, often leaving recruiters overwhelmed by hundreds of resumes. At the same time, job seekers face a career intelligence gap, struggling to align their resumes with dynamic job market demands or prepare for target-company interviews. 

**HireMind AI** is an AI-powered Recruitment & Career Intelligence Platform designed to streamline candidate screening, automate recruitment pipelines, and provide personalized career assistance. It features a three-tier architecture utilizing **React.js (Vite)** on the frontend, **Node.js and Express.js** on the backend, and a cloud-based **PostgreSQL** database managed via **Prisma Client ORM**.

The system features:
1.  **AI Resume Analyzer & ATS Score Optimizer:** Leverages Google Gemini AI to parse uploaded PDF resumes, calculate compatibility ratings, identify missing skills, and suggest improvements.
2.  **AI Mock MCQ Practice Test Engine:** Dynamically generates custom, company-specific technical and HR multiple-choice questions (e.g. for Google, TCS, Amazon), grades user submissions, monitors completion speed, and generates detailed performance analytics.
3.  **External Job Aggregator Engine:** Periodically aggregates listings from various sites using node-cron and Cheerio, using Gemini AI to clean and extract structured metadata (skills, categories, experience levels).
4.  **Offer Letter & PDF Generation:** Automates onboarding by generating employment agreements as downloadable PDF documents hosted on Cloudinary.
5.  **Recruiter Kanban Pipeline & Dashboard Analytics:** Provides a visual workflow to manage candidates, alongside a RAG-based policy assistant to answer query logs using company handbooks.

This report documents the entire software development lifecycle (SDLC) of the HireMind AI platform, including analysis, database schema, UML architectures, algorithms, testing protocols, and user guides.

---

<div style="page-break-after: always;"></div>

## TABLE OF CONTENTS

*   **Preliminary Pages**
    *   Cover Page
    *   Certificate
    *   Internship Certificate
    *   Experience Letter
    *   Declaration
    *   Acknowledgement
    *   Abstract
*   **Chapter 1: Introduction**
    *   1.1 Company Profile
    *   1.2 Project Profile
    *   1.3 Existing System
    *   1.4 Scope of Project
    *   1.5 Operating Environment
    *   1.6 Technology & Tools Used
*   **Chapter 2: Proposed System**
    *   2.1 Proposed System
    *   2.2 Modules of Proposed System
    *   2.3 Objectives of Proposed System
    *   2.4 Fact Finding Technique
    *   2.5 Feasibility Study
*   **Chapter 3: Analysis and Design**
    *   3.1 Functional Requirements
    *   3.2 Non-Functional Requirements
    *   3.3 System Architecture
    *   3.4 Entity Relationship Diagram (ERD)
    *   3.5 UML Diagrams
    *   3.6 Table Structures
    *   3.7 Data Dictionary
    *   3.8 Sample Input Screens
    *   3.9 Sample Output Screens
    *   3.10 Reports
*   **Chapter 4: Coding and Testing**
    *   4.1 Algorithms
    *   4.2 Flowcharts
    *   4.3 Code Snippets
    *   4.4 Test Strategy
    *   4.5 Test Procedure
    *   4.6 Unit Test Case Plan
    *   4.7 Acceptance Test Plan
    *   4.8 Test Cases
    *   4.9 Defect Report & Test Log
*   **Chapter 5: User Manual**
    *   5.1 Candidate Guide
    *   5.2 Recruiter Guide
    *   5.3 Admin Guide
*   **Chapter 6: Conclusion and References**
    *   6.1 Limitations & Drawbacks
    *   6.2 Future Enhancements
    *   6.3 Conclusions
    *   6.4 Bibliography & References
