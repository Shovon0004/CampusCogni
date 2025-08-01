import express, { Router } from 'express'
import { prisma } from '../lib/prisma'

const router: Router = express.Router()

// Get student profile by user ID
router.get('/:userId', async (req: any, res: any) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.params.userId },
      include: {
        user: true,
        projects: true,
        experiences: true,
        certifications: true,
        applications: {
          include: {
            job: {
              include: {
                recruiter: true,
              },
            },
          },
        },
      },
    })

    if (!student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    res.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update student profile by user ID
router.put('/:userId', async (req: any, res: any) => {
  try {
    const { projects, experiences, certifications, ...updateData } = req.body

    // Find student by userId first
    const student = await prisma.student.findUnique({
      where: { userId: req.params.userId }
    })

    if (!student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    // Update student profile
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: updateData,
    })

    // Update projects if provided
    if (projects) {
      await prisma.project.deleteMany({
        where: { studentId: student.id },
      })
      
      if (projects.length > 0) {
        await prisma.project.createMany({
          data: projects.map((project: any) => ({
            ...project,
            studentId: student.id,
          })),
        })
      }
    }

    // Update experiences if provided
    if (experiences) {
      await prisma.experience.deleteMany({
        where: { studentId: student.id },
      })
      
      if (experiences.length > 0) {
        await prisma.experience.createMany({
          data: experiences.map((exp: any) => ({
            ...exp,
            studentId: student.id,
          })),
        })
      }
    }

    // Update certifications if provided
    if (certifications) {
      await prisma.certification.deleteMany({
        where: { studentId: student.id },
      })
      
      if (certifications.length > 0) {
        await prisma.certification.createMany({
          data: certifications.map((cert: any) => ({
            ...cert,
            studentId: student.id,
          })),
        })
      }
    }

    res.json(updatedStudent)
  } catch (error) {
    console.error('Error updating student:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get student stats by user ID
router.get('/:userId/stats', async (req: any, res: any) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.params.userId },
    })

    if (!student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    // Get applications count
    const applicationsCount = await prisma.application.count({
      where: { studentId: student.id },
    })

    // Get interviews count (applications with INTERVIEW_SCHEDULED or SHORTLISTED status)
    const interviewsCount = await prisma.application.count({
      where: { 
        studentId: student.id,
        status: {
          in: ['INTERVIEW_SCHEDULED', 'SHORTLISTED']
        }
      },
    })

    // For now, we'll use mock data for profile views and CV downloads
    // In a real app, you'd track these metrics separately
    const profileViews = Math.floor(Math.random() * 100) + 10
    const cvDownloads = Math.floor(applicationsCount * 0.6) + Math.floor(Math.random() * 10)

    res.json({
      applications: applicationsCount,
      interviews: interviewsCount,
      profileViews,
      cvDownloads,
    })
  } catch (error) {
    console.error('Error fetching student stats:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get student CV data
router.get('/:userId/cv', async (req: any, res: any) => {
  try {
    const student = await prisma.student.findUnique({
      where: { userId: req.params.userId },
      include: {
        user: true,
        projects: true,
        experiences: true,
        certifications: true,
      },
    })

    if (!student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    // Format CV data
    const cvData = {
      personalInfo: {
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.user.email,
        phone: student.phone,
        location: student.location,
        bio: student.bio,
      },
      education: {
        college: student.college,
        course: student.course,
        year: student.year,
        cgpa: student.cgpa,
      },
      skills: student.skills,
      projects: student.projects.map(project => ({
        title: project.title,
        description: project.description,
        technologies: project.technologies,
        link: project.link,
        startDate: project.startDate,
        endDate: project.endDate,
      })),
      experiences: student.experiences.map(exp => ({
        company: exp.company,
        role: exp.role,
        description: exp.description,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current,
      })),
      certifications: student.certifications.map(cert => ({
        name: cert.name,
        issuer: cert.issuer,
        dateObtained: cert.dateObtained,
        expiryDate: cert.expiryDate,
        credentialId: cert.credentialId,
        credentialUrl: cert.credentialUrl,
      })),
    }

    res.json(cvData)
  } catch (error) {
    console.error('Error fetching CV data:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update CV data
router.put('/:userId/cv', async (req: any, res: any) => {
  try {
    const { personalInfo, education, skills, projects, experiences, certifications } = req.body

    // Find student by userId first
    const student = await prisma.student.findUnique({
      where: { userId: req.params.userId }
    })

    if (!student) {
      return res.status(404).json({ error: 'Student not found' })
    }

    // Update student profile with CV data
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: {
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        phone: personalInfo.phone,
        location: personalInfo.location,
        bio: personalInfo.bio,
        college: education.college,
        course: education.course,
        year: education.year,
        cgpa: education.cgpa,
        skills: skills || [],
      },
    })

    // Update projects
    await prisma.project.deleteMany({
      where: { studentId: student.id },
    })
    
    if (projects && projects.length > 0) {
      await prisma.project.createMany({
        data: projects.map((project: any) => ({
          ...project,
          studentId: student.id,
        })),
      })
    }

    // Update experiences
    await prisma.experience.deleteMany({
      where: { studentId: student.id },
    })
    
    if (experiences && experiences.length > 0) {
      await prisma.experience.createMany({
        data: experiences.map((exp: any) => ({
          ...exp,
          studentId: student.id,
        })),
      })
    }

    // Update certifications
    await prisma.certification.deleteMany({
      where: { studentId: student.id },
    })
    
    if (certifications && certifications.length > 0) {
      await prisma.certification.createMany({
        data: certifications.map((cert: any) => ({
          ...cert,
          studentId: student.id,
        })),
      })
    }

    res.json({ message: 'CV updated successfully' })
  } catch (error) {
    console.error('Error updating CV:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router