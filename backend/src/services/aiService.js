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

        hiringRecommendation:
          "AI analysis failed",
      };
    }
  };

module.exports = {
  extractResumeData,
};