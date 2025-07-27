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

// API key management
// Define all available API keys in arrays for easy rotation
const GEMINI_API_KEYS = [
  process.env.SEARCH_CANDIDATE_API_KEY,
  process.env.SEARCH_CANDIDATE_API_KEY_1,
  process.env.SEARCH_CANDIDATE_API_KEY_2,
  process.env.SEARCH_CANDIDATE_API_KEY_3,
].filter(Boolean); // Filter out undefined or empty keys

const GROQ_API_KEYS = [
  process.env.SEARCH_CANDIDATE_API_KEY_GROQ,
  process.env.SEARCH_CANDIDATE_API_KEY_GROQ_1,
  process.env.SEARCH_CANDIDATE_API_KEY_GROQ_2,
  process.env.SEARCH_CANDIDATE_API_KEY_GROQ_3,
].filter(Boolean);

const CANDIDATE_INFO_API_KEYS = [
  process.env.CANDIDATE_INFO_API_KEY,
  process.env.CANDIDATE_INFO_API_KEY_1,
  process.env.CANDIDATE_INFO_API_KEY_2,
  process.env.CANDIDATE_INFO_API_KEY_3,
].filter(Boolean);

const CANDIDATE_INFO_API_KEYS_GROQ = [
  process.env.CANDIDATE_INFO_API_KEY_GROQ,
  process.env.CANDIDATE_INFO_API_KEY_GROQ_1,
  process.env.CANDIDATE_INFO_API_KEY_GROQ_2,
  process.env.CANDIDATE_INFO_API_KEY_GROQ_3,
].filter(Boolean);

// Keep track of the current index for each key type to rotate through
let geminiKeyIndex = 0;
let groqKeyIndex = 0;
let candidateInfoKeyIndex = 0;
let candidateInfoGroqKeyIndex = 0;

// Functions to get the next available API key
const getNextGeminiKey = () => {
  if (GEMINI_API_KEYS.length === 0) return null;
  const key = GEMINI_API_KEYS[geminiKeyIndex];
  geminiKeyIndex = (geminiKeyIndex + 1) % GEMINI_API_KEYS.length;
  return key;
};

const getNextGroqKey = () => {
  if (GROQ_API_KEYS.length === 0) return null;
  const key = GROQ_API_KEYS[groqKeyIndex];
  groqKeyIndex = (groqKeyIndex + 1) % GROQ_API_KEYS.length;
  return key;
};

const getNextCandidateInfoKey = () => {
  if (CANDIDATE_INFO_API_KEYS.length === 0) return null;
  const key = CANDIDATE_INFO_API_KEYS[candidateInfoKeyIndex];
  candidateInfoKeyIndex = (candidateInfoKeyIndex + 1) % CANDIDATE_INFO_API_KEYS.length;
  return key;
};

const getNextCandidateInfoGroqKey = () => {
  if (CANDIDATE_INFO_API_KEYS_GROQ.length === 0) return null;
  const key = CANDIDATE_INFO_API_KEYS_GROQ[candidateInfoGroqKeyIndex];
  candidateInfoGroqKeyIndex = (candidateInfoGroqKeyIndex + 1) % CANDIDATE_INFO_API_KEYS_GROQ.length;
  return key;
};

// Get current keys (initial values)
const GEMINI_API_KEY = getNextGeminiKey();
const CANDIDATE_INFO_API_KEY = getNextCandidateInfoKey();
const CANDIDATE_INFO_API_KEY_GROQ = getNextCandidateInfoGroqKey();
const SEARCH_CANDIDATE_API_KEY_GROQ = getNextGroqKey();

// API URLs
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GEMINI_SKILL_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const GROQ_SKILL_URL = "https://api.groq.com/openai/v1/chat/completions";
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

