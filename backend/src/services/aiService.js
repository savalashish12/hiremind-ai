const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey:
    process.env.GROQ_API_KEY,
});

const extractResumeData =
  async (resumeText) => {

    try {

      const prompt = `
You are an AI hiring assistant.

Analyze this resume carefully.

Extract and generate:

1. skills (array)
2. education
3. experience
4. professionalSummary
5. strengths (array)
6. weaknesses (array)
7. hiringRecommendation

Return ONLY valid JSON.

Example:

{
  "skills": ["React", "Node.js"],
  "education": "MCA",
  "experience": "2 years internship experience",
  "professionalSummary": "Strong frontend developer with backend knowledge",
  "strengths": [
    "Good React skills",
    "Backend API understanding"
  ],
  "weaknesses": [
    "Limited cloud exposure"
  ],
  "hiringRecommendation": "Recommended for technical interview"
}

Resume:
${resumeText}
`;

      const completion =
        await groq.chat.completions.create({

          model:
            "llama-3.3-70b-versatile",

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.3,
        });

      const response =
        completion.choices[0]
        .message.content;

      const cleanResponse =
        response
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();

      return JSON.parse(
        cleanResponse
      );

    } catch (error) {

      console.log(error);

      return {
        skills: [],
        education: "",
        experience: "",
        professionalSummary: "",
        strengths: [],
        weaknesses: [],
        hiringRecommendation: "AI analysis failed",
      };
    }
  };

const { GoogleGenAI } = require("@google/genai");

const gemini = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateInterviewQuestions = async (resumeText, skills, jobRole) => {
  try {
    const prompt = `
You are an expert technical interviewer. Based on the following candidate details and the job role, generate an interview question guide.
Job Role: ${jobRole}
Candidate Skills: ${skills.join(", ")}
Candidate Resume Snippet:
${resumeText}

Generate 3 technical questions, 2 HR questions, and 1 scenario question.
Return ONLY valid JSON.
Example format:
{
  "technical": ["Question 1", "Question 2", "Question 3"],
  "hr": ["Question 1", "Question 2"],
  "scenario": ["Question 1"]
}
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error: ", error);
    return { technical: [], hr: [], scenario: [] };
  }
};

const compareCandidates = async (candidateA, candidateB, jobRole) => {
  try {
    const prompt = `
You are a senior hiring manager. Compare Candidate A and Candidate B for the role of ${jobRole}.
Candidate A:
${JSON.stringify(candidateA)}

Candidate B:
${JSON.stringify(candidateB)}

Return ONLY valid JSON with a detailed comparison and a final recommendation.
Example format:
{
  "comparison": "Candidate A has more frontend experience, while Candidate B is stronger in backend...",
  "strengthsA": ["React", "UI/UX"],
  "strengthsB": ["Node", "SQL"],
  "weaknessesA": ["Backend"],
  "weaknessesB": ["Frontend"],
  "recommendation": "Candidate A is better suited for this role because..."
}
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error: ", error);
    return { comparison: "Failed to generate", recommendation: "Failed to generate" };
  }
};

const generateResumeSuggestions = async (resumeText, skills) => {
  try {
    const prompt = `
You are an expert resume reviewer and career coach.
Analyze this candidate's resume and skills to suggest improvements.
Candidate Skills: ${skills.join(", ")}
Resume Text:
${resumeText}

Generate:
1. Missing Skills (array) that are highly demanded for their profile.
2. Weak Areas (array) in the resume presentation or experience.
3. Suggested Certifications (array) to boost their CV.
4. Resume Enhancement Tips (array) to improve layout, phrasing, or achievements.

Return ONLY valid JSON.
Example format:
{
  "missingSkills": ["Docker", "Kubernetes"],
  "weakAreas": ["Lack of quantifiable achievements", "Brief project descriptions"],
  "suggestedCertifications": ["AWS Certified Cloud Practitioner", "Scrum Master"],
  "resumeEnhancementTips": ["Use action verbs at the beginning of bullet points", "Include a link to your portfolio"]
}
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error: ", error);
    return { missingSkills: [], weakAreas: [], suggestedCertifications: [], resumeEnhancementTips: [] };
  }
};

const generateCareerRoadmap = async (skills, experience, targetRole) => {
  try {
    const prompt = `
You are an expert career consultant. Design a career growth pathway for a candidate with the following details:
Current Skills: ${skills.join(", ")}
Experience Summary: ${experience}
Target Role: ${targetRole || "Senior Developer / Tech Lead"}

Generate a learning path, recommended technologies, certifications, and career growth path.
Return ONLY valid JSON.
Example format:
{
  "nextSkills": ["System Design", "Microservices", "CI/CD"],
  "recommendedTech": ["Go", "Rust", "Terraform"],
  "certifications": ["AWS Solutions Architect", "Google Cloud Professional Architect"],
  "growthSteps": [
    { "title": "Step 1: Master Backend Architecture", "description": "Learn clean architecture, design patterns, and REST/GraphQL API design principles." },
    { "title": "Step 2: Adopt Devops & Cloud", "description": "Get certified in AWS or GCP, set up end-to-end automation pipelines." },
    { "title": "Step 3: Tech Leadership", "description": "Lead small teams, participate in architectural decisions, and mentor junior developers." }
  ]
}
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error: ", error);
    return { nextSkills: [], recommendedTech: [], certifications: [], growthSteps: [] };
  }
};

