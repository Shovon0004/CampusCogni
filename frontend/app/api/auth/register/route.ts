import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, role, ...profileData } = body

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
    if (role === 'STUDENT') {
      await prisma.student.create({
        data: {
          userId: user.id,
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          college: profileData.college,
          course: profileData.course,
          year: profileData.year,
          cgpa: profileData.cgpa,
          location: profileData.location,
          bio: profileData.bio,
          profilePic: profileData.profilePic,
          resumeUrl: profileData.resumeUrl,
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

    return NextResponse.json(
      { message: 'User created successfully', userId: user.id },
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
