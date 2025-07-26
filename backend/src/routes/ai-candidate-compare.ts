import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { compareCandidates } from "../lib/gemini";

const router: express.Router = express.Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { candidates, prompt } = req.body;
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "Valid candidates array is required" });
    }
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Use the Gemini API to compare candidates
    const comparison = await compareCandidates(candidates, prompt);
    res.json(comparison);
  } catch (error) {
    console.error("AI candidate comparison error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
