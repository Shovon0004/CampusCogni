"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BentoCard } from "@/components/ui/bento-card"
import { Skeleton, CardSkeleton, JobCardSkeleton } from "@/components/ui/skeleton"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { createNotification } from "@/lib/notification-api"
import { 
  Briefcase, 
  MapPin, 
  Clock,
  Building,
  Calendar,
  CheckCircle
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

      // Check for status changes and notify
      const prevStatuses = JSON.parse(localStorage.getItem('prev_app_statuses_' + user!.id) || '{}')
      for (const app of transformedApplications) {
        const prev = prevStatuses[app.id]
        if (prev && prev !== app.status) {
          let notifTitle = '', notifMsg = '';
          if (app.status === 'SHORTLISTED') {
            notifTitle = 'Shortlisted for Job';
            notifMsg = `You have been shortlisted for ${app.jobTitle} at ${app.company}.`;
          } else if (app.status === 'INTERVIEW_SCHEDULED') {
            notifTitle = 'Interview Scheduled';
            notifMsg = `Your interview is scheduled for ${app.jobTitle} at ${app.company}.`;
          } else if (app.status === 'REJECTED') {
            notifTitle = 'Application Rejected';
            notifMsg = `You were not selected for ${app.jobTitle} at ${app.company}.`;
          } else if (app.status === 'HIRED') {
            notifTitle = 'Congratulations! Hired';
            notifMsg = `You have been hired for ${app.jobTitle} at ${app.company}.`;
          }
          if (notifTitle) {
            await createNotification({
              userId: user!.id,
              title: notifTitle,
              message: notifMsg,
              type: 'JOB'
            });
          }
        }
        prevStatuses[app.id] = app.status;
      }
      localStorage.setItem('prev_app_statuses_' + user!.id, JSON.stringify(prevStatuses));
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
            <BentoCard
              title={stats.total.toString()}
              description="Total Applications"
              icon={<Briefcase className="h-4 w-4 text-blue-500" />}
              variant="compact"
            />
            
            <BentoCard
              title={stats.pending.toString()}
              description="Pending Review"
              icon={<Clock className="h-4 w-4 text-yellow-500" />}
              variant="compact"
            />
            
            <BentoCard
              title={stats.interviewed.toString()}
              description="Interviews"
              icon={<Calendar className="h-4 w-4 text-green-500" />}
              variant="compact"
            />
            
            <BentoCard
              title={stats.hired.toString()}
              description="Hired"
              icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
              variant="compact"
            />
          </div>

          {/* Applications List */}
          <div className="space-y-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Application History</h2>
              <p className="text-muted-foreground">View and track all your job applications</p>
            </div>
            
            {applications.length === 0 ? (
              <div className="flex justify-center">
                <BentoCard
                  title="No Applications Yet"
                  description="Start applying to jobs to see them here"
                  icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
                  cta="Browse Jobs →"
                  onClick={() => router.push('/user/dashboard')}
                  variant="large"
                  className="max-w-md text-center"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {applications.map((application) => (
                  <BentoCard
                    key={application.id}
                    title={application.jobTitle}
                    description={application.company}
                    icon={<Building className="h-4 w-4 text-purple-500" />}
                    status={application.status.replace('_', ' ')}
                    meta={`${application.stipend} • ${application.location}`}
                    cta="View Details →"
                    variant="large"
                    onClick={() => {
                      // TODO: Navigate to application details or job details
                      toast({
                        title: "Application Details",
                        description: `Viewing details for ${application.jobTitle}`,
                      })
                    }}
                  >
                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {application.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Applied {application.appliedDate}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {application.jobType}
                      </Badge>
                    </div>
                  </BentoCard>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}