const askKnowledgeBase = async (documents, question) => {
  try {
    const context = documents.map(d => `Document Title: ${d.title}\nCategory: ${d.category}\nContent:\n${d.content}`).join("\n\n---\n\n");
    const prompt = `
You are an AI Recruitment Knowledge Assistant.
Answer the recruiter's question using the company documents provided as context below.
If the documents do not contain the answer, say "I cannot find this information in the uploaded company documents, but based on general recruiting standards..." and provide general guidance.

Context Documents:
${context}

Question: ${question}

Answer:
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error: ", error);
    return "Failed to query the knowledge base.";
  }
};

const analyzeATS = async (resumeText) => {
  try {
    const prompt = `
Analyze this resume text and return a detailed ATS score as JSON:
{
  "totalScore": number (0-100),
  "breakdown": {
    "formatting": { "score": number, "max": 20, "feedback": "string" },
    "skills": { "score": number, "max": 20, "feedback": "string" },
    "projects": { "score": number, "max": 20, "feedback": "string" },
    "keywords": { "score": number, "max": 20, "feedback": "string" },
    "experience": { "score": number, "max": 20, "feedback": "string" }
  },
  "missingKeywords": ["string"],
  "missingSections": ["string"],
  "topRecommendations": ["string"]
}

Resume Text:
${resumeText}
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini ATS Error: ", error);
    
    // Heuristic fallback logic
    const skillsMatch = resumeText.match(/Skills:\s*(.*)/i);
    const skillsList = skillsMatch && skillsMatch[1] 
      ? skillsMatch[1].split(",").map(s => s.trim()).filter(Boolean) 
      : [];
    
    const summaryMatch = resumeText.match(/Professional Summary:\s*(.*)/i);
    const summaryText = summaryMatch && summaryMatch[1] ? summaryMatch[1].trim() : "";
    
    const experienceMatch = resumeText.match(/Experience:\s*(.*)/i);
    const experienceText = experienceMatch && experienceMatch[1] ? experienceMatch[1].trim() : "";

    const educationMatch = resumeText.match(/Education:\s*(.*)/i);
    const educationText = educationMatch && educationMatch[1] ? educationMatch[1].trim() : "";

    // Formatting Score (out of 20)
    let formattingScore = 15;
    const missingSections = [];
    if (!summaryText || summaryText.toLowerCase().includes("no summary")) {
      formattingScore -= 3;
      missingSections.push("Professional Summary");
    }
    if (!experienceText || experienceText.toLowerCase().includes("no experience")) {
      formattingScore -= 5;
      missingSections.push("Experience");
    }
    if (!educationText || educationText.toLowerCase().includes("no education")) {
      formattingScore -= 3;
      missingSections.push("Education");
    }
    if (skillsList.length === 0) {
      formattingScore -= 4;
      missingSections.push("Skills Section");
    }
    formattingScore = Math.max(8, formattingScore);

    // Skills Score (out of 20)
    let skillsScore = Math.min(20, 8 + skillsList.length * 1.5);
    if (skillsList.length === 0) skillsScore = 5;

    // Projects Score (out of 20)
    let projectsScore = 14;
    if (experienceText.toLowerCase().includes("project") || resumeText.toLowerCase().includes("project")) {
      projectsScore = 18;
    } else if (!experienceText || experienceText.toLowerCase().includes("no experience")) {
      projectsScore = 8;
    }

    // Keywords Score (out of 20)
    const commonKeywords = ["React", "Node", "Javascript", "HTML", "CSS", "Python", "Java", "SQL", "Git", "API", "AWS", "Docker", "CI/CD"];
    let matchedKeywordsCount = 0;
    commonKeywords.forEach(kw => {
      if (new RegExp("\\b" + kw + "\\b", "i").test(resumeText)) {
        matchedKeywordsCount++;
      }
    });
    let keywordsScore = Math.min(20, 10 + matchedKeywordsCount * 1.5);
    
    const allExpectedKeywords = ["Docker", "AWS", "CI/CD", "TypeScript", "Redux", "REST APIs", "Kubernetes", "GraphQL", "NoSQL"];
    const missingKeywords = allExpectedKeywords.filter(kw => !new RegExp("\\b" + kw + "\\b", "i").test(resumeText));

    // Experience Score (out of 20)
    let experienceScore = 12;
    if (experienceText && !experienceText.toLowerCase().includes("no experience")) {
      if (experienceText.length > 50) experienceScore = 17;
      else experienceScore = 15;
    }

    const totalScore = Math.round(formattingScore + skillsScore + projectsScore + keywordsScore + experienceScore);

    const topRecommendations = [];
    if (missingKeywords.includes("Docker") || missingKeywords.includes("AWS")) {
      topRecommendations.push("Add cloud/DevOps technologies like AWS or Docker to align with modern recruiter pipelines.");
    }
    if (!resumeText.match(/\b(achieved|optimized|led|developed|designed|implemented)\b/i)) {
      topRecommendations.push("Incorporate strong action verbs (e.g. 'optimized latency by 30%', 'developed reusable hooks') to describe achievements.");
    }
    if (skillsList.length < 8) {
      topRecommendations.push("Expand your skills matrix to include specific frameworks, APIs (e.g. REST, GraphQL), and testing tools.");
    }
    if (missingSections.length > 0) {
      topRecommendations.push(`Complete missing resume sections: ${missingSections.join(", ")} to pass ATS validation layout checks.`);
    }
    if (topRecommendations.length === 0) {
      topRecommendations.push("Highlight quantified business impact in your project descriptions (e.g. 'reduced render time by 20%').");
      topRecommendations.push("Include a link to your GitHub profile and active portfolios.");
    }

    return {
      totalScore: Math.min(98, totalScore),
      breakdown: {
        formatting: { score: formattingScore, max: 20, feedback: formattingScore > 14 ? "Clean format and standard headings detected." : "Consider standardizing sections and headers." },
        skills: { score: Math.round(skillsScore), max: 20, feedback: skillsList.length > 6 ? "Good range of core competencies listed." : "Add more specific technical skills to match role requirements." },
        projects: { score: projectsScore, max: 20, feedback: projectsScore > 15 ? "Strong project portfolio and experience details." : "Elaborate more on projects and contributions." },
        keywords: { score: Math.round(keywordsScore), max: 20, feedback: matchedKeywordsCount > 4 ? "Relevant industry keywords detected." : "Inject more domain-specific standard terminology." },
        experience: { score: experienceScore, max: 20, feedback: experienceScore > 14 ? "Clear progression and professional history." : "Elaborate on roles, durations, and clear descriptions." }
      },
      missingKeywords: missingKeywords.slice(0, 4),
      missingSections,
      topRecommendations: topRecommendations.slice(0, 3)
    };
  }
};

