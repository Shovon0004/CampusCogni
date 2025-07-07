# CampusCogni Backend Development Guide with MongoDB Atlas

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [MongoDB Atlas Setup](#mongodb-atlas-setup)
4. [Database Schema Design](#database-schema-design)
5. [API Endpoints Structure](#api-endpoints-structure)
6. [Authentication & Authorization](#authentication--authorization)
7. [File Upload & Storage](#file-upload--storage)
8. [Real-time Features](#real-time-features)
9. [Email Services](#email-services)
10. [Deployment & Environment](#deployment--environment)
11. [Frontend-Backend Integration](#frontend-backend-integration)
12. [Frontend Code Changes for Backend Integration](#frontend-code-changes-for-backend-integration)
13. [Page-to-Backend Mapping](#page-to-backend-mapping)

## Project Overview

CampusCogni is a campus recruitment platform connecting students with recruiters. The backend needs to handle:
- User authentication (Students & Recruiters)
- Job posting and application management
- CV/Resume handling
- Real-time notifications
- Email communications
- File uploads
- Search and filtering

## Technology Stack

### Backend Framework
- **Next.js 14** with App Router (API Routes)
- **TypeScript** for type safety
- **Prisma** as ORM for MongoDB
- **NextAuth.js** for authentication

### Database
- **MongoDB Atlas** (Cloud MongoDB)
- **Prisma** for database operations
- **MongoDB Compass** for database visualization

### Additional Services
- **Vercel Blob** for file storage (resumes, profile pictures)
- **Resend** for email services
- **Pusher** or **Socket.io** for real-time features

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account
\`\`\`bash
# Visit https://www.mongodb.com/atlas
# Create free account
# Create new cluster (M0 Sandbox - Free tier)
\`\`\`

### 2. Database Configuration
\`\`\`javascript
// Cluster Configuration
Cluster Name: campuscogni-cluster
Region: Choose closest to your users
Tier: M0 Sandbox (Free)

// Database Access
Username: campuscogni-admin
Password: [Generate secure password]
Privileges: Atlas admin

// Network Access
IP Address: 0.0.0.0/0 (Allow access from anywhere)
// In production, restrict to specific IPs
\`\`\`

### 3. Connection String
\`\`\`bash
# Example connection string
mongodb+srv://campuscogni-admin:<password>@campuscogni-cluster.xxxxx.mongodb.net/campuscogni?retryWrites=true&w=majority
\`\`\`

## Database Schema Design

### 1. Install Prisma
\`\`\`bash
npm install prisma @prisma/client
npx prisma init
\`\`\`

### 2. Prisma Schema (prisma/schema.prisma)
\`\`\`prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}

// User Models
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  email     String   @unique
  password  String?
  role      UserRole
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relations
  student   Student?
  recruiter Recruiter?
  
  @@map("users")
}

enum UserRole {
  STUDENT
  RECRUITER
}

model Student {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @unique @db.ObjectId
  firstName   String
  lastName    String
  phone       String?
  college     String
  course      String
  year        String
  cgpa        Float
  location    String?
  bio         String?
  profilePic  String?
  resumeUrl   String?
  skills      String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  applications Application[]
  projects     Project[]
  experiences  Experience[]
  certifications Certification[]
  
  @@map("students")
}

model Recruiter {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @unique @db.ObjectId
  firstName   String
  lastName    String
  phone       String?
  company     String
  jobTitle    String
  website     String?
  companySize CompanySize
  industry    String
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  jobs Job[]
  
  @@map("recruiters")
}

enum CompanySize {
  STARTUP
  SMALL
  MEDIUM
  LARGE
}

model Job {
  id              String   @id @default(auto()) @map("_id") @db.ObjectId
  recruiterId     String   @db.ObjectId
  title           String
  type            JobType
  workMode        WorkMode
  location        String
  stipend         String
  description     String
  requirements    String
  benefits        String?
  eligibleCourses String[]
  eligibleYears   String[]
  minCGPA         Float?
  deadline        DateTime
  status          JobStatus @default(ACTIVE)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  // Relations
  recruiter    Recruiter     @relation(fields: [recruiterId], references: [id], onDelete: Cascade)
  applications Application[]
  
  @@map("jobs")
}

enum JobType {
  FULL_TIME
  INTERNSHIP
  PART_TIME
  CONTRACT
}

enum WorkMode {
  ON_SITE
  REMOTE
  HYBRID
}

enum JobStatus {
  ACTIVE
  CLOSED
  DRAFT
}

model Application {
  id          String            @id @default(auto()) @map("_id") @db.ObjectId
  studentId   String            @db.ObjectId
  jobId       String            @db.ObjectId
  status      ApplicationStatus @default(APPLIED)
  coverLetter String?
  appliedAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  
  // Relations
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  job     Job     @relation(fields: [jobId], references: [id], onDelete: Cascade)
  
  @@unique([studentId, jobId])
  @@map("applications")
}

enum ApplicationStatus {
  APPLIED
  UNDER_REVIEW
  SHORTLISTED
  INTERVIEW_SCHEDULED
  REJECTED
  HIRED
}

model Project {
  id           String   @id @default(auto()) @map("_id") @db.ObjectId
  studentId    String   @db.ObjectId
  title        String
  description  String
  technologies String[]
  link         String?
  startDate    DateTime?
  endDate      DateTime?
  createdAt    DateTime @default(now())
  
  // Relations
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  @@map("projects")
}

model Experience {
  id          String    @id @default(auto()) @map("_id") @db.ObjectId
  studentId   String    @db.ObjectId
  company     String
  role        String
  description String?
  startDate   DateTime
  endDate     DateTime?
  current     Boolean   @default(false)
  createdAt   DateTime  @default(now())
  
  // Relations
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  @@map("experiences")
}

model Certification {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  studentId   String   @db.ObjectId
  name        String
  issuer      String
  dateObtained DateTime
  expiryDate  DateTime?
  credentialId String?
  credentialUrl String?
  createdAt   DateTime @default(now())
  
  // Relations
  student Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  
  @@map("certifications")
}

model College {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String   @unique
  location  String
  website   String?
  courses   String[]
  createdAt DateTime @default(now())
  
  @@map("colleges")
}

model Notification {
  id        String           @id @default(auto()) @map("_id") @db.ObjectId
  userId    String           @db.ObjectId
  type      NotificationType
  title     String
  message   String
  read      Boolean          @default(false)
  data      Json?
  createdAt DateTime         @default(now())
  
  @@map("notifications")
}

enum NotificationType {
  APPLICATION_STATUS
  NEW_JOB
  INTERVIEW_SCHEDULED
  MESSAGE
  SYSTEM
}
\`\`\`

### 3. Environment Variables (.env)
\`\`\`bash
# Database
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/campuscogni"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Storage (Vercel Blob)
BLOB_READ_WRITE_TOKEN="your-blob-token"

# Email (Resend)
RESEND_API_KEY="your-resend-api-key"

# Real-time (Pusher)
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_KEY="your-pusher-key"
PUSHER_SECRET="your-pusher-secret"
PUSHER_CLUSTER="your-pusher-cluster"
\`\`\`

## API Endpoints Structure

### 1. Authentication Endpoints
\`\`\`typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

// app/api/auth/register/route.ts
POST /api/auth/register
// Register new user (student/recruiter)

// app/api/auth/verify-email/route.ts
POST /api/auth/verify-email
// Email verification
\`\`\`

### 2. Student Endpoints
\`\`\`typescript
// app/api/students/route.ts
GET    /api/students          // Get all students (for recruiters)
POST   /api/students          // Create student profile

// app/api/students/[id]/route.ts
GET    /api/students/[id]     // Get student profile
PUT    /api/students/[id]     // Update student profile
DELETE /api/students/[id]     // Delete student profile

// app/api/students/[id]/cv/route.ts
GET    /api/students/[id]/cv  // Download CV
POST   /api/students/[id]/cv  // Upload CV

// app/api/students/[id]/applications/route.ts
GET    /api/students/[id]/applications  // Get student applications

// app/api/students/[id]/projects/route.ts
GET    /api/students/[id]/projects      // Get student projects
POST   /api/students/[id]/projects      // Add project
PUT    /api/students/[id]/projects/[projectId]  // Update project
DELETE /api/students/[id]/projects/[projectId]  // Delete project
\`\`\`

### 3. Recruiter Endpoints
\`\`\`typescript
// app/api/recruiters/route.ts
GET    /api/recruiters        // Get all recruiters
POST   /api/recruiters        // Create recruiter profile

// app/api/recruiters/[id]/route.ts
GET    /api/recruiters/[id]   // Get recruiter profile
PUT    /api/recruiters/[id]   // Update recruiter profile
DELETE /api/recruiters/[id]   // Delete recruiter profile

// app/api/recruiters/[id]/jobs/route.ts
GET    /api/recruiters/[id]/jobs  // Get recruiter's jobs
POST   /api/recruiters/[id]/jobs  // Create new job
\`\`\`

### 4. Job Endpoints
\`\`\`typescript
// app/api/jobs/route.ts
GET    /api/jobs              // Get all jobs (with filters)
POST   /api/jobs              // Create new job

// app/api/jobs/[id]/route.ts
GET    /api/jobs/[id]         // Get job details
PUT    /api/jobs/[id]         // Update job
DELETE /api/jobs/[id]         // Delete job

// app/api/jobs/[id]/applications/route.ts
GET    /api/jobs/[id]/applications  // Get job applications
POST   /api/jobs/[id]/applications  // Apply to job

// app/api/jobs/search/route.ts
GET    /api/jobs/search       // Search jobs with filters
\`\`\`

### 5. Application Endpoints
\`\`\`typescript
// app/api/applications/route.ts
GET    /api/applications      // Get applications (filtered by user)
POST   /api/applications      // Create application

// app/api/applications/[id]/route.ts
GET    /api/applications/[id] // Get application details
PUT    /api/applications/[id] // Update application status
DELETE /api/applications/[id] // Withdraw application

// app/api/applications/[id]/status/route.ts
PUT    /api/applications/[id]/status  // Update application status
\`\`\`

### 6. File Upload Endpoints
\`\`\`typescript
// app/api/upload/resume/route.ts
POST   /api/upload/resume     // Upload resume

// app/api/upload/profile-pic/route.ts
POST   /api/upload/profile-pic // Upload profile picture

// app/api/upload/company-logo/route.ts
POST   /api/upload/company-logo // Upload company logo
\`\`\`

### 7. Notification Endpoints
\`\`\`typescript
// app/api/notifications/route.ts
GET    /api/notifications     // Get user notifications
POST   /api/notifications     // Create notification

// app/api/notifications/[id]/route.ts
PUT    /api/notifications/[id] // Mark as read
DELETE /api/notifications/[id] // Delete notification

// app/api/notifications/mark-all-read/route.ts
PUT    /api/notifications/mark-all-read // Mark all as read
\`\`\`

## Authentication & Authorization

### 1. NextAuth Configuration
\`\`\`typescript
// lib/auth.ts
import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Implement credential validation
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user role to session
      return session
    },
    async jwt({ token, user }) {
      // Add user data to token
      return token
    }
  }
}
\`\`\`

### 2. Middleware for Route Protection
\`\`\`typescript
// middleware.ts
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Route protection logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Authorization logic
        return true
      }
    }
  }
)

export const config = {
  matcher: [
    '/api/students/:path*',
    '/api/recruiters/:path*',
    '/api/jobs/:path*',
    '/api/applications/:path*'
  ]
}
\`\`\`

## File Upload & Storage

### 1. Vercel Blob Setup
\`\`\`typescript
// lib/blob.ts
import { put, del } from '@vercel/blob'

export async function uploadFile(file: File, folder: string) {
  const blob = await put(`${folder}/${file.name}`, file, {
    access: 'public',
  })
  return blob.url
}

export async function deleteFile(url: string) {
  await del(url)
}
\`\`\`

### 2. Resume Upload API
\`\`\`typescript
// app/api/upload/resume/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/lib/blob'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    const url = await uploadFile(file, 'resumes')
    
    return NextResponse.json({ url })
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
\`\`\`

## Real-time Features

### 1. Pusher Setup
\`\`\`typescript
// lib/pusher.ts
import Pusher from 'pusher'
import PusherClient from 'pusher-js'

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true
})

export const pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!
})
\`\`\`

### 2. Real-time Notifications
\`\`\`typescript
// app/api/notifications/send/route.ts
import { pusherServer } from '@/lib/pusher'

export async function POST(request: NextRequest) {
  const { userId, notification } = await request.json()
  
  await pusherServer.trigger(`user-${userId}`, 'notification', notification)
  
  return NextResponse.json({ success: true })
}
\`\`\`

## Email Services

### 1. Resend Setup
\`\`\`typescript
// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string
  subject: string
  html: string
}) {
  await resend.emails.send({
    from: 'CampusCogni <noreply@campuscogni.com>',
    to,
    subject,
    html
  })
}
\`\`\`

### 2. Email Templates
\`\`\`typescript
// lib/email-templates.ts
export const applicationStatusTemplate = (studentName: string, jobTitle: string, status: string) => `
  <h1>Application Status Update</h1>
  <p>Dear ${studentName},</p>
  <p>Your application for ${jobTitle} has been ${status}.</p>
`

export const newJobTemplate = (jobTitle: string, company: string) => `
  <h1>New Job Opportunity</h1>
  <p>A new job "${jobTitle}" at ${company} matches your profile.</p>
`
\`\`\`

## Frontend-Backend Integration

### 1. API Client Setup
\`\`\`typescript
// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export class ApiClient {
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }
    
    return response.json()
  }
  
  // Student methods
  async getStudentProfile(id: string) {
    return this.request(`/students/${id}`)
  }
  
  async updateStudentProfile(id: string, data: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
  
  // Job methods
  async getJobs(filters?: any) {
    const params = new URLSearchParams(filters)
    return this.request(`/jobs?${params}`)
  }
  
  async applyToJob(jobId: string, applicationData: any) {
    return this.request(`/jobs/${jobId}/applications`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    })
  }
  
  // Application methods
  async getApplications(userId: string) {
    return this.request(`/applications?userId=${userId}`)
  }
  
  async updateApplicationStatus(applicationId: string, status: string) {
    return this.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }
}

export const apiClient = new ApiClient()
\`\`\`

### 2. React Hooks for API Integration
\`\`\`typescript
// hooks/useApi.ts
import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'

export function useJobs(filters?: any) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true)
        const data = await apiClient.getJobs(filters)
        setJobs(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchJobs()
  }, [filters])
  
  return { jobs, loading, error }
}

export function useApplications(userId: string) {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchApplications() {
      try {
        const data = await apiClient.getApplications(userId)
        setApplications(data)
      } catch (err) {
        console.error('Failed to fetch applications:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchApplications()
  }, [userId])
  
  return { applications, loading, refetch: fetchApplications }
}
\`\`\`

## Frontend Code Changes for Backend Integration

### 1. Remove Mock Data and Add API Integration

#### A. Student Dashboard (`app/student/dashboard/page.tsx`)

**Remove mock data:**
\`\`\`typescript
// REMOVE this entire mockJobs array
const mockJobs: Job[] = [
  // ... all mock job data
]
\`\`\`

**Replace with API integration:**
\`\`\`typescript
// ADD these imports at the top
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

// REPLACE the useState with:
const [jobs, setJobs] = useState<Job[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

// ADD useEffect for data fetching:
useEffect(() => {
  async function fetchJobs() {
    try {
      setLoading(true)
      const data = await apiClient.getJobs({ 
        eligibleFor: session?.user?.id 
      })
      setJobs(data)
    } catch (err) {
      setError('Failed to fetch jobs')
    } finally {
      setLoading(false)
    }
  }
  
  if (session?.user?.id) {
    fetchJobs()
  }
}, [session])

// UPDATE handleApply function:
const handleApply = async (jobId: string) => {
  try {
    await apiClient.applyToJob(jobId, {
      studentId: session?.user?.id,
      coverLetter: '' // Add cover letter input if needed
    })
    // Update local state
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, applied: true } : job
    ))
    toast({
      title: "Application Submitted",
      description: "Your application has been sent successfully."
    })
  } catch (error) {
    toast({
      title: "Application Failed",
      description: "Failed to submit application. Please try again."
    })
  }
}
\`\`\`

#### B. Student Applications (`app/student/applications/page.tsx`)

**Remove mock data:**
\`\`\`typescript
// REMOVE this entire mockApplications array
const mockApplications: Application[] = [
  // ... all mock application data
]
\`\`\`

**Replace with API integration:**
\`\`\`typescript
// ADD these imports
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

// REPLACE useState and add data fetching:
const [applications, setApplications] = useState<Application[]>([])
const [loading, setLoading] = useState(true)
const { data: session } = useSession()

useEffect(() => {
  async function fetchApplications() {
    if (!session?.user?.id) return
    
    try {
      setLoading(true)
      const data = await apiClient.getApplications(session.user.id)
      setApplications(data)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }
  
  fetchApplications()
}, [session])
\`\`\`

#### C. Student Profile (`app/student/profile/page.tsx`)

**Remove mock data:**
\`\`\`typescript
// REMOVE all mock profile data, skills, projects, experience arrays
const [profile, setProfile] = useState({
  // Remove all hardcoded data
})

const skills = [
  // Remove mock skills
]

const projects = [
  // Remove mock projects
]

const experience = [
  // Remove mock experience
]
\`\`\`

**Replace with API integration:**
\`\`\`typescript
// ADD data fetching
const [profile, setProfile] = useState(null)
const [skills, setSkills] = useState([])
const [projects, setProjects] = useState([])
const [experience, setExperience] = useState([])
const [loading, setLoading] = useState(true)
const { data: session } = useSession()

useEffect(() => {
  async function fetchProfile() {
    if (!session?.user?.id) return
    
    try {
      const data = await apiClient.getStudentProfile(session.user.id)
      setProfile(data.profile)
      setSkills(data.skills)
      setProjects(data.projects)
      setExperience(data.experience)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }
  
  fetchProfile()
}, [session])

// UPDATE handleSave function:
const handleSave = async () => {
  setIsLoading(true)
  try {
    await apiClient.updateStudentProfile(session.user.id, {
      profile,
      skills,
      projects,
      experience
    })
    setIsEditing(false)
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    })
  } catch (error) {
    toast({
      title: "Update Failed",
      description: "Failed to update profile. Please try again.",
    })
  } finally {
    setIsLoading(false)
  }
}
\`\`\`

#### D. Recruiter Dashboard (`app/recruiter/dashboard/page.tsx`)

**Remove mock data:**
\`\`\`typescript
// REMOVE mockJobs array and collegeDatabase
const mockJobs: JobPosting[] = [
  // Remove all mock data
]

const collegeDatabase: Record<string, CollegeData> = {
  // Remove all mock college data
}
\`\`\`

**Replace with API integration:**
\`\`\`typescript
// ADD data fetching
const [jobs, setJobs] = useState<JobPosting[]>([])
const [collegeData, setCollegeData] = useState<Record<string, CollegeData>>({})
const [loading, setLoading] = useState(true)
const { data: session } = useSession()

useEffect(() => {
  async function fetchDashboardData() {
    if (!session?.user?.id) return
    
    try {
      const [jobsData, collegesData] = await Promise.all([
        apiClient.getRecruiterJobs(session.user.id),
        apiClient.getCollegeData()
      ])
      setJobs(jobsData)
      setCollegeData(collegesData)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }
  
  fetchDashboardData()
}, [session])
\`\`\`

#### E. Recruiter Applications (`app/recruiter/applications/page.tsx`)

**Remove mock data:**
\`\`\`typescript
// REMOVE mockApplicants array
const mockApplicants: Applicant[] = [
  // Remove all mock data
]
\`\`\`

**Replace with API integration:**
\`\`\`typescript
// ADD data fetching
const [applicants, setApplicants] = useState<Applicant[]>([])
const [loading, setLoading] = useState(true)
const { data: session } = useSession()

useEffect(() => {
  async function fetchApplicants() {
    if (!session?.user?.id) return
    
    try {
      const data = await apiClient.getRecruiterApplications(session.user.id)
      setApplicants(data)
    } catch (error) {
      console.error('Failed to fetch applicants:', error)
    } finally {
      setLoading(false)
    }
  }
  
  fetchApplicants()
}, [session])
\`\`\`

### 2. Add Authentication Wrapper

#### Create Session Provider (`app/providers.tsx`)
\`\`\`typescript
// CREATE new file: app/providers.tsx
'use client'

import { SessionProvider } from 'next-auth/react'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
        {children}
        <Toaster />
      </ThemeProvider>
    </SessionProvider>
  )
}
\`\`\`

#### Update Root Layout (`app/layout.tsx`)
\`\`\`typescript
// REPLACE the existing layout content with:
import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CampusCogni - Campus Recruitment Platform",
  description: "Streamline campus recruitment with modern tools",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
\`\`\`

### 3. Update Navigation Components

#### Update Navbar (`components/navbar.tsx`)
\`\`\`typescript
// ADD these imports at the top:
import { useSession, signOut } from 'next-auth/react'

// REPLACE the existing component props and logic:
export function Navbar() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' })
  }

  // UPDATE the userRole, userName logic:
  const userRole = session?.user?.role as "student" | "recruiter" | null
  const userName = session?.user?.name || session?.user?.email
  const userAvatar = session?.user?.image

  // Rest of the component remains the same but uses real session data
}
\`\`\`

#### Update FloatingNavbar (`components/floating-navbar.tsx`)
\`\`\`typescript
// MAKE the same changes as Navbar component above
// Replace props with useSession hook
// Update logout handler to use signOut
\`\`\`

### 4. Add Loading States and Error Handling

#### Create Loading Component (`components/loading.tsx`)
\`\`\`typescript
// CREATE new file: components/loading.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function JobsLoading() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <Skeleton className="h-6 w-64 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <div className="flex gap-4 mb-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-16 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-18" />
                </div>
              </div>
              <div className="flex flex-col gap-3 lg:w-40">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function ProfileLoading() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1 space-y-6">
        <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
          <CardContent className="p-8 text-center">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-6" />
            <Skeleton className="h-6 w-32 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-2 space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
            <CardContent className="p-8">
              <Skeleton className="h-6 w-48 mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
\`\`\`

### 5. Add Error Boundary

#### Create Error Boundary (`components/error-boundary.tsx`)
\`\`\`typescript
// CREATE new file: components/error-boundary.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle } from 'lucide-react'

export function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-background/60 backdrop-blur-xl border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Something went wrong!</h2>
          <p className="text-muted-foreground mb-6">
            We encountered an error while loading this page.
          </p>
          <Button onClick={reset} className="w-full">
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
\`\`\`

### 6. Update Form Submissions

#### Student Registration (`app/student/register/page.tsx`)
\`\`\`typescript
// UPDATE handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    const formData = new FormData(e.target as HTMLFormElement)
    const studentData = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      college: formData.get('college'),
      course: formData.get('course'),
      year: formData.get('year'),
      cgpa: parseFloat(formData.get('cgpa') as string),
    }

    // Upload files if present
    let profilePicUrl = null
    let resumeUrl = null
    
    if (profilePhoto) {
      profilePicUrl = await apiClient.uploadFile(profilePhoto, 'profile-pics')
    }
    
    if (resume) {
      resumeUrl = await apiClient.uploadFile(resume, 'resumes')
    }

    await apiClient.registerStudent({
      ...studentData,
      profilePic: profilePicUrl,
      resumeUrl: resumeUrl
    })

    toast({
      title: "Registration Successful",
      description: "Welcome to CampusCogni! Please sign in to continue.",
    })
    
    router.push("/auth?message=registration-success")
  } catch (error) {
    toast({
      title: "Registration Failed",
      description: "Please check your information and try again.",
    })
  } finally {
    setIsLoading(false)
  }
}
\`\`\`

#### Job Posting (`app/recruiter/post-job/page.tsx`)
\`\`\`typescript
// UPDATE handleSubmit function:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setIsLoading(true)

  try {
    const formData = new FormData(e.target as HTMLFormElement)
    const jobData = {
      title: formData.get('jobTitle'),
      type: formData.get('jobType'),
      workMode: formData.get('workMode'),
      location: formData.get('location'),
      stipend: formData.get('stipend'),
      description: formData.get('description'),
      requirements: formData.get('requirements'),
      benefits: formData.get('benefits'),
      eligibleCourses: selectedCourses,
      eligibleYears: selectedYears,
      minCGPA: parseFloat(formData.get('minCGPA') as string) || null,
      deadline: new Date(formData.get('applicationDeadline') as string),
      applicationProcess: formData.get('applicationProcess'),
      contactEmail: formData.get('contactEmail'),
    }

    await apiClient.createJob(jobData)

    toast({
      title: "Job Posted Successfully!",
      description: "Your job posting is now live and visible to students.",
    })
    
    router.push("/recruiter/dashboard")
  } catch (error) {
    toast({
      title: "Failed to Post Job",
      description: "Please check your information and try again.",
    })
  } finally {
    setIsLoading(false)
  }
}
\`\`\`

### 7. Add Environment Variables

#### Update `.env.local`
\`\`\`bash
# ADD these environment variables:

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Database
DATABASE_URL="your-mongodb-connection-string"

# Google OAuth (for social login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# File Storage
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Email Service
RESEND_API_KEY="your-resend-api-key"

# Real-time Features (optional)
NEXT_PUBLIC_PUSHER_KEY="your-pusher-key"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
\`\`\`

### 8. Install Required Dependencies

\`\`\`bash
# ADD these dependencies:
npm install next-auth @next-auth/prisma-adapter
npm install prisma @prisma/client
npm install @vercel/blob
npm install resend
npm install pusher pusher-js  # for real-time features
npm install bcryptjs  # for password hashing
npm install zod  # for validation
npm install @hookform/resolvers react-hook-form  # for form handling
\`\`\`

### 9. Create API Client Library

#### Create API Client (`lib/api.ts`)
\`\`\`typescript
// CREATE new file: lib/api.ts
class ApiClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`)
    }

    return response.json()
  }

  // Authentication
  async registerStudent(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'STUDENT' }),
    })
  }

  async registerRecruiter(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'RECRUITER' }),
    })
  }

  // Student APIs
  async getStudentProfile(id: string) {
    return this.request(`/students/${id}`)
  }

  async updateStudentProfile(id: string, data: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getApplications(userId: string) {
    return this.request(`/applications?userId=${userId}`)
  }

  // Job APIs
  async getJobs(filters?: any) {
    const params = new URLSearchParams(filters)
    return this.request(`/jobs?${params}`)
  }

  async applyToJob(jobId: string, applicationData: any) {
    return this.request(`/jobs/${jobId}/applications`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    })
  }

  async createJob(jobData: any) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    })
  }

  // Recruiter APIs
  async getRecruiterJobs(recruiterId: string) {
    return this.request(`/recruiters/${recruiterId}/jobs`)
  }

  async getRecruiterApplications(recruiterId: string) {
    return this.request(`/applications?recruiterId=${recruiterId}`)
  }

  async getCollegeData() {
    return this.request('/colleges')
  }

  // File Upload
  async uploadFile(file: File, folder: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
\`\`\`

### 10. Update Package.json Scripts

\`\`\`json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
\`\`\`

These changes will transform your frontend from using mock data to properly integrating with the backend APIs. Make sure to implement the backend endpoints as described in the earlier sections before making these frontend changes.

## Page-to-Backend Mapping

### Student Pages
- **`/student/register`** → `POST /api/auth/register`, `POST /api/students`
- **`/student/dashboard`** → `GET /api/jobs`, `GET /api/students/[id]/applications`
- **`/student/profile`** → `GET /api/students/[id]`, `PUT /api/students/[id]`
- **`/student/applications`** → `GET /api/students/[id]/applications`
- **`/student/cv-builder`** → `PUT /api/students/[id]`, `POST /api/upload/resume`

### Recruiter Pages
- **`/recruiter/register`** → `POST /api/auth/register`, `POST /api/recruiters`
- **`/recruiter/dashboard`** → `GET /api/recruiters/[id]/jobs`, `GET /api/jobs/[id]/applications`
- **`/recruiter/post-job`** → `POST /api/jobs`
- **`/recruiter/applications`** → `GET /api/applications`, `PUT /api/applications/[id]/status`

### Common Pages
- **`/auth`** → `POST /api/auth/signin`, `POST /api/auth/register`
- **File uploads** → `POST /api/upload/*`
- **Notifications** → `GET /api/notifications`, WebSocket connections

## Deployment Checklist

### 1. Environment Setup
- [ ] MongoDB Atlas cluster configured
- [ ] Environment variables set in Vercel
- [ ] Google OAuth configured
- [ ] Vercel Blob storage setup
- [ ] Resend email service configured

### 2. Database Migration
\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

### 3. Production Considerations
- [ ] Database indexes for performance
- [ ] Rate limiting on API endpoints
- [ ] Input validation and sanitization
- [ ] Error logging and monitoring
- [ ] Backup strategy for MongoDB
- [ ] CDN for file storage
- [ ] API documentation

This comprehensive guide provides the foundation for building a robust backend for CampusCogni using MongoDB Atlas and modern web technologies.
