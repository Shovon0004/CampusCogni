"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
  XCircle
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
  studentName: string
  jobTitle: string
  status: string
  appliedDate: string
  student: {
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
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0
  })
  const [recentJobs, setRecentJobs] = useState<JobPost[]>([])
  const [recentApplications, setRecentApplications] = useState<Application[]>([])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user && user.role !== 'RECRUITER') {
      router.push('/student/dashboard')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, loading, router])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Mock data for now - replace with actual API calls
      const mockStats = {
        totalJobs: 5,
        totalApplications: 47,
        pendingApplications: 23,
        acceptedApplications: 8
      }

      const mockJobs: JobPost[] = [
        {
          id: "1",
          title: "Software Engineering Intern",
          type: "Internship", 
          location: "San Francisco, CA",
          applications: 12,
          status: "Active",
          datePosted: "2025-01-05"
        },
        {
          id: "2", 
          title: "Data Science Intern",
          type: "Internship",
          location: "Remote",
          applications: 8,
          status: "Active", 
          datePosted: "2025-01-03"
        },
        {
          id: "3",
          title: "Product Manager Trainee",
          type: "Full-time",
          location: "New York, NY", 
          applications: 15,
          status: "Active",
          datePosted: "2025-01-01"
        }
      ]

      const mockApplications: Application[] = [
        {
          id: "1",
          studentName: "John Doe",
          jobTitle: "Software Engineering Intern", 
          status: "pending",
          appliedDate: "2025-01-06",
          student: {
            profile: {
              course: "Computer Science",
              year: "3rd Year"
            }
          }
        },
        {
          id: "2",
          studentName: "Jane Smith", 
          jobTitle: "Data Science Intern",
          status: "pending",
          appliedDate: "2025-01-05",
          student: {
            profile: {
              course: "Data Science",
              year: "4th Year"
            }
          }
        }
      ]

      setStats(mockStats)
      setRecentJobs(mockJobs)
      setRecentApplications(mockApplications)

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
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
      <FloatingNavbar userRole="recruiter" userName={user?.email || "Recruiter"} />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
            <p className="text-muted-foreground">Here's what's happening with your recruitment activities.</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">{stats.totalJobs}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold">{stats.pendingApplications}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Accepted</p>
                    <p className="text-2xl font-bold">{stats.acceptedApplications}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
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
                    <a href="/recruiter/post-job">
                      <Plus className="h-4 w-4 mr-2" />
                      Post Job
                    </a>
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
                    <a href="/recruiter/applications">View All</a>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentApplications.map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-semibold">{application.studentName}</h4>
                        <p className="text-sm text-muted-foreground">{application.jobTitle}</p>
                        <p className="text-sm text-muted-foreground">
                          {application.student.profile.course} • {application.student.profile.year}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col">
                  <a href="/recruiter/post-job">
                    <Plus className="h-6 w-6 mb-2" />
                    Post New Job
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <a href="/recruiter/applications">
                    <Users className="h-6 w-6 mb-2" />
                    Review Applications
                  </a>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col">
                  <a href="/recruiter/applications">
                    <TrendingUp className="h-6 w-6 mb-2" />
                    View Analytics
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