const analyzeSkillGap = async (resumeText, requiredSkills) => {
  try {
    const prompt = `
Compare the candidate's resume skills against job requirements.
Job Required Skills: ${JSON.stringify(requiredSkills)}
Candidate Resume:
${resumeText}

Return JSON:
{
  "matchedSkills": ["string"],
  "missingSkills": ["string"],
  "matchPercentage": number,
  "learningRecommendations": [{"skill": "string", "reason": "string", "resources": ["string"]}],
  "suggestedCertifications": [{"name": "string", "platform": "string", "url": "string"}]
}
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Skill Gap Error: ", error);
    const missingSkillsArray = typeof requiredSkills === "string" 
      ? requiredSkills.replace(/Skills Required:\s*/i, "").split(",").map(s => s.trim()) 
      : (Array.isArray(requiredSkills) ? requiredSkills : []);
    return {
      matchedSkills: [],
      missingSkills: missingSkillsArray,
      matchPercentage: 0,
      learningRecommendations: [],
      suggestedCertifications: []
    };
  }
};

const generateMockInterviewQuestions = async (jobRole) => {
  try {
    const prompt = `
You are a senior technical interviewer. Generate 5 interview questions for a ${jobRole} position. Mix behavioral and technical questions.
Return as JSON array: [{"id": "q1", "question": "string", "type": "technical" | "behavioral"}]
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Mock Questions Error: ", error);
    return [
      { id: "q1", question: "Can you describe a challenging technical problem you solved recently?", type: "technical" },
      { id: "q2", question: "How do you handle disagreements with team members on architectural decisions?", type: "behavioral" },
      { id: "q3", question: "Explain the concept of RESTful API and best practices for design.", type: "technical" },
      { id: "q4", question: "Where do you see yourself in the next 3 years?", type: "behavioral" },
      { id: "q5", question: "What is your approach to testing code before deployment?", type: "technical" }
    ];
  }
};

