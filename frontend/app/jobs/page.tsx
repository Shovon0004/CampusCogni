"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { useJobs } from "@/hooks/use-cached-data"
import { cachedApiClient } from "@/lib/cached-api-client"
import { 
  Briefcase, 
  MapPin, 
  Clock,
  Building,
  Search,
  Filter,
  Heart,
  Calendar,
  Users,
  DollarSign
} from "lucide-react"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  workMode: string
  stipend: string
  description: string
  requirements: string
  deadline: string
  createdAt: string
  applied: boolean
  recruiter?: {
    company: string
    firstName: string
    lastName: string
  }
  _count?: {
    applications: number
  }
}

function JobsPageContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  // URL search params
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [jobType, setJobType] = useState(searchParams.get('type') || 'ALL')
  const [workMode, setWorkMode] = useState(searchParams.get('workMode') || 'ALL')
  
  // Use cached jobs hook
  const filters = {
    search: searchQuery || undefined,
    type: jobType === 'ALL' ? undefined : jobType,
    workMode: workMode === 'ALL' ? undefined : workMode,
    eligibleFor: user?.id || undefined,
  }
  
  const { data: jobsData, loading: jobsLoading, refresh: refreshJobs } = useJobs(currentPage, filters, { 
    enabled: !!user 
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
  }, [user, loading, router])

  const jobs = jobsData?.jobs || []
  const pagination = jobsData?.pagination || { page: 1, limit: 10, total: 0, pages: 0 }

  const handleApplyToJob = async (jobId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for jobs.",
        variant: "destructive"
      })
      return
    }

    try {
      await cachedApiClient.applyToJob(jobId, user.id)
      
      // Refresh jobs data to update UI
      await refreshJobs()
      
      toast({
        title: "Application Submitted",
        description: "Your application has been submitted successfully!",
      })
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
    }
  }

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery) params.set('search', searchQuery)
    if (jobType && jobType !== 'ALL') params.set('type', jobType)
    if (workMode && workMode !== 'ALL') params.set('workMode', workMode)
    
    router.push(`/jobs?${params.toString()}`)
    setCurrentPage(1)
    refreshJobs()
  }

  const clearFilters = () => {
    setSearchQuery('')
    setJobType('ALL')
    setWorkMode('ALL')
    setCurrentPage(1)
    router.push('/jobs')
    refreshJobs()
  }

  const formatStipend = (stipend: string | number) => {
    if (!stipend) return 'Stipend not disclosed'
    const amount = typeof stipend === 'string' ? parseInt(stipend) : stipend
    return `₹${amount.toLocaleString()}/month`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <BackgroundPaths />
        <div className="container mx-auto px-4 py-24">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Find Your <span className="text-primary">Dream Job</span>
            </h1>
            <p className="text-muted-foreground">
              Discover amazing career opportunities from top companies
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search jobs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Job Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="INTERNSHIP">Internship</SelectItem>
                    <SelectItem value="FULL_TIME">Full Time</SelectItem>
                    <SelectItem value="PART_TIME">Part Time</SelectItem>
                    <SelectItem value="CONTRACT">Contract</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={workMode} onValueChange={setWorkMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Work Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Modes</SelectItem>
                    <SelectItem value="REMOTE">Remote</SelectItem>
                    <SelectItem value="HYBRID">Hybrid</SelectItem>
                    <SelectItem value="ONSITE">On-site</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button onClick={handleSearch} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="mb-6">
            <p className="text-muted-foreground">
              {jobsLoading ? 'Loading...' : `${pagination.total} jobs found`}
            </p>
          </div>

          {/* Job Listings */}
          <div className="space-y-6">
            {jobsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-6 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : jobs.length > 0 ? (
              jobs.map((job: Job) => (
                <Card key={job.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {job.recruiter?.company || 'Company Name'}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">
                          <Button 
                            variant="link" 
                            className="p-0 h-auto font-semibold text-xl text-left justify-start"
                            onClick={() => router.push(`/jobs/${job.id}`)}
                          >
                            {job.title}
                          </Button>
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {formatStipend(job.stipend)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Deadline: {formatDate(job.deadline)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {job._count?.applications || 0} applicants
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4 line-clamp-2">
                          {job.description}
                        </p>
                        <div className="flex gap-2 mb-4">
                          <Badge variant="secondary">{job.type}</Badge>
                          <Badge variant="outline">{job.workMode}</Badge>
                          {job.applied && <Badge variant="default">Applied</Badge>}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => router.push(`/jobs/${job.id}`)}
                          variant="outline"
                          size="sm"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => {
                            if (job.applied) {
                              router.push('/user/applications');
                            } else {
                              handleApplyToJob(job.id);
                            }
                          }}
                          disabled={false}
                          size="sm"
                          variant={job.applied ? "outline" : "default"}
                        >
                          {job.applied ? 'View Application' : 'Apply Now'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      Posted {formatDate(job.createdAt)}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Jobs Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || (jobType && jobType !== 'ALL') || (workMode && workMode !== 'ALL')
                      ? "Try adjusting your search criteria or filters"
                      : "No jobs are currently available. Check back later!"}
                  </p>
                  {(searchQuery || (jobType && jobType !== 'ALL') || (workMode && workMode !== 'ALL')) && (
                    <Button onClick={clearFilters} variant="outline">
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const pageNum = i + 1
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  )
}

// Loading component for Suspense fallback
function JobsPageLoading() {
  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole="USER" userName="Loading..." />
      <div className="container mx-auto px-4 py-24">
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 animate-pulse" />
            <div className="h-8 bg-muted animate-pulse rounded mb-4 max-w-md mx-auto" />
            <div className="h-4 bg-muted animate-pulse rounded max-w-lg mx-auto" />
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-6 rounded-xl border bg-card animate-pulse">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded mb-4 w-2/3" />
                <div className="h-3 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={<JobsPageLoading />}>
      <JobsPageContent />
    </Suspense>
  )
}
