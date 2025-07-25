import axios from "axios";

// Type definitions for API responses
interface GroqChoice {
  message: {
    content: string;
  };
}

interface GroqResponse {
  choices: GroqChoice[];
}

interface GeminiPart {
  text: string;
}

interface GeminiCandidate {
  content: {
    parts: GeminiPart[];
  };
}

interface GeminiResponse {
  candidates: GeminiCandidate[];
}

const GEMINI_API_KEY = process.env.SEARCH_CANDIDATE_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const CANDIDATE_INFO_API_KEY = process.env.CANDIDATE_INFO_API_KEY;
const CANDIDATE_INFO_API_KEY_GROQ = process.env.CANDIDATE_INFO_API_KEY_GROQ;
const GEMINI_SKILL_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GROQ_SKILL_URL = "https://api.groq.com/openai/v1/chat/completions";
const SEARCH_CANDIDATE_API_KEY_GROQ = process.env.SEARCH_CANDIDATE_API_KEY_GROQ;
const GROQ_CANDIDATE_URL = "https://api.groq.com/openai/v1/chat/completions";

// AI-powered skill expansion (GROQ preferred, Gemini fallback)
async function getExpandedSkills(prompt: string): Promise<string[]> {
  const skillPrompt = `Only output a JSON array of the most relevant skills, technologies, and keywords for this job/role. No explanation, no markdown, no extra text, no preamble, no postscript. Example: ["React", "Node.js", "API", "JavaScript", "TypeScript", "HTML", "CSS"]\nDescription: ${prompt}`;

  if (CANDIDATE_INFO_API_KEY_GROQ) {
    // Use Groq Llama3-70b-8192 (correct model name)
    console.log("Using GROQ for skill expansion");
    try {
      const response = await axios.post(
        GROQ_SKILL_URL,
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: skillPrompt }
          ],
          max_tokens: 256,
          temperature: 0.2
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${CANDIDATE_INFO_API_KEY_GROQ}`,
          }
        }
      );
      let text = (response.data as GroqResponse).choices?.[0]?.message?.content || "";
      text = text.trim();
      if (text.startsWith('```json')) text = text.slice(7);
      if (text.startsWith('```')) text = text.slice(3);
      if (text.endsWith('```')) text = text.slice(0, -3);
      text = text.trim();
      try {
        const arr = JSON.parse(text);
        if (Array.isArray(arr)) return arr.map((s: any) => String(s).toLowerCase());
        return [];
      } catch {
        return [];
      }
    } catch (err) {
      console.error("GROQ skill expansion error, falling back to Gemini:", err);
      // fallback to Gemini
    }
  }

  // Fallback: Gemini
  console.log("Using Gemini for skill expansion");
  const response = await axios.post(
    GEMINI_SKILL_URL,
    {
      contents: [
        {
          parts: [
            { text: skillPrompt }
          ]
        }
      ]
    },
    {
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": CANDIDATE_INFO_API_KEY,
      }
    }
  );
  let text =
    (response.data as GeminiResponse).candidates?.[0]?.content?.parts?.[0]?.text ||
    (response.data as GroqResponse).choices?.[0]?.message?.content ||
    "";
  text = text.trim();
  if (text.startsWith('```json')) text = text.slice(7);
  if (text.startsWith('```')) text = text.slice(3);
  if (text.endsWith('```')) text = text.slice(0, -3);
  text = text.trim();
  try {
    const arr = JSON.parse(text);
    if (Array.isArray(arr)) return arr.map((s: any) => String(s).toLowerCase());
    return [];
  } catch {
    return [];
  }
}

