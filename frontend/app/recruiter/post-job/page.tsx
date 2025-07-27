"use client";

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Skeleton, CardSkeleton } from "@/components/ui/skeleton"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { apiClient } from "@/lib/api"
import { Briefcase, MapPin, DollarSign, Users, GraduationCap, Building, Phone, Globe } from "lucide-react"

const PostJobPage: React.FC = () => {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])
  const [jobType, setJobType] = useState<string>("")
  const [workMode, setWorkMode] = useState<string>("")
  const [recruiterProfile, setRecruiterProfile] = useState({
    company: "",
    jobTitle: "",
    phone: "",
    website: "",
    companySize: "",
    industry: "",
    description: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user && user.role !== 'RECRUITER' && user.role !== 'BOTH') {
      router.push('/user/dashboard')
      return
    }

    if (user) {
      checkRecruiterProfile()
    }
  }, [user, loading, router])

  const checkRecruiterProfile = async () => {
    try {
      setLoadingProfile(true)
      const response = await apiClient.getRecruiterProfile(user!.id)
      
      // Check if essential profile information is missing
      if (!response.company || !response.jobTitle || !response.phone) {
        setShowProfileSetup(true)
        setRecruiterProfile({
          company: response.company || "",
          jobTitle: response.jobTitle || "",
          phone: response.phone || "",
          website: response.website || "",
          companySize: response.companySize || "",
          industry: response.industry || "",
          description: response.description || "",
        })
      }
    } catch (error) {
      console.error('Failed to fetch recruiter profile:', error)
      // If profile doesn't exist, show setup
      setShowProfileSetup(true)
    } finally {
      setLoadingProfile(false)
    }
  }

  const courses = [
    "Computer Science",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "MBA",
    "Other",
  ]

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"]

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await apiClient.updateRecruiterProfile(user!.id, recruiterProfile)
      setShowProfileSetup(false)
      toast({
        title: "Profile Updated",
        description: "Your recruiter profile has been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCourseChange = (course: string, checked: boolean) => {
    if (checked) {
      setSelectedCourses([...selectedCourses, course])
    } else {
      setSelectedCourses(selectedCourses.filter((c) => c !== course))
    }
  }

  const handleYearChange = (year: string, checked: boolean) => {
    if (checked) {
      setSelectedYears([...selectedYears, year])
    } else {
      setSelectedYears(selectedYears.filter((y) => y !== year))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const form = e.target as HTMLFormElement
      const formData = new FormData(form)
      
      // Validate required Select fields
      if (!jobType) {
        toast({
          title: "Missing Field",
          description: "Please select a job type",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }
      
      if (!workMode) {
        toast({
          title: "Missing Field", 
          description: "Please select a work mode",
          variant: "destructive"
        })
        setIsLoading(false)
        return
      }
      
      const jobData = {
        title: formData.get('jobTitle') as string,
        type: jobType,
        workMode: workMode,
        location: formData.get('location') as string,
        stipend: formData.get('stipend') as string,
        description: formData.get('description') as string,
        requirements: formData.get('requirements') as string,
        benefits: formData.get('benefits') as string,
        minCGPA: formData.get('minCGPA') ? parseFloat(formData.get('minCGPA') as string) : undefined,
        deadline: formData.get('deadline') as string,
        eligibleCourses: selectedCourses,
        eligibleYears: selectedYears,
      }

      console.log('Submitting job data:', jobData) // Debug log

      await apiClient.createJob(jobData)
      
      toast({
        title: "Job Posted Successfully!",
        description: "Your job posting is now live and visible to users.",
      })
      router.push("/recruiter/dashboard")
    } catch (error) {
      console.error('Failed to post job:', error)
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen">
        <BackgroundPaths />
        <FloatingNavbar userRole="RECRUITER" userName={user?.email || "Recruiter"} />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <CardSkeleton className="h-32" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CardSkeleton className="h-96" />
              <CardSkeleton className="h-96" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showProfileSetup) {
    return (
      <div className="min-h-screen">
        <BackgroundPaths />
        <FloatingNavbar userRole="RECRUITER" userName={user?.email || "Recruiter"} />

        <div className="container mx-auto px-4 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="backdrop-blur-sm bg-background/95">
              <CardHeader className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Complete Your Recruiter Profile</CardTitle>
                <CardDescription>
                  We need some additional information to set up your recruiter profile and post jobs.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name</Label>
                      <Input
                        id="company"
                        value={recruiterProfile.company}
                        onChange={(e) => setRecruiterProfile({ ...recruiterProfile, company: e.target.value })}
                        placeholder="Acme Corporation"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Your Job Title</Label>
                      <Input
                        id="jobTitle"
                        value={recruiterProfile.jobTitle}
                        onChange={(e) => setRecruiterProfile({ ...recruiterProfile, jobTitle: e.target.value })}
                        placeholder="HR Manager"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={recruiterProfile.phone}
                          onChange={(e) => setRecruiterProfile({ ...recruiterProfile, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Company Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="website"
                          value={recruiterProfile.website}
                          onChange={(e) => setRecruiterProfile({ ...recruiterProfile, website: e.target.value })}
                          placeholder="https://company.com"
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size</Label>
                      <Select
                        value={recruiterProfile.companySize}
                        onValueChange={(value) => setRecruiterProfile({ ...recruiterProfile, companySize: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STARTUP">Startup (1-10 employees)</SelectItem>
                          <SelectItem value="SMALL">Small (11-50 employees)</SelectItem>
                          <SelectItem value="MEDIUM">Medium (51-200 employees)</SelectItem>
                          <SelectItem value="LARGE">Large (200+ employees)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={recruiterProfile.industry}
                        onChange={(e) => setRecruiterProfile({ ...recruiterProfile, industry: e.target.value })}
                        placeholder="Technology, Finance, Healthcare, etc."
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      value={recruiterProfile.description}
                      onChange={(e) => setRecruiterProfile({ ...recruiterProfile, description: e.target.value })}
                      placeholder="Brief description about your company..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={isLoading} className="flex-1">
                      {isLoading ? "Saving..." : "Complete Profile & Continue"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole="RECRUITER" userName={user?.email || "Recruiter"} />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl mx-auto"
        >
          <Card className="backdrop-blur-sm bg-background/95">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Post a New Job</CardTitle>
              <CardDescription>Create a job posting to attract the best talent from campus</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Basic Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input id="jobTitle" name="jobTitle" placeholder="Software Engineering Intern" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select value={jobType} onValueChange={setJobType} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="internship">Internship</SelectItem>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="workMode">Work Mode</Label>
                      <Select value={workMode} onValueChange={setWorkMode} required>
                        <SelectTrigger>
                          <SelectValue placeholder="Select work mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on-site">On-site</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="location" name="location" placeholder="San Francisco, CA" className="pl-10" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stipend">Stipend/Salary</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="stipend" name="stipend" placeholder="$8,000/month or $120,000/year" className="pl-10" required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Job Description</h3>

                  <div className="space-y-2">
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      name="requirements"
                      placeholder="List the required skills, qualifications, and experience..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits & Perks</Label>
                    <Textarea
                      id="benefits"
                      name="benefits"
                      placeholder="Mention benefits, learning opportunities, mentorship, etc..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Applicant Filters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Target Applicants
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Eligible Courses</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select which courses are eligible for this position
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {courses.map((course) => (
                          <div key={course} className="flex items-center space-x-2">
                            <Checkbox
                              id={course}
                              checked={selectedCourses.includes(course)}
                              onCheckedChange={(checked) => handleCourseChange(course, checked as boolean)}
                            />
                            <Label htmlFor={course} className="text-sm font-normal">
                              {course}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Eligible Years</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Select which academic years can apply
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {years.map((year) => (
                          <div key={year} className="flex items-center space-x-2">
                            <Checkbox
                              id={year}
                              checked={selectedYears.includes(year)}
                              onCheckedChange={(checked) => handleYearChange(year, checked as boolean)}
                            />
                            <Label htmlFor={year} className="text-sm font-normal">
                              {year}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minCGPA">Minimum CGPA (Optional)</Label>
                      <Input
                        id="minCGPA"
                        name="minCGPA"
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        placeholder="7.5"
                        className="w-full md:w-48"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="deadline">Application Deadline</Label>
                      <Input id="deadline" name="deadline" type="date" required className="w-full md:w-48" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Posting Job..." : "Post Job"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
export default PostJobPage;