const evaluateMockInterviewAnswers = async (jobRole, qaPairs) => {
  try {
    const prompt = `
Evaluate these interview answers for a ${jobRole} role.
Questions and Answers: ${JSON.stringify(qaPairs)}

Score on: Communication (0-100), Technical Knowledge (0-100), Confidence (0-100). Give Overall Rating and a 3-line Recommendation.
Return JSON: {
  "communicationScore": number,
  "technicalScore": number,
  "confidenceScore": number,
  "overallRating": "Excellent" | "Good" | "Average" | "Poor",
  "recommendation": "string"
}
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Mock Evaluate Error: ", error);
    return {
      communicationScore: 50,
      technicalScore: 50,
      confidenceScore: 50,
      overallRating: "Average",
      recommendation: "Evaluation failed due to service error. Please try another session."
    };
  }
};

const generateCoverLetterAI = async (jobTitle, companyName, jobDescription, resumeText) => {
  try {
    const prompt = `
Write a professional cover letter for a candidate applying to ${jobTitle} at ${companyName}.
Job Description: ${jobDescription}
Candidate Resume Summary: ${resumeText}

Write in formal tone, 3 paragraphs, under 300 words.
Do not use placeholders. Sound human and confident.
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Cover Letter Error: ", error);
    return `Dear Hiring Manager,\n\nI am writing to express my strong interest in the ${jobTitle} position at ${companyName}.\n\nWith my experience and technical background, I am confident in my ability to add significant value to your team. I look forward to the opportunity to discuss how my skills align with your requirements.\n\nThank you for your consideration.\n\nSincerely,\nCandidate`;
  }
};

const rankCandidatesAI = async (jobTitle, requirements, candidates) => {
  try {
    const prompt = `
You are a recruitment AI. Rank these candidates for the job role: ${jobTitle}.
Job Requirements: ${requirements}
Candidates: ${JSON.stringify(candidates)}

Return JSON array sorted by score:
[{
  "candidateId": "string",
  "name": "string",
  "fitScore": number,
  "fitPercentage": "string",
  "strengths": ["string"],
  "concerns": ["string"],
  "recommendation": "string"
}]
`;
    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Candidate Ranking Error: ", error);
    return candidates.map(c => ({
      candidateId: c.candidateId,
      name: c.name,
      fitScore: 50,
      fitPercentage: "50%",
      strengths: ["Valid Experience"],
      concerns: ["Unable to run AI Ranking"],
      recommendation: "Failed to rank candidates via AI."
    }));
  }
};

const generateMcqQuestionsAI = async (company, role, testType) => {
  try {
    const prompt = `
You are an expert recruitment coordinator. Generate exactly 50 multiple choice questions (MCQs) for a test matching these criteria:
Company Context: ${company}
Target Role: ${role}
Assessment Type: ${testType}

Each MCQ must have:
- id (integer 1 to 50)
- question (string)
- options (object containing keys A, B, C, and D as strings)
- correctAnswer (string: "A", "B", "C", or "D")
- section (string: "Aptitude", "Reasoning", "Verbal", "Coding", or "Technical")

Distribute questions across the following sections according to the company and role profiles:
- Amazon SDE: focus heavily on "Coding" and "Technical".
- Accenture: focus on "Aptitude", "Reasoning", and "Technical".
- TCS NQT: focus on "Aptitude", "Reasoning", "Verbal", and "Technical".
- Infosys: focus on "Aptitude" and "Technical".
For others, provide a balanced mix across Aptitude, Reasoning, Verbal, Coding, and Technical.

Return ONLY a valid JSON array of 50 questions. No extra wrapping.
`;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsed = JSON.parse(response.text);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    throw new Error("Invalid output array");
  } catch (error) {
    console.error("Gemini MCQ Generation Error: ", error);
    const fallbackQuestions = [];
    const sections = ["Aptitude", "Reasoning", "Verbal", "Coding", "Technical"];
    for (let i = 1; i <= 50; i++) {
      fallbackQuestions.push({
        id: i,
        question: `Sample ${testType} question ${i} for a role at ${company}. Which of the following is correct?`,
        options: {
          A: "Statement A represents standard procedure",
          B: "Statement B represents optimal solution",
          C: "Statement C represents legacy option",
          D: "Statement D represents automated solution"
        },
        correctAnswer: i % 4 === 0 ? "A" : i % 4 === 1 ? "B" : i % 4 === 2 ? "C" : "D",
        section: sections[i % sections.length]
      });
    }
    return fallbackQuestions;
  }
};

