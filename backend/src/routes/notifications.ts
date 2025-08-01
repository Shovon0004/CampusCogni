import express, { Router } from 'express'
import { prisma } from '../lib/prisma'

const router: Router = express.Router()

// Get notifications for user
router.get('/', async (req: any, res: any) => {
  try {
    const { userId } = req.query

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    res.json(notifications)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Mark notification as read
router.put('/:id/read', async (req: any, res: any) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    })

    res.json(notification)
  } catch (error) {
    console.error('Error updating notification:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router