import express from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth'

const router = express.Router()

// Get all jobs
router.get('/', async (req: any, res: any) => {
  try {
    const { search, type, workMode, page = 1, limit = 10 } = req.query
    
    const where: any = {
      status: 'ACTIVE',
      deadline: {
        gte: new Date(),
      },
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type) {
      where.type = type
    }

    if (workMode) {
      where.workMode = workMode
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        recruiter: {
          select: {
            company: true,
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    })

    const total = await prisma.job.count({ where })

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create job
router.post('/', async (req: any, res: any) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // Get recruiter ID from token (simplified)
    const recruiter = await prisma.recruiter.findFirst({
      where: { user: { email: req.body.userEmail } },
    })

    if (!recruiter) {
      return res.status(404).json({ error: 'Recruiter not found' })
    }

    const job = await prisma.job.create({
      data: {
        ...req.body,
        recruiterId: recruiter.id,
        deadline: new Date(req.body.deadline),
      },
      include: {
        recruiter: {
          select: {
            company: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    res.status(201).json(job)
  } catch (error) {
    console.error('Error creating job:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get job by ID
router.get('/:id', async (req: any, res: any) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: {
        recruiter: {
          select: {
            company: true,
            firstName: true,
            lastName: true,
            website: true,
            industry: true,
            companySize: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    res.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Apply to job
router.post('/:id/apply', async (req: any, res: any) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    // Get student ID (simplified)
    const student = await prisma.student.findFirst({
      where: { user: { email: req.body.userEmail } },
    })

    if (!student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
    })

    if (!job) {
      return res.status(404).json({ error: 'Job not found' })
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId: student.id,
          jobId: req.params.id,
        },
      },
    })

    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied to this job' })
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        jobId: req.params.id,
        coverLetter: req.body.coverLetter || '',
      },
    })

    res.status(201).json(application)
  } catch (error) {
    console.error('Error applying to job:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
