"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GridBackground } from "@/components/grid-background"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Footer } from "@/components/footer"
import { Plus, Users, Eye, Download, MessageSquare, Calendar, GraduationCap } from "lucide-react"
import Link from "next/link"

interface JobPosting {
  id: string
  title: string
  type: "Full-time" | "Internship" | "Part-time"
  location: string
  stipend: string
  applicants: number
  views: number
  status: "Active" | "Closed" | "Draft"
  postedDate: string
  colleges: string[]
}

interface CollegeData {
  name: string
  totalStudents: number
  activeApplications: number
  averageCGPA: number
  topCourses: string[]
}

const mockJobs: JobPosting[] = [
  {
    id: "1",
    title: "Software Engineering Intern",
    type: "Internship",
    location: "Mountain View, CA",
    stipend: "$8,000/month",
    applicants: 45,
    views: 234,
    status: "Active",
    postedDate: "2024-01-15",
    colleges: ["MIT", "Stanford University", "UC Berkeley"],
  },
  {
    id: "2",
    title: "Frontend Developer",
    type: "Full-time",
    location: "Seattle, WA",
    stipend: "$120,000/year",
    applicants: 23,
    views: 156,
    status: "Active",
    postedDate: "2024-01-10",
    colleges: ["Harvard University", "MIT", "Stanford University"],
  },
  {
    id: "3",
    title: "Data Science Intern",
    type: "Internship",
    location: "Los Gatos, CA",
    stipend: "$7,500/month",
    applicants: 67,
    views: 312,
    status: "Closed",
    postedDate: "2024-01-05",
    colleges: ["UC Berkeley", "Stanford University", "Caltech"],
  },
]

const collegeDatabase: Record<string, CollegeData> = {
  MIT: {
    name: "Massachusetts Institute of Technology",
    totalStudents: 1250,
    activeApplications: 89,
    averageCGPA: 8.7,
    topCourses: ["Computer Science", "Electrical Engineering", "Mechanical Engineering"],
  },
  "Stanford University": {
    name: "Stanford University",
    totalStudents: 1100,
    activeApplications: 76,
    averageCGPA: 8.9,
    topCourses: ["Computer Science", "Data Science", "Business Administration"],
  },
  "UC Berkeley": {
    name: "University of California, Berkeley",
    totalStudents: 1400,
    activeApplications: 102,
    averageCGPA: 8.5,
    topCourses: ["Computer Science", "Engineering", "Data Science"],
  },
  "Harvard University": {
    name: "Harvard University",
    totalStudents: 980,
    activeApplications: 65,
    averageCGPA: 9.1,
    topCourses: ["Computer Science", "Business Administration", "Economics"],
  },
  Caltech: {
    name: "California Institute of Technology",
    totalStudents: 650,
    activeApplications: 34,
    averageCGPA: 8.8,
    topCourses: ["Computer Science", "Physics", "Engineering"],
  },
}

export default function RecruiterDashboard() {
  const [jobs] = useState<JobPosting[]>(mockJobs)
  const [selectedCollege, setSelectedCollege] = useState<string>("all")

  const colleges = Object.keys(collegeDatabase)
  const selectedCollegeData = selectedCollege !== "all" ? collegeDatabase[selectedCollege] : null

  // Filter jobs based on selected college
  const filteredJobs = selectedCollege === "all" ? jobs : jobs.filter((job) => job.colleges.includes(selectedCollege))

  // Calculate stats based on filtered data
  const stats = {
    totalJobs: filteredJobs.length,
    activeJobs: filteredJobs.filter((job) => job.status === "Active").length,
    totalApplicants: filteredJobs.reduce((sum, job) => sum + job.applicants, 0),
    totalViews: filteredJobs.reduce((sum, job) => sum + job.views, 0),
  }

  return (
    <div className="min-h-screen">
      <GridBackground />
      <FloatingNavbar userRole="recruiter" userName="Jane Smith" />

      <div className="container mx-auto px-4 py-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          {/* Header with College Selection */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Recruiter Dashboard</h1>
              <p className="text-xl text-muted-foreground">Manage your job postings and track applications</p>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-6 md:mt-0">
              <Select value={selectedCollege} onValueChange={setSelectedCollege}>
                <SelectTrigger className="w-full md:w-[250px] bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Select College" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colleges</SelectItem>
                  {colleges.map((college) => (
                    <SelectItem key={college} value={college}>
                      {college}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button asChild>
                <Link href="/recruiter/post-job">
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Job
                </Link>
              </Button>
            </div>
          </div>

          {/* College-specific Information */}
          {selectedCollegeData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    {selectedCollegeData.name}
                  </CardTitle>
                  <CardDescription>College-specific insights and statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{selectedCollegeData.totalStudents}</div>
                      <div className="text-sm text-muted-foreground">Total Students</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedCollegeData.activeApplications}</div>
                      <div className="text-sm text-muted-foreground">Active Applications</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedCollegeData.averageCGPA}</div>
                      <div className="text-sm text-muted-foreground">Average CGPA</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{selectedCollegeData.topCourses.length}</div>
                      <div className="text-sm text-muted-foreground">Top Courses</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-sm font-medium mb-2">Popular Courses:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCollegeData.topCourses.map((course) => (
                        <Badge key={course} variant="secondary" className="bg-primary/10 text-primary">
                          {course}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.totalJobs}</div>
                <div className="text-sm text-muted-foreground">
                  {selectedCollege === "all" ? "Total Jobs" : `Jobs for ${selectedCollege}`}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeJobs}</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalApplicants}</div>
                <div className="text-sm text-muted-foreground">Total Applicants</div>
              </CardContent>
            </Card>
            <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalViews}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="mb-8 bg-background/60 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest updates {selectedCollege !== "all" ? `from ${selectedCollege}` : "on your job postings"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New application received</p>
                    <p className="text-xs text-muted-foreground">
                      Software Engineering Intern {selectedCollege !== "all" ? `from ${selectedCollege}` : ""} - 2 hours
                      ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Job posting viewed 15 times</p>
                    <p className="text-xs text-muted-foreground">Frontend Developer - 4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Interview scheduled</p>
                    <p className="text-xs text-muted-foreground">Data Science Intern - Yesterday</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Postings */}
          <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Your Job Postings</CardTitle>
              <CardDescription>
                {selectedCollege === "all"
                  ? "Manage and track your active job listings"
                  : `Job listings available to ${selectedCollege} students`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredJobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-background/40"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold">{job.title}</h3>
                          <Badge
                            variant={
                              job.status === "Active" ? "default" : job.status === "Closed" ? "secondary" : "outline"
                            }
                          >
                            {job.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>{job.type}</span>
                          <span>{job.location}</span>
                          <span>{job.stipend}</span>
                          <span>Posted: {new Date(job.postedDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm mb-2">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{job.applicants} applicants</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{job.views} views</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {job.colleges.map((college) => (
                            <Badge key={college} variant="outline" className="text-xs">
                              {college}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/recruiter/applications?job=${job.id}`}>
                            <Users className="h-4 w-4 mr-2" />
                            View Applicants
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download Resumes
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredJobs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {selectedCollege === "all"
                    ? "No job postings found."
                    : `No job postings available for ${selectedCollege} students.`}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
