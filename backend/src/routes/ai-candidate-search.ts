import express from "express";
import { prisma } from "../lib/prisma";
import { getCandidateMatches, getExpandedSkills } from "../lib/gemini";

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

    const { matches, suggested } = await getCandidateMatches(prompt, candidates, mode);

    res.json({ matches, suggested });
  } catch (error) {
    console.error("AI candidate search error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Debug endpoint for skill expansion
router.post("/expand-skills", async (req: any, res: any) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt is required" });
  try {
    const skills = await getExpandedSkills(prompt);
    res.json({ skills });
  } catch (error) {
    console.error("Skill expansion error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 