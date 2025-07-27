import express, { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'

const router: Router = express.Router()

// Get all experiences for a student
router.get('/student/:studentId', authenticateToken, async (req: any, res: any) => {
  try {
    const { studentId } = req.params

    const experiences = await prisma.experience.findMany({
      where: { studentId },
      orderBy: { startDate: 'desc' }
    })

    res.json(experiences)
  } catch (error) {
    console.error('Error fetching experiences:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a new experience
router.post('/', authenticateToken, async (req: any, res: any) => {
  try {
    const { studentId, company, position, description, startDate, endDate, isCurrent } = req.body

    if (!studentId || !company || !position) {
      return res.status(400).json({ error: 'Student ID, company, and position are required' })
    }

    const experience = await prisma.experience.create({
      data: {
        studentId,
        company,
        role: position, // Schema uses 'role' instead of 'position'
        description,
        startDate: startDate ? new Date(startDate) : new Date(), // Default to current date if not provided
        endDate: isCurrent ? undefined : (endDate ? new Date(endDate) : undefined), // Omit endDate if isCurrent is true
        current: isCurrent || false // Schema uses 'current' instead of 'isCurrent'
      }
    })

    res.status(201).json(experience)
  } catch (error) {
    console.error('Error creating experience:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update an experience
router.put('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { company, position, description, startDate, endDate, isCurrent } = req.body

    const experience = await prisma.experience.update({
      where: { id },
      data: {
        company,
        role: position, // Schema uses 'role' instead of 'position'
        description,
        startDate: startDate ? new Date(startDate) : new Date(), // Default to current date if not provided
        endDate: isCurrent ? undefined : (endDate ? new Date(endDate) : undefined), // Omit endDate if isCurrent is true
        current: isCurrent || false // Schema uses 'current' instead of 'isCurrent'
      }
    })

    res.json(experience)
  } catch (error) {
    console.error('Error updating experience:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete an experience
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params

    await prisma.experience.delete({
      where: { id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting experience:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
