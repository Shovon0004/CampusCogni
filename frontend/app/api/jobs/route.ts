import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type')
    const workMode = searchParams.get('workMode')
    const eligibleFor = searchParams.get('eligibleFor')

    const where: any = {
      status: 'ACTIVE',
      deadline: {
        gte: new Date(),
      },
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type) {
      where.type = type
    }

    if (workMode) {
      where.workMode = workMode
    }

    const jobs = await prisma.job.findMany({
      where,
      include: {
        recruiter: {
          select: {
            company: true,
            firstName: true,
            lastName: true,
          },
        },
        applications: eligibleFor ? {
          where: {
            student: {
              userId: eligibleFor,
            },
          },
        } : false,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const total = await prisma.job.count({ where })

    return NextResponse.json({
      jobs: jobs.map(job => ({
        ...job,
        applied: eligibleFor ? job.applications.length > 0 : false,
        applications: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'RECRUITER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get recruiter ID
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId: session.user.id },
    })

    if (!recruiter) {
      return NextResponse.json({ error: 'Recruiter not found' }, { status: 404 })
    }

    const job = await prisma.job.create({
      data: {
        ...body,
        recruiterId: recruiter.id,
        deadline: new Date(body.deadline),
      },
      include: {
        recruiter: {
          select: {
            company: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
