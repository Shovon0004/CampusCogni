import express, { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'

const router: Router = express.Router()

// Get all projects for a student
router.get('/student/:studentId', authenticateToken, async (req: any, res: any) => {
  try {
    const { studentId } = req.params

    const projects = await prisma.project.findMany({
      where: { studentId },
      orderBy: { startDate: 'desc' }
    })

    res.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a new project
router.post('/', authenticateToken, async (req: any, res: any) => {
  try {
    const { studentId, title, description, technologies, link, startDate, endDate } = req.body

    if (!studentId || !title || !description) {
      return res.status(400).json({ error: 'Student ID, title, and description are required' })
    }

    const project = await prisma.project.create({
      data: {
        studentId,
        title,
        description,
        technologies: technologies || [],
        link,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    res.status(201).json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update a project
router.put('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { title, description, technologies, link, startDate, endDate } = req.body

    const project = await prisma.project.update({
      where: { id },
      data: {
        title,
        description,
        technologies: technologies || [],
        link,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    })

    res.json(project)
  } catch (error) {
    console.error('Error updating project:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a project
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params

    await prisma.project.delete({
      where: { id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting project:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
