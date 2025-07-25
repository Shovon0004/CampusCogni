import express, { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const router: Router = express.Router()

// Register
router.post('/register', async (req: any, res: any) => {
  try {
    const { email, password, role, ...profileData } = req.body

    console.log('Registration attempt:', { email, role, profileData })

    // Validate required fields
    if (!email || !password || !role) {
      console.log('Missing required fields:', { email: !!email, password: !!password, role: !!role })
      return res.status(400).json({ error: 'Email, password, and role are required' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email)
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Validate role
    if (!['USER', 'RECRUITER', 'BOTH'].includes(role)) {
      console.log('Invalid role:', role)
      return res.status(400).json({ error: 'Invalid role. Must be USER, RECRUITER, or BOTH' })
    }

    // Check if user already exists
    console.log('Checking if user exists...')
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      console.log('User already exists:', email)
      return res.status(400).json({ error: 'User already exists' })
    }

    // Hash password
    console.log('Hashing password...')
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    console.log('Creating user...')
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      }
    })
    console.log('User created successfully:', user.id)

    // Create profile based on role
    if (role === 'USER') {
      console.log('Creating student profile...')
      await prisma.student.create({
        data: {
          userId: user.id,
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          college: profileData.college || 'Not specified',
          course: profileData.course || 'Not specified',
          year: profileData.year || '1',
          cgpa: Number(profileData.cgpa) || 0,
          location: profileData.location || null,
          bio: profileData.bio || null,
          profilePic: profileData.profilePic || null,
          resumeUrl: profileData.resumeUrl || null,
          skills: profileData.skills || [],
        }
      })
      console.log('Student profile created successfully')
    } else if (role === 'RECRUITER') {
      console.log('Creating recruiter profile...')
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
      console.log('Recruiter profile created successfully')
    }

    // Generate JWT token for automatic login
    console.log('Generating JWT token...')
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET environment variable is not set')
      throw new Error('JWT_SECRET not configured')
    }
    
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    console.log('Registration completed successfully for:', email)
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
    console.error('Registration error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      body: req.body
    })
    res.status(500).json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : 'Unknown error' : undefined
    })
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
        userId: user.id,
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
      where: { id: decoded.userId },
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

// Upgrade user to recruiter
router.post('/upgrade-to-recruiter', async (req: any, res: any) => {
  try {
    console.log('=== UPGRADE TO RECRUITER REQUEST ===')
    console.log('Request body:', req.body)
    
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      console.log('No token provided')
      return res.status(401).json({ error: 'Access token required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret') as any
    console.log('Decoded token userId:', decoded.userId)

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true, recruiter: true }
    })

    if (!user) {
      console.log('User not found for ID:', decoded.userId)
      return res.status(401).json({ error: 'User not found' })
    }

    console.log('User found:', user.email, 'Role:', user.role)
    console.log('Has student profile:', !!user.student)
    console.log('Has recruiter profile:', !!user.recruiter)

    if (user.recruiter) {
      console.log('User already has recruiter profile')
      return res.status(400).json({ error: 'User already has a recruiter profile' })
    }

    // Update user role to BOTH if they have a student profile
    const newRole = user.student ? 'BOTH' : 'RECRUITER'
    console.log('Updating user role to:', newRole)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { role: newRole as any }
    })

    // Create recruiter profile
    const recruiterData = req.body
    console.log('Creating recruiter profile with data:', recruiterData)
    
    const createdRecruiter = await prisma.recruiter.create({
      data: {
        userId: user.id,
        firstName: recruiterData.firstName || user.student?.firstName || 'Recruiter',
        lastName: recruiterData.lastName || user.student?.lastName || 'Demo',
        phone: recruiterData.phone || user.student?.phone || '',
        company: recruiterData.company || 'Demo Company',
        jobTitle: recruiterData.jobTitle || 'HR Manager',
        website: recruiterData.website || null,
        companySize: recruiterData.companySize || 'MEDIUM',
        industry: recruiterData.industry || 'Technology',
        description: recruiterData.description || null,
      }
    })

    console.log('Recruiter profile created:', createdRecruiter.id)

    // Fetch updated user with recruiter profile
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { student: true, recruiter: true }
    })

    console.log('Updated user role:', updatedUser?.role)
    console.log('Updated user has recruiter profile:', !!updatedUser?.recruiter)
    console.log('=== END UPGRADE TO RECRUITER ===')

    res.json({
      message: 'User upgraded to recruiter successfully',
      user: updatedUser
    })
  } catch (error) {
    console.error('Upgrade to recruiter error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update user role based on their profiles (if they have both student and recruiter profiles, set role to BOTH)
router.post('/update-role/:userId', async (req: any, res: any) => {
  try {
    const { userId } = req.params

    // Check if user has both student and recruiter profiles
    const [student, recruiter] = await Promise.all([
      prisma.student.findUnique({ where: { userId } }),
      prisma.recruiter.findUnique({ where: { userId } })
    ])

    let newRole = 'USER' // default
    if (student && recruiter) {
      newRole = 'BOTH'
    } else if (recruiter) {
      newRole = 'RECRUITER'
    } else if (student) {
      newRole = 'USER'
    }

    // Update user role
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole as any },
      include: {
        student: true,
        recruiter: true,
      },
    })

    res.json({ 
      user: updatedUser,
      roleUpdated: true,
      oldRole: req.body.oldRole || 'unknown',
      newRole 
    })
  } catch (error) {
    console.error('Error updating user role:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Debug endpoint to check user profiles and role
router.get('/debug/:userId', async (req: any, res: any) => {
  try {
    const { userId } = req.params
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        recruiter: true,
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        hasStudent: !!user.student,
        hasRecruiter: !!user.recruiter,
        studentId: user.student?.id,
        recruiterId: user.recruiter?.id,
      },
      profiles: {
        student: user.student,
        recruiter: user.recruiter,
      }
    })
  } catch (error) {
    console.error('Error in debug endpoint:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
