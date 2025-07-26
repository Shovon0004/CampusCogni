import express, { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { getCandidateAnswers } from "../lib/gemini";
import { authenticateToken, AuthenticatedRequest } from "../middleware/auth";

const router: express.Router = express.Router();

// Middleware to verify authentication
router.use(authenticateToken);

router.post("/", async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check if the user is authenticated properly
    if (!req.user || !req.user.id) {
      return res.status(403).json({ error: "Authentication required" });
    }
    
    const { candidates, question } = req.body;
    
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: "At least one candidate is required" });
    }
    
    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required" });
    }
    
    // Log request for debugging
    console.log(`Candidate Q&A request from user ${req.user.id}`, {
      numCandidates: candidates.length,
      questionLength: question.length
    });
    
    // Get answer from AI about candidates
    const { answer } = await getCandidateAnswers(candidates, question);
    
    res.json({ answer });
  } catch (error: any) {
    console.error("AI candidate Q&A error:", error);
    
    // Provide more specific error messages
    if (error.response && error.response.status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded. Please try again later." });
    }
    
    res.status(500).json({ error: "Failed to process your question. Please try again." });
  }
});

export default router;
