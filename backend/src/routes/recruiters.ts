import express from 'express'
import { prisma } from '../lib/prisma'

const router = express.Router()

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
