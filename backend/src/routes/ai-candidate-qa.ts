import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getCandidateAnswers } from "../lib/gemini";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router: express.Router = express.Router();

// Middleware to verify authentication
router.use(authenticateToken);

router.post("/", async (req: Request, res: Response) => {
  try {
    const { candidates, question } = req.body;
    
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "At least one candidate is required" });
    }
    
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }
    
    // Get answer from AI about candidates
    const { answer } = await getCandidateAnswers(candidates, question);
    
    res.json({ answer });
  } catch (error) {
    console.error("AI candidate Q&A error:", error);
    res.status(500).json({ error: "Failed to process your question" });
  }
});

export default router;
