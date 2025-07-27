"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton, CardSkeleton, JobCardSkeleton } from "@/components/ui/skeleton"
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
  Eye,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react"

interface Application {
  id: string
  jobTitle: string
  company: string
  location: string
  appliedDate: string
  status: "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "REJECTED" | "HIRED"
  jobType: string
  stipend: string
}

export default function UserApplicationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    interviewed: 0,
    hired: 0
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user && user.role !== 'USER') {
      router.push('/recruiter/dashboard')
      return
    }

    if (user) {
      fetchApplications()
    }
  }, [user, loading, router])

  const fetchApplications = async () => {
    try {
      setIsLoading(true)
      
      // Fetch user applications from backend
      const response = await apiClient.getUserApplications(user!.id)
      const userApplications = response || []
      
      // Transform the data to match the expected format
      const transformedApplications: Application[] = userApplications.map((app: any) => ({
        id: app.id,
        jobTitle: app.job?.title || 'Unknown Position',
        company: app.job?.recruiter?.company || 'Unknown Company',
        location: app.job?.location || 'Unknown Location',
        appliedDate: new Date(app.appliedAt).toISOString().split('T')[0],
        status: app.status,
        jobType: app.job?.type || 'Unknown',
        stipend: app.job?.stipend || 'Not specified'
      }))
      
      // Calculate stats
      const stats = {
        total: transformedApplications.length,
        pending: transformedApplications.filter(app => ['APPLIED', 'UNDER_REVIEW'].includes(app.status)).length,
        interviewed: transformedApplications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length,
        hired: transformedApplications.filter(app => app.status === 'HIRED').length
      }

      setApplications(transformedApplications)
      setStats(stats)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800"
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800"
      case "SHORTLISTED":
        return "bg-purple-100 text-purple-800"
      case "INTERVIEW_SCHEDULED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "HIRED":
        return "bg-emerald-100 text-emerald-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "INTERVIEW_SCHEDULED":
        return <Calendar className="h-4 w-4" />
      case "HIRED":
        return <CheckCircle className="h-4 w-4" />
      case "REJECTED":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen">
        <BackgroundPaths />
        <FloatingNavbar userRole={user?.role} userName={user?.email} />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-6">
            <CardSkeleton className="h-32" />
            <div className="grid gap-6">
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole={user?.role} userName={user?.email} />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">My Applications</h1>
            <p className="text-muted-foreground">Track the status of your job applications</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                    <p className="text-2xl font-bold">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Interviews</p>
                    <p className="text-2xl font-bold">{stats.interviewed}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-background/95">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Hired</p>
                    <p className="text-2xl font-bold">{stats.hired}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Applications List */}
          <Card className="backdrop-blur-sm bg-background/95">
            <CardHeader>
              <CardTitle>Application History</CardTitle>
              <CardDescription>View and track all your job applications</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                  <p className="text-muted-foreground mb-4">Start applying to jobs to see them here</p>
                  <Button asChild>
                    <a href="/user/dashboard">Browse Jobs</a>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">{application.jobTitle}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              {application.company}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {application.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              Applied {application.appliedDate}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{application.jobType}</Badge>
                          <Badge variant="outline">{application.stipend}</Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            {application.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
