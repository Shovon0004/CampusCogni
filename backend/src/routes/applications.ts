import express, { Router } from 'express'
import { prisma } from '../lib/prisma'
import { UserRole } from '@prisma/client'

const router: Router = express.Router()

// Get applications
router.get('/', async (req: any, res: any) => {
  try {
    const { userId, recruiterId } = req.query
    
    console.log('DEBUG: Request received with userId:', userId, 'recruiterId:', recruiterId)

    let applications

    if (userId) {
      // Validate userId format (cuid format)
      if (!userId.match(/^c[a-z0-9]{20,}$/)) {
        console.log('DEBUG: Invalid user ID format:', userId)
        return res.status(400).json({ error: 'Invalid user ID format' })
      }
      
      // Get user's applications (users with USER role)
      console.log('DEBUG: Looking for user with ID:', userId)
      
      let user = await prisma.user.findUnique({
        where: { id: userId },
        include: { student: true }
      })

      console.log('DEBUG: Found user:', user ? { id: user.id, email: user.email, role: user.role } : 'null')

      if (!user) {
        console.log('DEBUG: User not found for ID:', userId)
        return res.status(404).json({ error: 'User not found' })
      }

      // Check if user can access student features (USER or BOTH role)
      if ((user.role as any) !== 'USER' && (user.role as any) !== 'BOTH') {
        console.log('DEBUG: User role mismatch - expected USER or BOTH, got:', user.role)
        return res.status(400).json({ error: 'User is not a student' })
      }

      // If user doesn't have a student profile, create a basic one
      if (!user.student) {
        console.log('DEBUG: Creating student profile for user:', user.id)
        const newStudent = await prisma.student.create({
          data: {
            userId: user.id,
            firstName: user.email.split('@')[0] || 'Unknown',
            lastName: 'User',
            college: 'Unknown College',
            course: 'Computer Science',
            year: '3rd Year',
            cgpa: 7.0,
            skills: []
          }
        })
        
        console.log('DEBUG: Created student profile:', newStudent.id)
        
        // Refetch user with student data
        user = await prisma.user.findUnique({
          where: { id: userId },
          include: { student: true }
        })
      }

      console.log('DEBUG: Fetching applications for student:', user!.student!.id)
      applications = await prisma.application.findMany({
        where: { studentId: user!.student!.id },
        include: {
          job: {
            include: {
              recruiter: {
                select: {
                  company: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      })
      
      console.log('DEBUG: Found applications:', applications.length)
    } else if (recruiterId) {
      // Get recruiter's job applications
      applications = await prisma.application.findMany({
        where: {
          job: {
            recruiterId,
          },
        },
        include: {
          student: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
              projects: {
                orderBy: { startDate: 'desc' },
              },
              experiences: {
                orderBy: { startDate: 'desc' },
              },
              certifications: {
                orderBy: { dateObtained: 'desc' },
              },
            },
          },
          job: {
            select: {
              id: true,
              title: true,
              type: true,
              location: true,
              stipend: true,
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      })
    }

    res.json(applications)
  } catch (error) {
    console.error('Error in applications route:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update application status
router.put('/:id/status', async (req: any, res: any) => {
  try {
    const { status } = req.body

    const updatedApplication = await prisma.application.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            college: true,
            course: true,
            year: true,
            cgpa: true,
          },
        },
        job: {
          select: {
            title: true,
            type: true,
            location: true,
            stipend: true,
          },
        },
      },
    })

    res.json(updatedApplication)
  } catch (error) {
    console.error('Error updating application status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router