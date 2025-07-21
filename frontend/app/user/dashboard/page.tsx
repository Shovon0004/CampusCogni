"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BentoCard } from "@/components/ui/bento-card"
import { BentoGrid } from "@/components/ui/bento-grid"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { 
  Briefcase, 
  MapPin, 
  Clock,
  Building,
  Star,
  Heart,
  TrendingUp,
  Users,
  BookOpen,
  ArrowLeftRight
} from "lucide-react"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  stipend: string
  description: string
  requirements: string
  postedDate: string
  saved: boolean
  applied: boolean
  ownJob?: boolean
}

export default function UserDashboard() {
  const { user, loading, upgradeToRecruiter } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [stats, setStats] = useState({
    totalApplications: 0,
    savedJobs: 0,
    interviewsScheduled: 0
  })

  useEffect(() => {
    console.log('User dashboard - Current user:', user)
    console.log('User dashboard - User role:', user?.role)
    
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    // Allow RECRUITER role users to access user dashboard if they have both profiles
    if (user && user.role === 'RECRUITER') {
      console.log('User dashboard - RECRUITER trying to access user dashboard, checking for dual profiles...')
      checkAndUpdateUserRole()
      return
    }
    
    if (user && (user.role !== 'USER' && user.role !== 'BOTH' && user.role !== 'RECRUITER')) {
      console.log('User dashboard - Redirecting to recruiter dashboard, user role:', user.role)
      router.push('/recruiter/dashboard')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router])

  const checkAndUpdateUserRole = async () => {
    try {
      console.log('Checking and updating user role for dual profiles...')
      const roleUpdateResponse = await apiClient.updateUserRole(user!.id, user!.role)
      
      if (roleUpdateResponse.roleUpdated && roleUpdateResponse.newRole === 'BOTH') {
        console.log('Role updated from', roleUpdateResponse.oldRole, 'to', roleUpdateResponse.newRole)
        
        // Update the user in context and localStorage
        const updatedUser = { ...user!, role: 'BOTH' }
        localStorage.setItem('userData', JSON.stringify(updatedUser))
        
        // Continue with loading the dashboard
        fetchDashboardData()
      } else if (roleUpdateResponse.newRole === 'RECRUITER') {
        // User only has recruiter profile, redirect to recruiter dashboard
        console.log('User only has recruiter profile, redirecting...')
        router.push('/recruiter/dashboard')
      } else {
        // Continue with user dashboard
        fetchDashboardData()
      }
    } catch (error) {
      console.error('Failed to check/update user role:', error)
      // If role check fails, still try to load dashboard
      fetchDashboardData()
    }
  }

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user profile to get name
      try {
        const profileResponse = await apiClient.getUserProfile(user!.id)
        setUserProfile(profileResponse)
      } catch (profileError) {
        console.log('Could not fetch user profile:', profileError)
        // Continue without profile data
      }
      
      // Fetch jobs from backend
      const jobsResponse = await apiClient.getJobs()
      const fetchedJobs = jobsResponse.jobs || []
      
      // Fetch user applications to check applied status
      const applicationsResponse = await apiClient.getUserApplications(user!.id)
      const userApplications = applicationsResponse || []
      
      // Map jobs with applied status and ownership
      const jobsWithStatus = fetchedJobs.map((job: any) => ({
        id: job.id,
        title: job.title,
        company: job.recruiter?.company || 'Unknown Company',
        location: job.location,
        type: job.type,
        stipend: job.stipend,
        description: job.description,
        requirements: job.requirements || '',
        postedDate: new Date(job.createdAt).toISOString().split('T')[0],
        saved: false, // TODO: Implement saved jobs functionality
        applied: userApplications.some((app: any) => app.job?.id === job.id),
        ownJob: job.recruiter && job.recruiter.userId && user?.id && job.recruiter.userId === user.id
      }))
      
      // Calculate stats
      const stats = {
        totalApplications: userApplications.length,
        savedJobs: 0, // TODO: Implement saved jobs functionality
        interviewsScheduled: userApplications.filter((app: any) => app.status === 'INTERVIEW_SCHEDULED').length
      }

      setJobs(jobsWithStatus)
      setStats(stats)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyToJob = async (jobId: string) => {
    try {
      await apiClient.applyToJob(jobId, user!.id)
      
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === jobId 
            ? { ...job, applied: true }
            : job
        )
      )
      
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      })
    } catch (error) {
      console.error('Failed to apply to job:', error)
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSaveJob = (jobId: string) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, saved: !job.saved }
          : job
      )
    )
    
    toast({
      title: "Job Saved",
      description: "Job has been saved to your list!",
    })
  }

  const handleBecomeRecruiter = () => {
    // If user already has recruiter access, go to recruiter dashboard
    if (user?.role === 'RECRUITER' || user?.role === 'BOTH') {
      router.push('/recruiter/dashboard')
    } else {
      // Otherwise, go to recruiter registration
      router.push('/recruiter/register')
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole={user?.role} userName={user?.email || "User"} />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, <span className="text-primary">{userProfile?.firstName || user?.email?.split('@')[0] || 'User'}!</span>
            </h1>
            <p className="text-muted-foreground">Discover amazing career opportunities and track your applications.</p>
          </div>

          {/* Stats Cards - Bento Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <BentoCard
              title="Total Applications"
              description="Track your job application progress"
              icon={<Briefcase className="h-4 w-4 text-blue-500" />}
              status="Active"
              meta={`${stats.totalApplications} sent`}
              cta="View All →"
              onClick={() => router.push('/user/applications')}
            >
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.totalApplications}
              </div>
            </BentoCard>

            <BentoCard
              title="Saved Jobs"
              description="Your bookmarked opportunities"
              icon={<Heart className="h-4 w-4 text-red-500" />}
              status="Updated"
              meta={`${stats.savedJobs} saved`}
              cta="Browse →"
              hasPersistentHover={stats.savedJobs > 0}
            >
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.savedJobs}
              </div>
            </BentoCard>

            <BentoCard
              title="Interviews"
              description="Upcoming interview schedule"
              icon={<Users className="h-4 w-4 text-green-500" />}
              status="Scheduled"
              meta={`${stats.interviewsScheduled} upcoming`}
              tags={["Calendar", "Interview"]}
              cta="Schedule →"
            >
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {stats.interviewsScheduled}
              </div>
            </BentoCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Listings - Bento Style */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Available Jobs</h2>
                <p className="text-muted-foreground">Browse and apply to jobs that match your skills</p>
              </div>
              
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <BentoCard
                    key={job.id}
                    title={job.title}
                    description={job.description}
                    icon={<Building className="h-4 w-4 text-blue-500" />}
                    status={job.applied ? "Applied" : job.ownJob ? "Your Job" : "Open"}
                    meta={job.company}
                    tags={[job.type, job.location]}
                    cta={job.applied ? "Applied ✓" : job.ownJob ? "Manage →" : "Apply →"}
                    hasPersistentHover={!job.applied && !job.ownJob}
                    variant="large"
                    className="w-full"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {job.company}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.postedDate}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={job.type === 'Internship' ? 'secondary' : 'default'}>
                            {job.type}
                          </Badge>
                          <Badge variant="outline">{job.stipend}</Badge>
                        </div>
                      </div>
                      
                      {job.requirements && (
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.split(',').slice(0, 3).map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleApplyToJob(job.id)}
                          disabled={job.applied || job.ownJob}
                          className="flex-1"
                        >
                          {job.ownJob
                            ? "Your Job"
                            : job.applied
                              ? "Applied"
                              : "Apply Now"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleSaveJob(job.id)}
                          className="px-3"
                        >
                          <Heart className={`h-4 w-4 ${job.saved ? 'fill-current text-red-500' : ''}`} />
                        </Button>
                      </div>
                    </div>
                  </BentoCard>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Quick Actions - Bento Style */}
              <BentoCard
                title="Quick Actions"
                description="Navigate to key features"
                icon={<Star className="h-4 w-4 text-yellow-500" />}
                status="Ready"
                tags={["Navigation", "Tools"]}
              >
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start text-sm">
                    <a href="/user/applications">
                      <Briefcase className="h-4 w-4 mr-2" />
                      View My Applications
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start text-sm">
                    <a href="/user/profile">
                      <Users className="h-4 w-4 mr-2" />
                      Update Profile
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start text-sm">
                    <a href="/user/cv-builder">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Build CV
                    </a>
                  </Button>
                </div>
              </BentoCard>

              {/* Recruiter Access CTA - Bento Style */}
              <BentoCard
                title={user?.role === 'RECRUITER' || user?.role === 'BOTH' ? 'Recruiting' : 'Hiring?'}
                description={user?.role === 'RECRUITER' || user?.role === 'BOTH' 
                  ? 'Access your recruiter dashboard and manage jobs'
                  : 'Switch to recruiting mode and start posting jobs'
                }
                icon={user?.role === 'RECRUITER' || user?.role === 'BOTH' 
                  ? <ArrowLeftRight className="h-4 w-4 text-blue-500" />
                  : <TrendingUp className="h-4 w-4 text-purple-500" />
                }
                status={user?.role === 'RECRUITER' || user?.role === 'BOTH' ? 'Active' : 'Available'}
                tags={user?.role === 'RECRUITER' || user?.role === 'BOTH' ? ["Dashboard", "Active"] : ["Upgrade", "Opportunity"]}
                cta="Get Started →"
                hasPersistentHover={user?.role !== 'RECRUITER' && user?.role !== 'BOTH'}
                onClick={handleBecomeRecruiter}
              >
                <Button onClick={handleBecomeRecruiter} className="w-full mt-3">
                  {user?.role === 'RECRUITER' || user?.role === 'BOTH' 
                    ? <><ArrowLeftRight className="h-4 w-4 mr-2" />Switch to Recruiter Dashboard</>
                    : <><TrendingUp className="h-4 w-4 mr-2" />Become a Recruiter</>
                  }
                </Button>
              </BentoCard>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
