import express from 'express'
import { prisma } from '../lib/prisma'

const router = express.Router()

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
        where: { studentId: req.params.id },
      })
      
      if (projects.length > 0) {
        await prisma.project.createMany({
          data: projects.map((project: any) => ({
            ...project,
            studentId: req.params.id,
          })),
        })
      }
    }

    // Update experiences if provided
    if (experiences) {
      await prisma.experience.deleteMany({
        where: { studentId: req.params.id },
      })
      
      if (experiences.length > 0) {
        await prisma.experience.createMany({
          data: experiences.map((exp: any) => ({
            ...exp,
            studentId: req.params.id,
          })),
        })
      }
    }

    // Update certifications if provided
    if (certifications) {
      await prisma.certification.deleteMany({
        where: { studentId: req.params.id },
      })
      
      if (certifications.length > 0) {
        await prisma.certification.createMany({
          data: certifications.map((cert: any) => ({
            ...cert,
            studentId: req.params.id,
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

export default router
