import express, { Router } from 'express'
import { prisma } from '../lib/prisma'
import { authenticateToken } from '../middleware/auth'

const router: Router = express.Router()

// Get all certifications for a student
router.get('/student/:studentId', authenticateToken, async (req: any, res: any) => {
  try {
    const { studentId } = req.params

    const certifications = await prisma.certification.findMany({
      where: { studentId },
      orderBy: { dateObtained: 'desc' }
    })

    res.json(certifications)
  } catch (error) {
    console.error('Error fetching certifications:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create a new certification
router.post('/', authenticateToken, async (req: any, res: any) => {
  try {
    const { studentId, name, issuer, issueDate, expiryDate, credentialId, credentialUrl } = req.body

    if (!studentId || !name || !issuer) {
      return res.status(400).json({ error: 'Student ID, name, and issuer are required' })
    }

    const certification = await prisma.certification.create({
      data: {
        studentId,
        name,
        issuer,
        dateObtained: issueDate ? new Date(issueDate) : new Date(), // Required field, default to current date
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl
      }
    })

    res.status(201).json(certification)
  } catch (error) {
    console.error('Error creating certification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update a certification
router.put('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params
    const { name, issuer, issueDate, expiryDate, credentialId, credentialUrl } = req.body

    const certification = await prisma.certification.update({
      where: { id },
      data: {
        name,
        issuer,
        dateObtained: issueDate ? new Date(issueDate) : new Date(), // Required field, default to current date
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        credentialId,
        credentialUrl
      }
    })

    res.json(certification)
  } catch (error) {
    console.error('Error updating certification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete a certification
router.delete('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const { id } = req.params

    await prisma.certification.delete({
      where: { id }
    })

    res.status(204).send()
  } catch (error) {
    console.error('Error deleting certification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
