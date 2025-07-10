import express from 'express'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Get recruiter profile by user ID
router.get('/:userId', async (req: any, res: any) => {
  try {
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: req.params.userId },
      include: {
        user: true,
      },
    })

    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' })
    }

    res.json(recruiter)
  } catch (error) {
    console.error('Error fetching recruiter:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get recruiter jobs
router.get('/:id/jobs', async (req: any, res: any) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { recruiterId: req.params.id },
      include: {
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(jobs)
  } catch (error) {
    console.error('Error fetching recruiter jobs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
