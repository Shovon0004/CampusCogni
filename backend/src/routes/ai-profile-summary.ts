// This is a pure Express router module. Do not export a function or use explicit type annotations for handlers.
import { Router, Request, Response } from 'express';
import axios from 'axios';

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

const router: Router = Router();

const SEARCH_CANDIDATE_API_KEY_GROQ = process.env.SEARCH_CANDIDATE_API_KEY_GROQ;
const GEMINI_API_KEY = process.env.SEARCH_CANDIDATE_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

// DO NOT add any type annotations to req or res below
router.post("/", async (req: Request, res: Response) => {
  try {
    const { candidate, prompt } = req.body;
    if (!candidate) return res.status(400).json({ error: "Candidate is required" });

    const summaryPrompt = `Given the following candidate profile and the job/requirement: \n${prompt}\n\nCandidate:\n${JSON.stringify(candidate, null, 2)}\n\nSummarize in 2-3 concise bullet points (as a JSON array of strings) why this profile is or isn't a good match for the job. Focus on the most important skills, missing skills, and relevant experience. No explanation, no markdown, just output a JSON array of 2-3 points.`;

    let summary = [];
    // Prefer Groq
    if (SEARCH_CANDIDATE_API_KEY_GROQ) {
      try {
        const response = await axios.post(
          GROQ_URL,
          {
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: "You are a helpful assistant." },
              { role: "user", content: summaryPrompt }
            ],
            max_tokens: 256,
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
        try {
          const arr = JSON.parse(text);
          if (Array.isArray(arr)) summary = arr;
        } catch {}
      } catch (err) {
        // fallback to Gemini
      }
    }
    if (summary.length === 0 && GEMINI_API_KEY) {
      try {
        const response = await axios.post(
          GEMINI_URL,
          {
            contents: [
              {
                parts: [
                  { text: summaryPrompt }
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
          if (Array.isArray(arr)) summary = arr;
        } catch {}
      } catch (err) {}
    }
    if (summary.length === 0) summary = ["No summary available."];
    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 