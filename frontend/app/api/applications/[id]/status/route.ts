import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { status } = body

    // Get recruiter
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: session.user.id },
    })

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 })
    }

    // Check if application exists and belongs to recruiter's job
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        job: {
          select: {
            recruiterId: true,
            title: true,
          },
        },
        student: {
          select: {
            firstName: true,
            lastName: true,
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.job.recruiterId !== recruiter.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: params.id },
      data: { status },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            college: true,
            course: true,
            year: true,
            cgpa: true,
          },
        },
        job: {
          select: {
            title: true,
            type: true,
            location: true,
            stipend: true,
          },
        },
      },
    })

    // TODO: Send notification to student
    // TODO: Send email notification

    return NextResponse.json(updatedApplication)
  } catch (error) {
    console.error('Error updating application status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
