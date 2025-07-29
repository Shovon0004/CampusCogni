import { Router } from "express";
import prisma from "../lib/prisma";

const router = Router();

// Get all verified skills for a student
router.get("/:studentId", async (req, res) => {
  const { studentId } = req.params;
  try {
    const skills = await prisma.verifiedSkill.findMany({
      where: { studentId },
      select: { skill: true },
    });
    res.json({ verifiedSkills: skills.map((s) => s.skill) });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch verified skills" });
  }
});

// Add a verified skill for a student
router.post("/:studentId", async (req, res) => {
  const { studentId } = req.params;
  const { skill } = req.body;
  if (!skill) return res.status(400).json({ error: "Skill is required" });
  try {
    await prisma.verifiedSkill.upsert({
      where: { studentId_skill: { studentId, skill } },
      update: {},
      create: { studentId, skill },
    });
    const skills = await prisma.verifiedSkill.findMany({
      where: { studentId },
      select: { skill: true },
    });
    res.json({ verifiedSkills: skills.map((s) => s.skill) });
  } catch (e) {
    res.status(500).json({ error: "Failed to add verified skill" });
  }
});

export default router;
