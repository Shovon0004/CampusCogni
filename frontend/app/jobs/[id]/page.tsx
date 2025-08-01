'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BentoCard } from '@/components/ui/bento-card'
import { Skeleton, CardSkeleton } from '@/components/ui/skeleton'
import { BackgroundPaths } from '@/components/background-paths'
import { FloatingNavbar } from '@/components/floating-navbar'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/contexts/AuthContext'
import { cachedApiClient } from '@/lib/cached-api-client'
import { createNotification } from '@/lib/notification-api'
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  GraduationCap, 
  Clock,
  Building,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Star,
  Globe,
  Phone,
  Mail,
  BookOpen,
  Award,
  Target,
  Gift,
  Shield,
  TrendingUp
} from 'lucide-react'

interface Job {
  id: string
  title: string
  type: string
  workMode: string
  location: string
  stipend: string
  description: string
  requirements: string
  benefits?: string
  eligibleCourses: string[]
  eligibleYears: string[]
  minCGPA?: number
  deadline: string
  status: string
  createdAt: string
  recruiter: {
    company: string
    firstName: string
    lastName: string
    website?: string
    industry?: string
    companySize?: string
  }
  _count: {
    applications: number
  }
}

export default function JobDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)

  useEffect(() => {
    if (id) {
      fetchJobDetails()
      if (user) {
        checkApplicationStatus()
      }
    }
  }, [id, user])

  const fetchJobDetails = async () => {
    try {
      setLoading(true)
      const jobData = await cachedApiClient.getJobDetail(id as string)
      setJob(jobData)
    } catch (error) {
      console.error('Failed to fetch job details:', error)
      toast({
        title: "Error",
        description: "Failed to load job details. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const checkApplicationStatus = async () => {
    try {
      const applications = await cachedApiClient.getUserApplications(user!.id)
      const applied = applications.some((app: any) => app.jobId === id)
      setHasApplied(applied)
    } catch (error) {
      console.error('Failed to check application status:', error)
    }
  }

  const handleApply = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for jobs.",
        variant: "destructive"
      })
      return
    }

    if (hasApplied) {
      toast({
        title: "Already Applied",
        description: "You have already applied to this job.",
        variant: "destructive"
      })
      return
    }

    try {
      setApplying(true)
      await cachedApiClient.applyToJob(id as string, user.id)
      setHasApplied(true)
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      })
      // Add notification for job application
      await createNotification({
        userId: user.id,
        title: "Job Application Submitted",
        message: `You applied to the job: ${job?.title || 'Job'}`,
        type: "JOB"
      });
    } catch (error: any) {
      console.error('Failed to apply to job:', error)
      
      // Check if it's an eligibility error with details
      if (error.details && error.details.length > 0) {
        toast({
          title: "Eligibility Requirements Not Met",
          description: (
            <div className="space-y-1">
              <p>You don't meet the following requirements:</p>
              <ul className="list-disc list-inside text-sm">
                {error.details.map((detail: string, index: number) => (
                  <li key={index}>{detail}</li>
                ))}
              </ul>
            </div>
          ),
          variant: "destructive"
        })
      } else {
        toast({
          title: "Application Failed",
          description: error.message || "Failed to submit application. Please try again.",
          variant: "destructive"
        })
      }
    } finally {
      setApplying(false)
    }
  }

  const formatJobType = (type: string) => {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatWorkMode = (mode: string) => {
    return mode.replace('_', '-').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatCompanySize = (size: string) => {
    const sizeMap: Record<string, string> = {
      'STARTUP': '1-10 employees',
      'SMALL': '11-50 employees', 
      'MEDIUM': '51-200 employees',
      'LARGE': '200+ employees'
    }
    return sizeMap[size] || size
  }

  const isDeadlinePassed = (deadline: string) => {
    return new Date() > new Date(deadline)
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <BackgroundPaths />
        <FloatingNavbar userRole={user?.role} userName={user?.email} />
        
        <div className="container mx-auto px-4 py-24">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/4" />
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <CardSkeleton className="h-32" />
                <CardSkeleton className="h-64" />
                <CardSkeleton className="h-48" />
              </div>
              <div className="space-y-6">
                <CardSkeleton className="h-48" />
                <CardSkeleton className="h-32" />
                <CardSkeleton className="h-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen">
        <BackgroundPaths />
        <FloatingNavbar userRole={user?.role} userName={user?.email} />
        
        <div className="container mx-auto px-4 py-24">
          <BentoCard
            title="Job Not Found"
            description="The job you're looking for doesn't exist or has been removed"
            icon={<XCircle className="w-4 h-4 text-red-500" />}
            status="Error"
            variant="large"
            className="max-w-2xl mx-auto text-center"
          >
            <div className="py-8">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <Button onClick={() => router.push('/jobs')} className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Jobs
              </Button>
            </div>
          </BentoCard>
        </div>
      </div>
    )
  }

  const deadlinePassed = isDeadlinePassed(job.deadline)
  const canApply = user && !hasApplied && !deadlinePassed && job.status === 'ACTIVE'

  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole={user?.role} userName={user?.email} />
      
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Jobs
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Job Header */}
              <BentoCard
                title={job.title}
                description={`${job.recruiter.company} • ${job.location}`}
                icon={<Briefcase className="w-4 h-4 text-blue-500" />}
                status={hasApplied ? 'Applied' : deadlinePassed ? 'Expired' : 'Active'}
                tags={[formatJobType(job.type), formatWorkMode(job.workMode)]}
                meta={`${job.stipend} • ${job._count.applications} applicants`}
                variant="large"
              >
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge variant="secondary">{formatJobType(job.type)}</Badge>
                  <Badge variant="outline">{formatWorkMode(job.workMode)}</Badge>
                  {deadlinePassed && <Badge variant="destructive">Deadline Passed</Badge>}
                  {hasApplied && (
                    <Badge variant="default" className="bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Applied
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
                  <span className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    {job.recruiter.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {job.stipend}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {job._count.applications} applicants
                  </span>
                </div>
              </BentoCard>

              {/* Job Description */}
              <BentoCard
                title="Job Description"
                description="What you'll be doing in this role"
                icon={<BookOpen className="w-4 h-4 text-purple-500" />}
                status="Details"
                variant="large"
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {job.description}
                  </p>
                </div>
              </BentoCard>

              {/* Requirements */}
              <BentoCard
                title="Requirements & Qualifications"
                description="Skills and experience we're looking for"
                icon={<Target className="w-4 h-4 text-orange-500" />}
                status="Essential"
                variant="large"
              >
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                    {job.requirements}
                  </p>
                </div>
              </BentoCard>

              {/* Benefits */}
              {job.benefits && (
                <BentoCard
                  title="Benefits & Perks"
                  description="What we offer our team members"
                  icon={<Gift className="w-4 h-4 text-green-500" />}
                  status="Included"
                  variant="large"
                >
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                      {job.benefits}
                    </p>
                  </div>
                </BentoCard>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Apply Button */}
              <BentoCard
                title={canApply ? "Ready to Apply?" : hasApplied ? "Application Submitted" : "Application Closed"}
                description={canApply ? "Submit your application now" : hasApplied ? "We'll review your application soon" : "This position is no longer accepting applications"}
                icon={canApply ? <TrendingUp className="w-4 h-4 text-blue-500" /> : hasApplied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                status={canApply ? "Available" : hasApplied ? "Complete" : "Closed"}
                variant="large"
              >
                {canApply ? (
                  <Button 
                    onClick={handleApply} 
                    disabled={applying}
                    className="w-full mt-4"
                    size="lg"
                  >
                    {applying ? "Submitting..." : "Apply Now"}
                  </Button>
                ) : hasApplied ? (
                  <Button 
                    onClick={() => router.push('/user/applications')} 
                    className="w-full mt-4" 
                    size="lg"
                    variant="outline"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    View Application
                  </Button>
                ) : deadlinePassed ? (
                  <Button disabled className="w-full mt-4" size="lg">
                    Deadline Passed
                  </Button>
                ) : !user ? (
                  <Button onClick={() => router.push('/auth')} className="w-full mt-4" size="lg">
                    Login to Apply
                  </Button>
                ) : (
                  <Button disabled className="w-full mt-4" size="lg">
                    Not Available
                  </Button>
                )}
              </BentoCard>

              {/* Job Information */}
              <BentoCard
                title="Job Information"
                description="Key details about this position"
                icon={<Clock className="w-4 h-4 text-indigo-500" />}
                status="Details"
              >
                <div className="space-y-4 mt-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Application Deadline</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.deadline).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Posted</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(job.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </BentoCard>

              {/* Eligibility Criteria */}
              <BentoCard
                title="Eligibility Criteria"
                description="Requirements to apply for this position"
                icon={<Shield className="w-4 h-4 text-green-500" />}
                status="Required"
              >
                <div className="space-y-4 mt-4">
                  {job.eligibleCourses.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <BookOpen className="w-3 h-3" />
                        Eligible Courses
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {job.eligibleCourses.map((course, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {course}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {job.eligibleYears.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <GraduationCap className="w-3 h-3" />
                        Eligible Years
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {job.eligibleYears.map((year, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {year}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {job.minCGPA && (
                    <div className="flex items-start gap-3">
                      <Award className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Minimum CGPA</p>
                        <p className="text-sm text-muted-foreground">{job.minCGPA}/10</p>
                      </div>
                    </div>
                  )}
                </div>
              </BentoCard>

              {/* Company Information */}
              <BentoCard
                title="About the Company"
                description={job.recruiter.industry || "Learn more about the organization"}
                icon={<Building className="w-4 h-4 text-purple-500" />}
                status="Hiring"
              >
                <div className="space-y-4 mt-4">
                  <div>
                    <p className="font-medium text-lg">{job.recruiter.company}</p>
                    {job.recruiter.industry && (
                      <p className="text-sm text-muted-foreground">{job.recruiter.industry}</p>
                    )}
                  </div>
                  
                  {job.recruiter.companySize && (
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Company Size</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCompanySize(job.recruiter.companySize)}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {job.recruiter.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Website</p>
                        <a 
                          href={job.recruiter.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {job.recruiter.website.replace('https://', '').replace('http://', '')}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </BentoCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}