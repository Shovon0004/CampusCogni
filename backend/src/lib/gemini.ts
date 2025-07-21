import axios from "axios";

const GEMINI_API_KEY = process.env.SEARCH_CANDIDATE_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function getCandidateMatches(
  prompt: string,
  candidates: any[],
  mode: "normal" | "reasoning" = "normal"
) {
  const strictJsonInstruction = `Respond ONLY with a valid JSON array of objects, no explanation, no markdown, no extra text. Do NOT use markdown or triple backticks, just output raw JSON. Example:\n[
  { "name": "John Doe", "match": 95, "skills": ["React", "Node.js"], "bio": "..." },
  { "name": "Jane Smith", "match": 80, "skills": ["Python", "Django"], "bio": "..." }
]`;

  const systemPrompt = mode === "reasoning"
    ? `You are an expert recruiter AI. Given a job description or requirements, analyze the following candidate profiles deeply and return a JSON array of candidates with a match percentage (100% = perfect fit, 0% = not a fit).\n${strictJsonInstruction}`
    : `Given a job description or requirements, return a JSON array of candidates with a match percentage (100% = perfect fit, 0% = not a fit).\n${strictJsonInstruction}`;

  const candidateData = candidates.map((c: any) => ({
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

  // Gemini expects a single content with all context
  const fullPrompt = `${systemPrompt}\nJob/Requirement: ${prompt}\nCandidates: ${JSON.stringify(candidateData)}`;

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
    response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
    response.data.choices?.[0]?.message?.content ||
    "";
  console.log("Gemini raw text:", text);
  console.log("Gemini raw response:", response.data);
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
  console.log("Gemini cleaned text:", cleanText);
  try {
    return JSON.parse(cleanText);
  } catch {
    return [];
  }
} 