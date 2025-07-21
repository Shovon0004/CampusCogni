import express from "express";
import { prisma } from "../lib/prisma";
import { getCandidateMatches } from "../lib/gemini";

const router = express.Router();

router.post("/", async (req: any, res: any) => {
  try {
    const { prompt, mode = "normal" } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    // Fetch all students with relevant profile info
    const candidates = await prisma.student.findMany({
      include: {
        experiences: true,
        projects: true,
      },
    });

    const matches = await getCandidateMatches(prompt, candidates, mode);

    res.json({ matches });
  } catch (error) {
    console.error("AI candidate search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 