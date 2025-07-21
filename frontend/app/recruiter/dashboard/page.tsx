"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BentoCard } from "@/components/ui/bento-card"
import { BentoGrid } from "@/components/ui/bento-grid"
import { Skeleton, CardSkeleton, StatCardSkeleton, JobCardSkeleton } from "@/components/ui/skeleton"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Calendar,
  Plus,
  Eye,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeftRight
} from "lucide-react"

interface JobPost {
  id: string
  title: string
  type: string
  location: string
  applications: number
  status: string
  datePosted: string
}

interface Application {
  id: string
  applicantName: string
  jobTitle: string
  status: string
  appliedDate: string
  applicant: {
    profile: {
      course: string
      year: string
    }
  }
}

export default function RecruiterDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [recruiterProfile, setRecruiterProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0
  })
  const [recentJobs, setRecentJobs] = useState<JobPost[]>([])
  const [recentApplications, setRecentApplications] = useState<Application[]>([])

  useEffect(() => {
    console.log('Recruiter dashboard - Current user:', user)
    console.log('Recruiter dashboard - User role:', user?.role)
    
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user && user.role !== 'RECRUITER' && user.role !== 'BOTH') {
      console.log('Recruiter dashboard - Redirecting to user dashboard, user role:', user.role)
      router.push('/user/dashboard')
      return
    }

    if (user) {
      // Check and update role before fetching dashboard data
      checkAndUpdateRole()
    }
  }, [user, loading, router])

  const checkAndUpdateRole = async () => {
    try {
      console.log('Checking if user role needs updating...')
      const roleUpdateResponse = await apiClient.updateUserRole(user!.id, user!.role)
      
      if (roleUpdateResponse.roleUpdated) {
        console.log('Role updated from', roleUpdateResponse.oldRole, 'to', roleUpdateResponse.newRole)
        
        // Update the user in localStorage
        const updatedUser = { ...user!, role: roleUpdateResponse.newRole }
        localStorage.setItem('userData', JSON.stringify(updatedUser))
        
        // Force a page refresh to reload with new role
        window.location.reload()
        return
      }
      
      // Continue with fetching dashboard data
      fetchDashboardData()
    } catch (error) {
      console.error('Failed to check/update role:', error)
      // Continue with dashboard data even if role check fails
      fetchDashboardData()
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // First get recruiter profile to get recruiter ID
      console.log('Fetching recruiter profile for user ID:', user!.id)
      
      let recruiterProfile
      let retryCount = 0
      const maxRetries = 3
      
      // Retry mechanism for recruiter profile (in case it was just created)
      while (retryCount < maxRetries) {
        try {
          recruiterProfile = await apiClient.getRecruiterProfile(user!.id)
          console.log('Recruiter profile fetched:', recruiterProfile)
          setRecruiterProfile(recruiterProfile) // Store in state
          break
        } catch (error: any) {
          retryCount++
          console.log(`Attempt ${retryCount} failed to fetch recruiter profile:`, error)
          
          if (retryCount >= maxRetries) {
            console.error('Failed to fetch recruiter profile after', maxRetries, 'attempts')
            throw new Error('Recruiter profile not found. Please try refreshing the page.')
          }
          
          // Wait 1 second before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      if (!recruiterProfile) {
        throw new Error('Unable to fetch recruiter profile')
      }
      
      const recruiterId = recruiterProfile.id
      
      // Fetch recruiter's jobs from backend
      const jobsResponse = await apiClient.getRecruiterJobs(recruiterId)
      const recruiterJobs = jobsResponse || []
      
      // Fetch applications for recruiter's jobs
      const applicationsResponse = await apiClient.getRecruiterApplications(recruiterId)
      const recruiterApplications = applicationsResponse || []
      
      // Transform jobs data
      const transformedJobs: JobPost[] = recruiterJobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        type: job.type,
        location: job.location,
        applications: job._count?.applications || 0,
        status: job.status === 'ACTIVE' ? 'Active' : 'Inactive',
        datePosted: new Date(job.createdAt).toISOString().split('T')[0]
      }))
      
      // Transform applications data
      const transformedApplications: Application[] = recruiterApplications.map((app: any) => ({
        id: app.id,
        applicantName: `${app.student?.firstName || 'Unknown'} ${app.student?.lastName || 'User'}`,
        jobTitle: app.job?.title || 'Unknown Position',
        status: app.status.toLowerCase(),
        appliedDate: new Date(app.appliedAt).toISOString().split('T')[0],
        applicant: {
          profile: {
            course: app.student?.course || 'Unknown Course',
            year: app.student?.year || 'Unknown Year'
          }
        }
      }))
      
      // Calculate stats
      const stats = {
        totalJobs: transformedJobs.length,
        totalApplications: transformedApplications.length,
        pendingApplications: transformedApplications.filter(app => ['applied', 'under_review'].includes(app.status)).length,
        acceptedApplications: transformedApplications.filter(app => app.status === 'hired').length
      }

      setStats(stats)
      setRecentJobs(transformedJobs)
      setRecentApplications(transformedApplications)

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast({
        title: "Error",
        description: `Failed to load profile data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSwitchToUser = () => {
    router.push('/user/dashboard')
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen">
        <BackgroundPaths />
        <FloatingNavbar userRole={user?.role as "USER" | "RECRUITER" | "BOTH"} userName={user?.email || "Recruiter"} />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CardSkeleton className="h-64" />
              <CardSkeleton className="h-64" />
            </div>
            <JobCardSkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole={user?.role as "USER" | "RECRUITER" | "BOTH"} userName={user?.email || "Recruiter"} />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, <span className="text-primary">{recruiterProfile?.firstName || user?.email?.split('@')[0] || 'Recruiter'}!</span></h1>
            <p className="text-muted-foreground">Here's what's happening with your recruitment activities.</p>
          </div>

          {/* Stats Cards - Bento Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <BentoCard
              title="Total Jobs"
              description="Active job postings"
              icon={<Briefcase className="h-4 w-4 text-blue-500" />}
              status="Active"
              meta={`${stats.totalJobs} posted`}
              cta="Manage →"
              onClick={() => router.push('/recruiter/post-job')}
            >
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalJobs}
              </div>
            </BentoCard>

            <BentoCard
              title="Applications"
              description="Total applications received"
              icon={<Users className="h-4 w-4 text-purple-500" />}
              status="Updated"
              meta={`${stats.totalApplications} total`}
              cta="Review →"
              hasPersistentHover={stats.pendingApplications > 0}
            >
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalApplications}
              </div>
            </BentoCard>

            <BentoCard
              title="Pending Review"
              description="Applications awaiting review"
              icon={<Clock className="h-4 w-4 text-yellow-500" />}
              status="Urgent"
              meta={`${stats.pendingApplications} waiting`}
              cta="Review Now →"
              hasPersistentHover={stats.pendingApplications > 0}
            >
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.pendingApplications}
              </div>
            </BentoCard>

            <BentoCard
              title="Accepted"
              description="Successfully hired candidates"
              icon={<CheckCircle className="h-4 w-4 text-green-500" />}
              status="Success"
              meta={`${stats.acceptedApplications} hired`}
              cta="View →"
            >
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.acceptedApplications}
              </div>
            </BentoCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Job Posts */}
            <Card className="backdrop-blur-sm bg-background/95">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Job Posts</CardTitle>
                    <CardDescription>Your latest job postings and their performance</CardDescription>
                  </div>
                  <Button asChild size="sm">
                    <Link href="/recruiter/post-job">
                      <Plus className="h-4 w-4 mr-2" />
                      Post Job
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{job.title}</h4>
                        <p className="text-sm text-muted-foreground">{job.type} • {job.location}</p>
                        <p className="text-sm text-muted-foreground">{job.applications} applications</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          {job.status}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Applications */}
            <Card className="backdrop-blur-sm bg-background/95">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Applications</CardTitle>
                    <CardDescription>Latest applications requiring your review</CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/recruiter/applications">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{application.applicantName}</h4>
                        <p className="text-sm text-muted-foreground">{application.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.applicant.profile.course} • {application.applicant.profile.year}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Pending
                        </span>
                        <Button variant="ghost" size="sm">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="backdrop-blur-sm bg-background/95 mt-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks to help you manage recruitment efficiently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-row flex-wrap gap-2">
                <Button asChild variant="outline" className="flex items-center gap-2 px-4 py-2">
                  <Link href="/recruiter/post-job">
                    <Plus className="h-5 w-5" />
                    <span>Post New Job</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex items-center gap-2 px-4 py-2">
                  <Link href="/recruiter/applications">
                    <Users className="h-5 w-5" />
                    <span>Review Applications</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="flex items-center gap-2 px-4 py-2">
                  <Link href="/recruiter/applications">
                    <TrendingUp className="h-5 w-5" />
                    <span>View Analytics</span>
                  </Link>
                </Button>
                {user?.role === 'BOTH' && (
                  <Button onClick={handleSwitchToUser} variant="outline" className="flex items-center gap-2 px-4 py-2">
                    <ArrowLeftRight className="h-5 w-5" />
                    <span>Switch to User Dashboard</span>
                  </Button>
                )}
                <Button asChild variant="outline" className="flex items-center gap-2 px-4 py-2">
                  <Link href="/recruiter/candidate-search">
                    <Users className="h-5 w-5" />
                    <span>Search Candidates</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
