import express, { Request, Response, NextFunction, Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth'

const router: Router = express.Router()

// Get all jobs
router.get('/', async (req: any, res: any) => {
  try {
    const { search, type, workMode, page = 1, limit = 10 } = req.query
    
    // Check if user is authenticated (optional)
    let currentUserId: string | null = null
    let currentUserStudent: any = null
    
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
        currentUserId = decoded.userId
        
        // Get student info for application checking
        if (currentUserId) {
          currentUserStudent = await prisma.student.findUnique({
            where: { userId: currentUserId }
          })
        }
      } catch (tokenError) {
        // Ignore token errors for optional authentication
        console.log('Optional auth failed, continuing without user context')
      }
    }
    
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

    // Add application status for authenticated users
    let jobsWithStatus = jobs
    if (currentUserStudent) {
      // Get all applications for this user
      const userApplications = await prisma.application.findMany({
        where: { studentId: currentUserStudent.id },
        select: { jobId: true }
      })
      
      const appliedJobIds = new Set(userApplications.map(app => app.jobId))
      
      jobsWithStatus = jobs.map(job => ({
        ...job,
        applied: appliedJobIds.has(job.id)
      }))
    } else {
      // Add applied: false for non-authenticated users
      jobsWithStatus = jobs.map(job => ({
        ...job,
        applied: false
      }))
    }

    res.json({
      jobs: jobsWithStatus,
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
        "internship": "INTERNSHIP",
        "contract": "CONTRACT"
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
    // Check if user is authenticated (optional)
    let currentUserId: string | null = null
    let currentUserStudent: any = null
    
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      try {
        const jwt = require('jsonwebtoken')
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret')
        currentUserId = decoded.userId
        
        // Get student info for application checking
        if (currentUserId) {
          currentUserStudent = await prisma.student.findUnique({
            where: { userId: currentUserId }
          })
        }
      } catch (tokenError) {
        // Ignore token errors for optional authentication
        console.log('Optional auth failed, continuing without user context')
      }
    }

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

    // Add application status for authenticated users
    let jobWithStatus: any = job
    if (currentUserStudent) {
      const userApplication = await prisma.application.findFirst({
        where: { 
          studentId: currentUserStudent.id,
          jobId: job.id
        }
      })
      
      jobWithStatus = {
        ...job,
        applied: !!userApplication
      }
    } else {
      jobWithStatus = {
        ...job,
        applied: false
      }
    }

    res.json(jobWithStatus)
  } catch (error) {
    console.error('Error fetching job:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Apply to job
router.post('/:id/apply', 
  authenticateToken,
  requireRole(['USER', 'BOTH']),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user } = req as AuthenticatedRequest;
      if (!user || !user.id) {
        res.status(401).json({ error: 'Invalid or missing user authentication' });
        return;
      }

      // Get student profile for the authenticated user
      const student = await prisma.student.findUnique({
        where: { userId: user.id }
      });
      
      if (!student) {
        res.status(404).json({ error: 'Student profile not found. Please complete your profile first.' });
        return;
      }

      // Get job and its recruiter
      const job = await prisma.job.findUnique({
        where: { id: req.params.id },
        include: { recruiter: true }
      });
      
      if (!job) {
        res.status(404).json({ error: 'Job not found' });
        return;
      }

      // Check if job is still active and deadline hasn't passed
      if (job.status !== 'ACTIVE') {
        res.status(400).json({ error: 'This job is no longer accepting applications' });
        return;
      }

      if (new Date() > job.deadline) {
        res.status(400).json({ error: 'Application deadline has passed' });
        return;
      }

      // Prevent user from applying to their own job
      if (job.recruiter.userId === user.id) {
        res.status(400).json({ error: "You cannot apply to a job you posted" });
        return;
      }

      // Check if already applied
      const existingApplication = await prisma.application.findUnique({
        where: {
          studentId_jobId: {
            studentId: student.id,
            jobId: req.params.id,
          },
        },
      });

      if (existingApplication) {
        res.status(400).json({ error: 'You have already applied to this job' });
        return;
      }

      // Check eligibility criteria
      const eligibilityErrors: string[] = [];

      // Check course eligibility
      if (job.eligibleCourses.length > 0 && !job.eligibleCourses.includes(student.course)) {
        eligibilityErrors.push(`Your course (${student.course}) is not eligible for this position`);
      }

      // Check year eligibility  
      if (job.eligibleYears.length > 0 && !job.eligibleYears.includes(student.year)) {
        eligibilityErrors.push(`Your academic year (${student.year}) is not eligible for this position`);
      }

      // Check minimum CGPA requirement
      if (job.minCGPA && student.cgpa < job.minCGPA) {
        eligibilityErrors.push(`Minimum CGPA requirement is ${job.minCGPA}, but your CGPA is ${student.cgpa}`);
      }

      // If there are eligibility errors, return them
      if (eligibilityErrors.length > 0) {
        res.status(400).json({ 
          error: 'You do not meet the eligibility criteria for this job',
          details: eligibilityErrors
        });
        return;
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
              course: true,
              year: true,
              cgpa: true,
            },
          },
          job: {
            select: {
              title: true,
              type: true,
              workMode: true,
            },
          },
        },
      });

      res.status(201).json({
        message: 'Application submitted successfully',
        application
      });
    } catch (error) {
      console.error('Error applying to job:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router