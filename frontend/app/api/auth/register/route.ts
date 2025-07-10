import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role, ...profileData } = body

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
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
    if (role === 'USER') {
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
      
    } else if (role === 'RECRUITER') {
      await prisma.recruiter.create({
        data: {
          userId: user.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          company: profileData.company,
          jobTitle: profileData.jobTitle,
          website: profileData.website,
          companySize: profileData.companySize,
          industry: profileData.industry,
          description: profileData.description,
        }
      })
    }

    // Generate JWT token for auto-login
    const jwt = require('jsonwebtoken')
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    )

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        userId: user.id,
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