export async function getCandidateMatches(
  prompt: string,
  candidates: any[],
  mode: "normal" | "reasoning" = "normal"
) {
  const expandedKeywords = await getExpandedSkills(prompt);
  console.log("AI expanded keywords for search:", expandedKeywords);
  // Filter candidates by skills
  let filteredCandidates = candidates.filter((c: any) => {
    if (!c.skills || !Array.isArray(c.skills)) return false;
    return c.skills.some((skill: string) =>
      expandedKeywords.some(keyword => skill.toLowerCase().includes(keyword))
    );
  });
  console.log("Filtered candidates count:", filteredCandidates.length);

  // Fallback: if no candidates match expanded keywords, suggest candidates by prompt words
  let suggestedCandidates: any[] = [];
  if (filteredCandidates.length === 0) {
    const promptWords = prompt.toLowerCase().split(/\W+/).filter(Boolean);
    suggestedCandidates = candidates.filter((c: any) =>
      c.skills && c.skills.some((skill: string) =>
        promptWords.some(word => skill.toLowerCase().includes(word))
      )
    );
    // Remove duplicates
    suggestedCandidates = Array.from(new Set(suggestedCandidates));
    // For UI, return as a simple array of objects with name, skills, bio
    suggestedCandidates = suggestedCandidates.map((c: any) => ({
      name: `${c.firstName} ${c.lastName}`,
      skills: c.skills,
      bio: c.bio,
    }));
  }

  let matches: any[] = [];
  if (filteredCandidates.length > 0) {
    const requiredSkills = expandedKeywords;
    const strictJsonInstruction = `Respond ONLY with a valid JSON array of objects, no explanation, no markdown, no extra text. Do NOT use markdown or triple backticks, just output raw JSON. Example:
[
  { "name": "John Doe", "match": 98, "skills": ["Java", "Spring", "Maven", "RESTful API", "React"], "bio": "Senior Java Full Stack Developer with 7 years experience.", "reason": "Has all required Java backend and frontend skills, 7+ years experience, recent relevant job titles." },
  { "name": "Jane Smith", "match": 60, "skills": ["Java", "React"], "bio": "Frontend developer with some Java experience.", "reason": "Missing Spring, Maven, RESTful API. Only partial match." },
  { "name": "Alex Lee", "match": 20, "skills": ["React", "Node.js", "MongoDB"], "bio": "MERN stack developer.", "reason": "No Java, Spring, or Maven experience. Not a Java full stack developer." },
  { "name": "Priya Patel", "match": 0, "skills": ["Python", "Django"], "bio": "Python backend developer.", "reason": "No relevant skills for Java full stack role." }
]`;

    const systemPrompt = `
You are an expert technical recruiter AI. Given a job description or requirements, analyze the following candidate profiles and return a JSON array of candidates with a match percentage (100% = perfect fit, 0% = not a fit).

REQUIRED SKILLS for this job: ${requiredSkills.join(', ')}

Scoring rules:
- Only give a high score (90%+) if the candidate has ALL the required core skills/technologies for the job: ${requiredSkills.join(', ')}.
- Penalize missing ANY required skill heavily. If a candidate is missing a required skill (e.g., Spring, Maven, RESTful API), their score should be low (below 50%).
- If a candidate has only frontend or only backend skills, but not both, score them below 50%.
- If a candidate is a MERN stack developer (React, Node.js, MongoDB) but the job is for Java full stack, score them below 30%.
- If a candidate has no relevant experience, score them 0%.
- Consider years of experience, relevant job titles, and recency of experience. Prefer candidates with direct, recent experience in the requested stack/role.
- For each candidate, include a short 'reason' field explaining the score, mentioning which required skills are missing if any.
- Do NOT give high scores for candidates who only have partial overlap (e.g., just React or just Java).
- If a candidate has all required skills but only 1 year of experience, score them 70-80%.
- If a candidate has all required skills and 5+ years of experience, score them 95-100%.
- If a candidate has most but not all required skills, score them 60-80% depending on how many are missing.
- If a candidate has only unrelated skills, score them 0%.

${strictJsonInstruction}
`;

    const candidateData = filteredCandidates.map((c: any) => ({
      name: `${c.firstName} ${c.lastName}`,
      skills: c.skills,
      experiences: c.experiences,
      projects: c.projects,
      education: {
        college: c.college,
        course: c.course,
        year: c.year,
        cgpa: c.cgpa,
      },
      bio: c.bio,
    }));

    const fullPrompt = `${systemPrompt}\nJob/Requirement: ${prompt}\nCandidates: ${JSON.stringify(candidateData)}`;

    if (SEARCH_CANDIDATE_API_KEY_GROQ) {
      // Use Groq for candidate matching
      try {
        const response = await axios.post(
          GROQ_CANDIDATE_URL,
          {
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: fullPrompt }
            ],
            max_tokens: 1024,
            temperature: 0.2
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SEARCH_CANDIDATE_API_KEY_GROQ}`,
            }
          }
        );
        let text = (response.data as GroqResponse).choices?.[0]?.message?.content || "";
        text = text.trim();
        if (text.startsWith('```json')) text = text.slice(7);
        if (text.startsWith('```')) text = text.slice(3);
        if (text.endsWith('```')) text = text.slice(0, -3);
        text = text.trim();
        console.log("Groq candidate match raw text:", text);
        try {
          matches = JSON.parse(text);
        } catch (err) {
          console.error("Groq candidate match JSON parse error:", err);
          matches = [];
        }
      } catch (err) {
        console.error("Groq candidate match error, falling back to Gemini:", err);
        // fallback to Gemini below
      }
    }

    if (!SEARCH_CANDIDATE_API_KEY_GROQ || matches.length === 0) {
      // Fallback: Gemini
      try {
        const response = await axios.post(
          GEMINI_API_URL,
          {
            contents: [
              {
                parts: [
                  { text: fullPrompt }
                ]
              }
            ]
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-goog-api-key": GEMINI_API_KEY,
            }
          }
        );
        const text =
          (response.data as GeminiResponse).candidates?.[0]?.content?.parts?.[0]?.text ||
          (response.data as GroqResponse).choices?.[0]?.message?.content ||
          "";
        let cleanText = text.trim();
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.slice(7);
        }
        if (cleanText.startsWith('```')) {
          cleanText = cleanText.slice(3);
        }
        if (cleanText.endsWith('```')) {
          cleanText = cleanText.slice(0, -3);
        }
        cleanText = cleanText.trim();
        try {
          matches = JSON.parse(cleanText);
        } catch {
          matches = [];
        }
      } catch (err) {
        console.error("Gemini candidate match error:", err);
        matches = [];
      }
    }
  }

  return { matches, suggested: suggestedCandidates };
}

export { getExpandedSkills }; 