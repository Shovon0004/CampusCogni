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
  // --- Parse topN from prompt, but let LLM decide if not found ---
  let topN: number | undefined = undefined;
  let allRequested = false;
  let justOne = false;
  let atLeastN = false;
  let minN = 0;
  // Try to detect intent for number of candidates
  const nMatch = prompt.match(/(?:top|first|only|just|need|want|show|find|give|list|suggest|recommend)?\s*(\d{1,3})\s*(?:candidates?|profiles?|people|developers|engineers)?/i);
  if (nMatch && nMatch[1]) {
    topN = Math.max(1, Math.min(20, parseInt(nMatch[1], 10)));
  }
  if (/all|every|everyone|all candidates|all profiles/i.test(prompt)) {
    allRequested = true;
    topN = 20;
  }
  if (/just one|the best|top candidate|top profile|single best|best match|most suitable one/i.test(prompt)) {
    justOne = true;
    topN = 1;
  }
  const atLeastMatch = prompt.match(/at least (\d{1,3})|minimum (\d{1,3})/i);
  if (atLeastMatch && (atLeastMatch[1] || atLeastMatch[2])) {
    atLeastN = true;
    minN = Math.max(1, Math.min(20, parseInt(atLeastMatch[1] || atLeastMatch[2], 10)));
    topN = minN;
  }
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
  let reasoningSteps: string[] = [];
  if (filteredCandidates.length > 0) {
    const requiredSkills = expandedKeywords;
    // --- New: Conversational, robust, human-like system prompt ---
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
    const strictJsonInstruction = `Respond ONLY with a valid JSON array of objects, no explanation, no markdown, no extra text. Do NOT use markdown or triple backticks, just output raw JSON.

- IMPORTANT: Count rules must be followed exactly:
  - If the user explicitly requests "exactly X candidates", "top X candidates", "return X candidates", etc., return AT MOST that many candidates.
  - NEVER DUPLICATE PROFILES to reach a requested count - if there aren't enough candidates, return fewer rather than duplicating.
  - If fewer candidates exist than requested, just return all available unique candidates with a note in the first candidate's reason field like "Note: Only N candidates matched your criteria".
  - If the user says "all", "every", "all candidates", etc., return ALL candidates sorted by match percentage.
  - If the user says "just one", "the best", "top candidate", etc., return only the single best match.
  - If the user says "at least X", "minimum X", etc., return at least X if available (without duplication), but not more than needed.
  - If the user makes no count specification, return all unique candidates sorted by match percentage.
  - Never apply a minimum percentage cutoff to filter out candidates.
  - Include all candidates with any degree of match (even low percentages).
  - Always sort by match percentage descending.

- Example:
[
  { "name": "John Doe", "match": 98, "skills": ["Java", "Spring", "Maven", "RESTful API", "React"], "bio": "Senior Java Full Stack Developer with 7 years experience.", "reason": "Has all required Java backend and frontend skills, 7+ years experience, recent relevant job titles." },
  { "name": "Jane Smith", "match": 60, "skills": ["Java", "React"], "bio": "Frontend developer with some Java experience.", "reason": "Missing Spring, Maven, RESTful API. Only partial match." }
]`;

    const systemPrompt = `
You are a helpful, expert technical recruiter AI. Given a job description or requirements, analyze the following candidate profiles and return a JSON array of the most suitable candidates, sorted by match percentage (100% = perfect fit, 0% = not a fit).

- Carefully read and deeply understand the job requirements. Infer implied skills, synonyms, and related technologies (e.g., "React" implies "JavaScript", "Redux", etc.).
- Consider not just skills, but also years of experience, recency of experience, relevant job titles, project relevance, education, and overall fit for the role.
- Penalize candidates with outdated experience, irrelevant education, or skills that are not recent.
- Avoid bias toward candidates with long skill lists if those skills are not relevant or recent.
- If a candidate's experience is missing or unclear, infer where possible, but penalize uncertainty.
- If a candidate's profile mentions soft skills, leadership, or communication, consider these as a plus for senior roles.
- For each candidate, provide a concise, human-like 'reason' field explaining both strengths and weaknesses for this job, as if you are a senior recruiter presenting a shortlist to a hiring manager.
- CRITICAL: NEVER duplicate profiles to reach a requested count number. If there aren't enough matching candidates, return fewer with a note in the first candidate's reason field stating "Note: Only [number] candidates matched the criteria".
- Return only unique candidates, even if that means returning fewer than requested.
- If there aren't enough candidates to meet the requested number, make it explicit in your response.
- If there are ties, prefer candidates with more years of experience, more recent experience, or more relevant projects.
- All previous instructions about number of candidates, sorting, and JSON output strictness apply.
- Scoring rules:
  - Only give a high score (90%+) if the candidate has ALL the required core skills/technologies for the job: ${requiredSkills.join(', ')}.
  - Penalize missing ANY required skill heavily. If a candidate is missing a required skill (e.g., Spring, Maven, RESTful API), their score should be low (below 50%).
  - If a candidate has only frontend or only backend skills, but not both, score them below 50%.
  - If a candidate is a MERN stack developer (React, Node.js, MongoDB) but the job is for Java full stack, score them below 30%.
  - If a candidate has no relevant experience, score them 0%.
  - For each candidate, include a short 'reason' field explaining the score, mentioning which required skills are missing if any.
  - Do NOT give high scores for candidates who only have partial overlap (e.g., just React or just Java).
  - If a candidate has all required skills but only 1 year of experience, score them 70-80%.
  - If a candidate has all required skills and 5+ years of experience, score them 95-100%.
  - If a candidate has most but not all required skills, score them 60-80% depending on how many are missing.
  - If a candidate has only unrelated skills, score them 0%.

${strictJsonInstruction}

Job/Requirement: ${prompt}
Candidates: ${JSON.stringify(candidateData)}`;

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
  // Reasoning mode: ask LLM for reasoningSteps and matches
  if (mode === "reasoning" && filteredCandidates.length > 0) {
    const requiredSkills = expandedKeywords;
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
    const reasoningPrompt = `You are a highly intelligent, expert technical recruiter AI. Given a job description or requirements, analyze the following candidate profiles and return a JSON object with two fields:
1. "reasoningSteps": an array of clear, step-by-step strings explaining your reasoning process in detail. For each step, explain:
  - How you parsed and interpreted the prompt (including any implicit requirements or preferences)
  - How you expanded and inferred required skills, technologies, and keywords
  - How you filtered candidates (by skills, experience, education, etc.)
  - How you scored and ranked candidates (including tradeoffs, uncertainties, and any penalizations)
  - Any special considerations, uncertainties, or recruiter insights
  - Why you selected the final matches
2. "matches": a JSON array of the most suitable candidates, sorted by match percentage (100% = perfect fit, 0% = not a fit), with a 'reason' field for each candidate as before.

CRITICAL REQUIREMENTS:
- NEVER duplicate profiles to reach a requested count number. If there aren't enough matching candidates, return fewer with a note in the first candidate's reason field stating "Note: Only [number] candidates matched the criteria".
- If a specific number of candidates is requested (e.g., "top 5") but fewer are available, include an explanation step about the limited available matches.
- You must use the EXACT SAME scoring, filtering, and match percentage logic as you would in normal mode. The only difference is that you explain your reasoning step by step. The match percentages and candidate order MUST be identical to what you would return in normal mode for the same input. Do NOT inflate or deflate scores in reasoning mode.

Be strict: Output ONLY a valid JSON object with these two fields, no markdown, no extra text, no explanation. Use concise, recruiter-style language for each step. Example:
{
  "reasoningSteps": [
    "Parsed prompt and identified required skills: React, Node.js, MongoDB. Noted preference for 5+ years experience.",
    "Expanded skills to include related technologies: Redux, Express.js, JavaScript.",
    "Filtered out candidates missing core skills or with outdated experience.",
    "Scored candidates based on skill match, years of experience, and recency.",
    "Ranked and selected top 5 matches based on overall fit and recruiter judgment."
  ],
  "matches": [
    { "name": "John Doe", "match": 98, "skills": ["Java", "Spring"], "reason": "Has all required skills and 7 years recent experience." }
  ]
}

Job/Requirement: ${prompt}
Candidates: ${JSON.stringify(candidateData)}`;
    let reasoningResponseText = '';
    if (SEARCH_CANDIDATE_API_KEY_GROQ) {
      try {
        const response = await axios.post(
          GROQ_CANDIDATE_URL,
          {
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: reasoningPrompt }
            ],
            max_tokens: 2048,
            temperature: 0.2
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SEARCH_CANDIDATE_API_KEY_GROQ}`,
            }
          }
        );
        reasoningResponseText = (response.data as GroqResponse).choices?.[0]?.message?.content || "";
      } catch (err) {
        console.error("Groq reasoning mode error, falling back to Gemini:", err);
      }
    }
    if (!reasoningResponseText && GEMINI_API_KEY) {
      try {
        const response = await axios.post(
          GEMINI_API_URL,
          {
            contents: [
              {
                parts: [
                  { text: reasoningPrompt }
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
        reasoningResponseText =
          (response.data as GeminiResponse).candidates?.[0]?.content?.parts?.[0]?.text ||
          (response.data as GroqResponse).choices?.[0]?.message?.content ||
          "";
      } catch (err) {
        console.error("Gemini reasoning mode error:", err);
      }
    }
    if (reasoningResponseText) {
      let cleanText = reasoningResponseText.trim();
      if (cleanText.startsWith('```json')) cleanText = cleanText.slice(7);
      if (cleanText.startsWith('```')) cleanText = cleanText.slice(3);
      if (cleanText.endsWith('```')) cleanText = cleanText.slice(0, -3);
      cleanText = cleanText.trim();
      try {
        const parsed = JSON.parse(cleanText);
        if (Array.isArray(parsed.reasoningSteps)) reasoningSteps = parsed.reasoningSteps;
        if (Array.isArray(parsed.matches)) matches = parsed.matches;
      } catch (err) {
        console.error("Reasoning mode JSON parse error:", err);
      }
    }
  }

  return { matches, suggested: suggestedCandidates, reasoningSteps };
}

export { getExpandedSkills }; 