const evaluateMcqTestAI = async (company, role, testType, questions, answers) => {
  try {
    const prompt = `
You are a senior technical interviewer. Evaluate the candidate's MCQ test performance.
Company context: ${company}
Target Role: ${role}
Assessment Type: ${testType}

Questions and candidate responses (keys are question ids, values are option letters "A", "B", "C", "D" or empty):
${JSON.stringify({ questions, answers })}

Provide a detailed evaluation JSON object with the following fields:
- percentileEstimate (string, e.g., "88th percentile")
- difficultyLevel (string, e.g., "Intermediate")
- strengths (array of strings)
- weaknesses (array of strings)
- improvementAreas (array of strings)
- recommendedTopics (array of strings)
- recommendedCertifications (array of strings)
- recommendedLearningResources (array of strings)
- detailedFeedback (string, a paragraph of advice for the candidate)

Return ONLY valid JSON.
`;

    const response = await gemini.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini MCQ Evaluation Error: ", error);
    
    // Dynamic local fallback evaluation
    let correct = 0;
    let total = questions?.length || 25;
    if (questions && Array.isArray(questions)) {
      questions.forEach((q) => {
        const candidateAns = answers[q.id];
        if (candidateAns && candidateAns.toUpperCase() === q.correctAnswer.toUpperCase()) {
          correct++;
        }
      });
    }
    const scorePercentage = Math.round((correct / total) * 100);
    const percentile = Math.max(10, Math.min(99, Math.round(scorePercentage * 0.9 + 5)));

    let strengths = ["Logical reasoning", "Time management"];
    let weaknesses = ["Complex problem parsing", "Specific syntax details"];
    let suggestions = ["Practice speed math and logical puzzles daily."];
    
    if (testType.toLowerCase().includes("tech") || testType.toLowerCase().includes("coding") || testType.toLowerCase().includes("programming")) {
      strengths = ["Code analysis", "Core concepts"];
      weaknesses = ["Algorithmic optimization", "Edge case coverage"];
      suggestions = ["Study standard data structure implementations and time complexities."];
    } else if (testType.toLowerCase().includes("communication") || testType.toLowerCase().includes("verbal")) {
      strengths = ["Grammar and vocabulary", "Business correspondence tone"];
      weaknesses = ["Nuanced text comprehension", "Active listening responses"];
      suggestions = ["Read technical blogs and practice verbal reasoning tests."];
    }

    if (scorePercentage >= 80) {
      strengths.push("Excellent speed and accuracy");
      suggestions.push("Focus on mock interviews to build communication confidence.");
    } else {
      weaknesses.push("Accuracy under tight time limit");
      suggestions.push("Focus on high-yield topics first during revision sessions.");
    }

    return {
      percentileEstimate: `${percentile}%`,
      difficultyLevel: scorePercentage > 85 ? "Hard" : scorePercentage > 60 ? "Medium" : "Easy",
      strengths,
      weaknesses,
      improvementAreas: suggestions,
      recommendedTopics: [
        "Time Complexity",
        "Resource Optimization",
        "Problem Breakdown",
        "Critical Path Analysis"
      ],
      recommendedCertifications: [
        `${company} Certified Professional`,
        "Professional Developer Credential"
      ],
      recommendedLearningResources: [
        "Interactive programming platforms",
        `${company} Prep Guide`,
        "Online CS course modules"
      ],
      detailedFeedback: `You scored ${scorePercentage}% on the ${testType} test for ${company}. ${scorePercentage >= 80 ? "Superb performance! You show a strong grasp of the subject material." : "Solid effort. Regular practice in your weaker areas will help boost accuracy."}`
    };
  }
};

module.exports = {
  extractResumeData,
  generateInterviewQuestions,
  compareCandidates,
  generateResumeSuggestions,
  generateCareerRoadmap,
  askKnowledgeBase,
  analyzeATS,
  analyzeSkillGap,
  generateMockInterviewQuestions,
  evaluateMockInterviewAnswers,
  generateCoverLetterAI,
  rankCandidatesAI,
  generateMcqQuestionsAI,
  evaluateMcqTestAI,
};