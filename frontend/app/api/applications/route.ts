import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const recruiterId = searchParams.get('recruiterId')

    let applications

    if (session.user.role === 'STUDENT') {
      // Get student's applications
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      })

      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }

      applications = await prisma.application.findMany({
        where: { studentId: student.id },
        include: {
          job: {
            include: {
              recruiter: {
                select: {
                  company: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { appliedAt: 'desc' },
      })
    } else if (session.user.role === 'RECRUITER') {
      // Get recruiter's job applications
      const recruiter = await prisma.recruiter.findUnique({
        where: { userId: session.user.id },
      })

      if (!recruiter) {
        return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 })
      }

      applications = await prisma.application.findMany({
        where: {
          job: {
            recruiterId: recruiter.id,
          },
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
              profilePic: true,
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
        orderBy: { appliedAt: 'desc' },
      })
    }

    return NextResponse.json(applications)
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
