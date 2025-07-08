"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GeometricBackground } from "@/components/geometric-background"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Search, Filter, Calendar, MapPin, Building, Eye, MessageSquare, Download } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api"

interface Application {
  id: string
  jobTitle: string
  company: string
  location: string
  appliedDate: string
  status: "APPLIED" | "UNDER_REVIEW" | "SHORTLISTED" | "INTERVIEW_SCHEDULED" | "REJECTED" | "HIRED"
  type: "FULL_TIME" | "INTERNSHIP" | "PART_TIME"
  stipend: string
  nextStep?: string
  interviewDate?: string
}

export default function StudentApplicationsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [loadingApplications, setLoadingApplications] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user && user.role !== 'STUDENT') {
      router.push('/recruiter/dashboard')
      return
    }

    if (user) {
      fetchApplications()
    }
  }, [user, loading, router])

  const fetchApplications = async () => {
    try {
      setLoadingApplications(true)
      const response = await apiClient.getApplications(user!.id)
      
      // Transform backend data to match frontend interface
      const transformedApplications = response.map((app: any) => ({
        id: app.id,
        jobTitle: app.job?.title || 'Unknown Position',
        company: app.job?.company || 'Unknown Company',
        location: app.job?.location || 'Unknown Location',
        appliedDate: new Date(app.appliedAt).toLocaleDateString(),
        status: app.status,
        type: app.job?.type || 'FULL_TIME',
        stipend: app.job?.stipend || 'Not specified',
        nextStep: getNextStep(app.status),
      }))
      
      setApplications(transformedApplications)
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }

  const getNextStep = (status: string) => {
    switch (status) {
      case 'APPLIED':
        return 'Application Review'
      case 'UNDER_REVIEW':
        return 'HR Review'
      case 'SHORTLISTED':
        return 'Interview Scheduling'
      case 'INTERVIEW_SCHEDULED':
        return 'Prepare for Interview'
      case 'HIRED':
        return 'Onboarding Process'
      default:
        return undefined
    }
  }

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || app.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: Application["status"]) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "UNDER_REVIEW":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "SHORTLISTED":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300"
      case "INTERVIEW_SCHEDULED":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "HIRED":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "REJECTED":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getStatusLabel = (status: Application["status"]) => {
    switch (status) {
      case "APPLIED":
        return "Applied"
      case "UNDER_REVIEW":
        return "Under Review"
      case "SHORTLISTED":
        return "Shortlisted"
      case "INTERVIEW_SCHEDULED":
        return "Interview Scheduled"
      case "HIRED":
        return "Hired"
      case "REJECTED":
        return "Rejected"
      default:
        return status
    }
  }

  const stats = {
    total: applications.length,
    pending: applications.filter((app) => ["APPLIED", "UNDER_REVIEW"].includes(app.status)).length,
    interviews: applications.filter((app) => app.status === "INTERVIEW_SCHEDULED").length,
    accepted: applications.filter((app) => app.status === "HIRED").length,
  }

  return (
    <div className="min-h-screen">
      <GeometricBackground />
      <FloatingNavbar userRole="student" userName={user?.profile?.name || user?.email || "Student"} />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="mb-12">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              My Applications
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Track your job applications and interview progress
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Applications", value: stats.total, color: "text-primary" },
              { label: "Pending Review", value: stats.pending, color: "text-yellow-600" },
              { label: "Interviews", value: stats.interviews, color: "text-purple-600" },
              { label: "Accepted", value: stats.accepted, color: "text-green-600" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className={`text-3xl font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                    <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="mb-8 bg-background/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full md:w-[180px] bg-background/50 border-border/50">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Under Review">Under Review</SelectItem>
                      <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="Accepted">Accepted</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Applications List */}
          <div className="space-y-6">
            {loadingApplications ? (
              // Loading state
              Array.from({ length: 3 }).map((_, index) => (
                <Card key={index} className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="animate-pulse">
                      <div className="h-6 bg-gray-300 rounded w-64 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-32 mb-4"></div>
                      <div className="flex gap-4 mb-4">
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                        <div className="h-4 bg-gray-300 rounded w-24"></div>
                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                      </div>
                      <div className="h-8 bg-gray-300 rounded w-24"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredApplications.length === 0 ? (
              // Empty state
              <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-2">No applications found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterStatus !== "all" 
                      ? "Try adjusting your search filters" 
                      : "You haven't applied to any jobs yet. Start exploring opportunities!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredApplications.map((application, index) => (
              <motion.div
                key={application.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="hover:shadow-2xl transition-all duration-500 bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-semibold mb-2">{application.jobTitle}</h3>
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Building className="h-4 w-4" />
                              <span className="font-medium text-lg">{application.company}</span>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(application.status)} border-0 font-medium`}>
                            {getStatusLabel(application.status)}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {application.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Applied: {new Date(application.appliedDate).toLocaleDateString()}
                          </div>
                          <Badge variant="outline" className="bg-background/50">
                            {application.type}
                          </Badge>
                          <span className="font-medium text-primary">{application.stipend}</span>
                        </div>

                        {application.nextStep && (
                          <div className="mb-4 p-4 rounded-lg bg-muted/30">
                            <p className="text-sm font-medium text-foreground mb-1">
                              Next Step: {application.nextStep}
                            </p>
                            {application.interviewDate && (
                              <p className="text-sm text-muted-foreground">
                                Interview Date: {new Date(application.interviewDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 lg:w-48">
                        <Button
                          variant="outline"
                          className="w-full bg-background/50 hover:bg-background/80 border-border/50"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-background/50 hover:bg-background/80 border-border/50"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message HR
                        </Button>
                        {application.status === "HIRED" && (
                          <Button className="w-full shadow-lg hover:shadow-xl transition-all duration-300">
                            <Download className="h-4 w-4 mr-2" />
                            Download Offer
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
