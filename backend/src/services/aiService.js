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

module.exports = {
  extractResumeData,
  generateInterviewQuestions,
  compareCandidates,
};