// Function to get answers to questions about candidates
export async function getCandidateAnswers(candidates: any[], question: string) {
  // Build a detailed system prompt that explains the candidate data
  const systemPrompt = `You are an AI assistant helping recruiters understand candidate profiles. Answer questions about the candidates provided. Be accurate, helpful, and concise.

The question is: "${question}"

The candidate data includes:
${candidates.map((c, i) => `Candidate ${i+1}: ${JSON.stringify(c, null, 2)}`).join('\n\n')}

Guidelines:
- Answer based ONLY on the information in the candidate profiles.
- If specific information is not available, say so clearly.
- If asked to compare candidates, provide a fair analysis based on their skills, experience, and other relevant factors.
- If asked about contact details or personal information, provide only what's available in the profiles.

RESPONSE FORMAT REQUIREMENTS (IMPORTANT):
1. FORMAT YOUR RESPONSE WITH MARKDOWN:
   * Use **bold** for emphasis and important points
   * Use headings (# for main headings, ## for subheadings) to organize information
   * Use bullet points or numbered lists for listing information

2. WHEN LISTING SKILLS WITH RATINGS:
   * ALWAYS use a consistent format: "Skill: Rating/10" (e.g., "JavaScript: 8/10")
   * Format each skill on a new line with bullet points:
     - JavaScript: 8/10
     - Python: 7/10
   * OR use a markdown table with clear headers:
     | Skill | Rating |
     | ----- | ------ |
     | JavaScript | 8/10 |
     | Python | 7/10 |

3. WHEN COMPARING CANDIDATES:
   * ALWAYS use a markdown table format with clear headers:
     | Skill | Candidate1 | Candidate2 |
     | ----- | ---------- | ---------- |
     | JavaScript | 8/10 | 6/10 |
     | Python | 7/10 | 9/10 |
   * For overall comparisons, use a clear rating system:
     | Candidate | Overall Rating |
     | --------- | -------------- |
     | Candidate1 | 8/10 |
     | Candidate2 | 7/10 |

4. CODE AND TECHNICAL SKILLS:
   * Use \`backticks\` around skill names when discussing technical skills
   * Use code blocks with syntax highlighting for any code examples
   * Mention version numbers or frameworks if specified in candidate profiles

5. WORK EXPERIENCE:
   * Format work history consistently with company, role, and duration
   * Highlight relevant achievements for the job requirements

Remember, your response will be parsed by an automated system that extracts skill ratings and comparisons, so it's crucial to follow these formatting guidelines precisely.
- ALWAYS provide numerical ratings for skills on a 1-10 scale when discussing candidate skills or comparing candidates
- When comparing candidates, ALWAYS include a "Rating: X/10" for each relevant skill or attribute
- ALWAYS present comparisons in a clear, structured way that can be easily visualized
- For skill analyses, use the format "SkillName: X/10" consistently (e.g., "JavaScript: 8/10")
- Keep your answer concise but comprehensive.
- NEVER make up information that isn't in the provided data.
- If asked about technical skills, refer specifically to the candidates' listed skills and experience.
- If providing numerical ratings for skills, use a consistent 1-10 scale based on the available information.
- NEVER leave out key information that could be relevant to the question.`;

  let answer = '';
  
  // Try Groq first with key rotation if needed
  for (let attempt = 0; attempt < GROQ_API_KEYS.length && !answer; attempt++) {
    const currentGroqKey = getNextGroqKey();
    
    if (currentGroqKey) {
      try {
        console.log(`Trying GROQ API key ${attempt + 1}/${GROQ_API_KEYS.length}`);
        const response = await axios.post(
          GROQ_CANDIDATE_URL,
          {
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: systemPrompt }
            ],
            max_tokens: 2048,
            temperature: 0.2
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${currentGroqKey}`,
            }
          }
        );
        answer = (response.data as GroqResponse).choices?.[0]?.message?.content || "";
        if (answer) {
          console.log("Successfully got response from GROQ");
          break;
        }
      } catch (err) {
        console.error(`GROQ API key ${attempt + 1} failed:`, err);
        // Continue to the next key
      }
    }
  }
  
  // Fallback to Gemini with key rotation if needed
  if (!answer) {
    for (let attempt = 0; attempt < GEMINI_API_KEYS.length && !answer; attempt++) {
      const currentGeminiKey = getNextGeminiKey();
      
      if (currentGeminiKey) {
        try {
          console.log(`Trying Gemini API key ${attempt + 1}/${GEMINI_API_KEYS.length}`);
          const response = await axios.post(
            GEMINI_API_URL,
            {
              contents: [
                {
                  parts: [
                    { text: systemPrompt }
                  ]
                }
              ]
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": currentGeminiKey,
              }
            }
          );
          answer = (response.data as GeminiResponse).candidates?.[0]?.content?.parts?.[0]?.text || "";
          if (answer) {
            console.log("Successfully got response from Gemini");
            break;
          }
        } catch (err) {
          console.error(`Gemini API key ${attempt + 1} failed:`, err);
          // Continue to the next key
        }
      }
    }
  }
  
  // If all API attempts failed
  if (!answer) {
    console.error("All API attempts failed for candidate Q&A");
    answer = "I'm sorry, but I encountered an error while analyzing the candidate profiles. Please try again later.";
  }
  
  return { answer };
}

// Compare multiple candidates based on a prompt
export async function compareCandidates(candidates: any[], prompt: string) {
  // Build a comparison-specific system prompt
  const systemPrompt = `You are an AI assistant helping recruiters compare and rank candidates. Analyze the provided candidates based on the comparison criteria and provide detailed insights.

Comparison Request: "${prompt}"

Candidate Data:
${candidates.map((c, i) => `Candidate ${i+1}: 
Name: ${c.firstName} ${c.lastName}
Email: ${c.email}
College: ${c.college}
Course: ${c.course}
Year: ${c.year}
CGPA: ${c.cgpa}
Skills: ${(c.skills || []).join(', ')}
Experience: ${c.experience || 'No experience listed'}
Bio: ${c.bio || 'No bio provided'}
Projects: ${(c.projects || []).map((p: any) => `${p.title}: ${p.description}`).join('; ')}
Work Experience: ${(c.experiences || []).map((e: any) => `${e.role} at ${e.company} (${e.startDate} - ${e.endDate || 'Present'})`).join('; ')}
Certifications: ${(c.certifications || []).map((cert: any) => `${cert.name} from ${cert.issuer}`).join('; ')}
`).join('\n\n')}

COMPARISON REQUIREMENTS:
1. **Provide a detailed comparison** addressing the specific criteria mentioned in the prompt
2. **Rank the candidates** from best to worst fit based on the criteria
3. **Use markdown formatting** with clear headings and tables
4. **Highlight key differentiators** between candidates
5. **Provide reasoning** for your rankings

FORMAT YOUR RESPONSE WITH:
- **Executive Summary** of the comparison
- **Detailed Analysis** for each candidate
- **Comparison Table** showing key metrics
- **Final Rankings** with justification
- **Recommendations** for hiring decisions`;

  let comparison = null;
  
  // Try Gemini API first
  if (CANDIDATE_INFO_API_KEYS.length > 0) {
    for (const apiKey of CANDIDATE_INFO_API_KEYS) {
      try {
        console.log("Attempting candidate comparison with Gemini API...");
        const response = await axios.post(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
          {
            contents: [
              {
                parts: [{ text: systemPrompt }]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 4096,
            }
          },
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000
          }
        );

        const geminiResponse = response.data as GeminiResponse;
        if (geminiResponse?.candidates?.[0]?.content?.parts?.[0]?.text) {
          comparison = geminiResponse.candidates[0].content.parts[0].text;
          console.log("✅ Gemini API candidate comparison successful");
          break;
        }
      } catch (error: any) {
        console.log(`❌ Gemini API attempt failed:`, error.response?.data?.error?.message || error.message);
        continue;
      }
    }
  }

  // Try Groq API as fallback
  if (!comparison && GROQ_API_KEYS.length > 0) {
    for (const apiKey of GROQ_API_KEYS) {
      try {
        console.log("Attempting candidate comparison with Groq API...");
        const response = await axios.post(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            model: "llama-3.1-70b-versatile",
            messages: [
              {
                role: "user",
                content: systemPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 4096
          },
          {
            headers: {
              "Authorization": `Bearer ${apiKey}`,
              "Content-Type": "application/json"
            },
            timeout: 30000
          }
        );

        const groqResponse = response.data as GroqResponse;
        if (groqResponse?.choices?.[0]?.message?.content) {
          comparison = groqResponse.choices[0].message.content;
          console.log("✅ Groq API candidate comparison successful");
          break;
        }
      } catch (error: any) {
        console.log(`❌ Groq API attempt failed:`, error.response?.data?.error?.message || error.message);
        continue;
      }
    }
  }
  
  // If all API attempts failed
  if (!comparison) {
    console.error("All API attempts failed for candidate comparison");
    comparison = "I'm sorry, but I encountered an error while comparing the candidates. Please try again later.";
  }
  
  return { comparison };
}

export { getExpandedSkills }; 