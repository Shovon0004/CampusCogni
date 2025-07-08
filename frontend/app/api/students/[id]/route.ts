import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const student = await prisma.student.findUnique({
      where: { id: params.id },
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
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { profile, projects, experiences, certifications, ...updateData } = body

    // Update student profile
    const updatedStudent = await prisma.student.update({
      where: { id: params.id },
      data: updateData,
      include: {
        projects: true,
        experiences: true,
        certifications: true,
      },
    })

    // Update projects if provided
    if (projects) {
      // Delete existing projects and create new ones
      await prisma.project.deleteMany({
        where: { studentId: params.id },
      })
      
      if (projects.length > 0) {
        await prisma.project.createMany({
          data: projects.map((project: any) => ({
            ...project,
            studentId: params.id,
          })),
        })
      }
    }

    // Update experiences if provided
    if (experiences) {
      await prisma.experience.deleteMany({
        where: { studentId: params.id },
      })
      
      if (experiences.length > 0) {
        await prisma.experience.createMany({
          data: experiences.map((exp: any) => ({
            ...exp,
            studentId: params.id,
          })),
        })
      }
    }

    // Update certifications if provided
    if (certifications) {
      await prisma.certification.deleteMany({
        where: { studentId: params.id },
      })
      
      if (certifications.length > 0) {
        await prisma.certification.createMany({
          data: certifications.map((cert: any) => ({
            ...cert,
            studentId: params.id,
          })),
        })
      }
    }

    return NextResponse.json(updatedStudent)
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
