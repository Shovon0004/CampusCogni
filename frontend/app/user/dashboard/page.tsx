"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Saved Jobs</p>
                    <p className="text-2xl font-bold">{stats.savedJobs}</p>
                  </div>
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Interviews Scheduled</p>
                    <p className="text-2xl font-bold">{stats.interviewsScheduled}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Job Listings */}
            <div className="lg:col-span-2">
              <Card className="backdrop-blur-sm bg-background/95">
                <CardHeader>
                  <CardTitle>Available Jobs</CardTitle>
                  <CardDescription>Browse and apply to jobs that match your skills</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{job.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
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
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={job.type === 'Internship' ? 'secondary' : 'default'}>
                              {job.type}
                            </Badge>
                            <Badge variant="outline">{job.stipend}</Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {job.requirements && job.requirements.split(',').map((req, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {req.trim()}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="flex gap-2">
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
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="backdrop-blur-sm bg-background/95">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href="/user/applications">
                      <Briefcase className="h-4 w-4 mr-2" />
                      View My Applications
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href="/user/profile">
                      <Users className="h-4 w-4 mr-2" />
                      Update Profile
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a href="/user/cv-builder">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Build CV
                    </a>
                  </Button>
                </CardContent>
              </Card>

              {/* Recruiter Access CTA */}
              <Card className="backdrop-blur-sm bg-background/95">
                <CardHeader>
                  <CardTitle>
                    {user?.role === 'RECRUITER' || user?.role === 'BOTH' ? 'Recruiting' : 'Hiring?'}
                  </CardTitle>
                  <CardDescription>
                    {user?.role === 'RECRUITER' || user?.role === 'BOTH' 
                      ? 'Access your recruiter dashboard and manage jobs'
                      : 'Switch to recruiting mode and start posting jobs'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={handleBecomeRecruiter} className="w-full">
                    {user?.role === 'RECRUITER' || user?.role === 'BOTH' 
                      ? <><ArrowLeftRight className="h-4 w-4 mr-2" />Switch to Recruiter Dashboard</>
                      : <><TrendingUp className="h-4 w-4 mr-2" />Become a Recruiter</>
                    }
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
