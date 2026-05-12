const calculateMatchScore = (
  candidateSkills,
  requiredSkills,
  experience = "",
  education = ""
) => {

  if (
    !candidateSkills ||
    candidateSkills.length === 0
  ) {

    return {
      score: 0,
      feedback:
        "No resume skills found",
    };
  }

  let score = 0;

  const normalizedCandidateSkills =
    candidateSkills.map(
      (skill) =>
        skill.toLowerCase()
    );

  const normalizedRequiredSkills =
    requiredSkills.map(
      (skill) =>
        skill.toLowerCase()
    );

  const matchedSkills =
    normalizedRequiredSkills.filter(
      (skill) =>
        normalizedCandidateSkills.includes(
          skill
        )
    );

  // Skill Score
  const skillScore =
    (
      matchedSkills.length /
      normalizedRequiredSkills.length
    ) * 60;

  score += skillScore;

  // Experience Bonus
  const experienceKeywords = [
    "year",
    "developer",
    "engineer",
    "intern",
    "experience",
  ];

  const hasExperience =
    experienceKeywords.some(
      (keyword) =>
        experience
          ?.toLowerCase()
          .includes(keyword)
    );

  if (hasExperience) {
    score += 20;
  }

  // Education Bonus
  const educationKeywords = [
    "btech",
    "b.e",
    "mca",
    "computer",
    "engineering",
    "bsc",
    "msc",
  ];

  const hasEducation =
    educationKeywords.some(
      (keyword) =>
        education
          ?.toLowerCase()
          .includes(keyword)
    );

  if (hasEducation) {
    score += 20;
  }

  // Final Score Limit
  if (score > 100) {
    score = 100;
  }

  let feedback =
    "Weak candidate profile";

  if (score >= 85) {

    feedback =
      "Excellent technical and educational alignment";

  } else if (score >= 70) {

    feedback =
      "Strong candidate with relevant skills";

  } else if (score >= 50) {

    feedback =
      "Moderate match with partial technical alignment";

  } else if (score >= 30) {

    feedback =
      "Limited match but shows potential";
  }

  return {

    score:
      Number(score.toFixed(2)),

    feedback,

    matchedSkills,
  };
};

module.exports = {
  calculateMatchScore,
};