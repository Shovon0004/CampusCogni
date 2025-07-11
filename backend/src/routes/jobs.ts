import express, { Request, Response, NextFunction } from 'express'
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
router.post(
  '/',
  authenticateToken,
  requireRole(['RECRUITER', 'BOTH']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req as AuthenticatedRequest;
      if (!user || !user.id) {
        console.error('No user or user.id in request:', user);
        res.status(401).json({ error: 'Invalid or missing user authentication' });
        return;
      }
      const userId = user.id;

      // Find recruiter by userId
      const recruiter = await prisma.recruiter.findUnique({
        where: { userId },
      });

      if (!recruiter) {
        res.status(404).json({ error: 'Recruiter not found' });
        return;
      }


      const jobData = req.body;

      // Map type and workMode to Prisma enums
      const typeMap: Record<string, string> = {
        "part-time": "PART_TIME",
        "full-time": "FULL_TIME",
        "internship": "INTERNSHIP"
      };
      if (jobData.type && typeMap[jobData.type]) {
        jobData.type = typeMap[jobData.type];
      }

      const workModeMap: Record<string, string> = {
        "on-site": "ON_SITE",
        "remote": "REMOTE",
        "hybrid": "HYBRID"
      };
      if (jobData.workMode && workModeMap[jobData.workMode]) {
        jobData.workMode = workModeMap[jobData.workMode];
      }

      const job = await prisma.job.create({
        data: {
          ...jobData,
          recruiterId: recruiter.id,
          deadline: new Date(jobData.deadline),
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
      });

      res.status(201).json(job);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

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


    // Get student and their userId
    const student = await prisma.student.findFirst({
      where: { user: { email: req.body.userEmail } },
      include: { user: true }
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get job and its recruiter
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      include: { recruiter: true }
    });
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Prevent user from applying to their own job
    if (job.recruiter && student.user && job.recruiter.userId === student.user.id) {
      return res.status(400).json({ error: "You cannot apply to a job you posted." });
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
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
    })

    res.status(201).json(application)
  } catch (error) {
    console.error('Error applying to job:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
