import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { coverLetter } = body

    // Get student ID
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    })

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: params.id },
    })

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if already applied
    const existingApplication = await prisma.application.findUnique({
      where: {
        studentId_jobId: {
          studentId: student.id,
          jobId: params.id,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json(
        { error: 'Already applied to this job' },
        { status: 400 }
      )
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        studentId: student.id,
        jobId: params.id,
        coverLetter,
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            college: true,
            course: true,
            year: true,
            cgpa: true,
            resumeUrl: true,
            skills: true,
          },
        },
        job: {
          select: {
            title: true,
          },
        },
      },
    })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error('Error creating application:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
