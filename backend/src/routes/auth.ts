import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Register
router.post('/register', async (req: any, res: any) => {
  try {
    const { email, password, role, ...profileData } = req.body

    // Validate required fields
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      }
    })

    // Create profile based on role
    if (role === 'STUDENT') {
      await prisma.student.create({
        data: {
          userId: user.id,
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          college: profileData.college || '',
          course: profileData.course || '',
          year: profileData.year || '',
          cgpa: profileData.cgpa || 0,
          location: profileData.location || null,
          bio: profileData.bio || null,
          profilePic: profileData.profilePic || null,
          resumeUrl: profileData.resumeUrl || null,
          skills: profileData.skills || [],
        }
      })
    } else if (role === 'RECRUITER') {
      await prisma.recruiter.create({
        data: {
          userId: user.id,
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          company: profileData.company || '',
          jobTitle: profileData.jobTitle || '',
          website: profileData.website || null,
          companySize: profileData.companySize || 'STARTUP',
          industry: profileData.industry || '',
          description: profileData.description || null,
        }
      })
    }

    // Generate JWT token for automatic login
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Login
router.post('/login', async (req: any, res: any) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        student: true,
        recruiter: true,
      }
    })

    if (!user || !user.password) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.student || user.recruiter,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Verify token
router.get('/verify', async (req: any, res: any) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Access token required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        student: true,
        recruiter: true,
      }
    })

    if (!user) {
      return res.status(401).json({ error: 'User not found' })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.student || user.recruiter,
      }
    })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(401).json({ error: 'Invalid token' })
  }
})

export default router
