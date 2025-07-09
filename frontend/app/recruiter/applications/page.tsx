"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GridBackground } from "@/components/grid-background"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Footer } from "@/components/footer"
import {
  Search,
  Filter,
  Download,
  MessageSquare,
  Calendar,
  Star,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
} from "lucide-react"

interface Applicant {
  id: string
  name: string
  email: string
  phone: string
  college: string
  course: string
  year: string
  cgpa: string
  jobTitle: string
  appliedDate: string
  status: "New" | "Reviewed" | "Shortlisted" | "Interview Scheduled" | "Rejected" | "Hired"
  avatar?: string
  skills: string[]
  experience?: string
  location: string
}

const mockApplicants: Applicant[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@mit.edu",
    phone: "+1 (555) 123-4567",
    college: "MIT",
    course: "Computer Science",
    year: "3rd Year",
    cgpa: "8.5",
    jobTitle: "Software Engineering Intern",
    appliedDate: "2024-01-15",
    status: "Shortlisted",
    skills: ["JavaScript", "Python", "React", "Node.js"],
    experience: "2 internships",
    location: "Boston, MA",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@stanford.edu",
    phone: "+1 (555) 234-5678",
    college: "Stanford University",
    course: "Computer Science",
    year: "4th Year",
    cgpa: "9.2",
    jobTitle: "Frontend Developer",
    appliedDate: "2024-01-12",
    status: "Interview Scheduled",
    skills: ["React", "TypeScript", "CSS", "Figma"],
    experience: "3 internships",
    location: "Palo Alto, CA",
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.j@berkeley.edu",
    phone: "+1 (555) 345-6789",
    college: "UC Berkeley",
    course: "Data Science",
    year: "3rd Year",
    cgpa: "8.8",
    jobTitle: "Data Science Intern",
    appliedDate: "2024-01-10",
    status: "New",
    skills: ["Python", "Machine Learning", "SQL", "TensorFlow"],
    location: "Berkeley, CA",
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.w@harvard.edu",
    phone: "+1 (555) 456-7890",
    college: "Harvard University",
    course: "Computer Science",
    year: "4th Year",
    cgpa: "9.0",
    jobTitle: "Software Engineering Intern",
    appliedDate: "2024-01-08",
    status: "Reviewed",
    skills: ["Java", "Spring", "AWS", "Docker"],
    experience: "1 internship",
    location: "Cambridge, MA",
  },
]

export default function RecruiterApplicationsPage() {
  const [applicants] = useState<Applicant[]>(mockApplicants)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterJob, setFilterJob] = useState<string>("all")

  const filteredApplicants = applicants.filter((applicant) => {
    const matchesSearch =
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.college.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.course.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || applicant.status === filterStatus
    const matchesJob = filterJob === "all" || applicant.jobTitle === filterJob
    return matchesSearch && matchesStatus && matchesJob
  })

  const getStatusColor = (status: Applicant["status"]) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "Reviewed":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case "Shortlisted":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case "Interview Scheduled":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300"
      case "Hired":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "Rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const stats = {
    total: applicants.length,
    new: applicants.filter((app) => app.status === "New").length,
    shortlisted: applicants.filter((app) => app.status === "Shortlisted").length,
    interviewed: applicants.filter((app) => app.status === "Interview Scheduled").length,
  }

  const uniqueJobs = [...new Set(applicants.map((app) => app.jobTitle))]

  return (
    <div className="min-h-screen">
      <GridBackground />
      <FloatingNavbar userRole="RECRUITER" userName="Jane Smith" />

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
              Applications Management
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Review and manage candidate applications
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Total Applications", value: stats.total, color: "text-primary" },
              { label: "New Applications", value: stats.new, color: "text-blue-600" },
              { label: "Shortlisted", value: stats.shortlisted, color: "text-purple-600" },
              { label: "Interviews", value: stats.interviewed, color: "text-orange-600" },
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
                      placeholder="Search applicants, colleges, courses..."
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
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Reviewed">Reviewed</SelectItem>
                      <SelectItem value="Shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                      <SelectItem value="Hired">Hired</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterJob} onValueChange={setFilterJob}>
                    <SelectTrigger className="w-full md:w-[200px] bg-background/50 border-border/50">
                      <SelectValue placeholder="Filter by job" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jobs</SelectItem>
                      {uniqueJobs.map((job) => (
                        <SelectItem key={job} value={job}>
                          {job}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Applications List */}
          <div className="space-y-6">
            {filteredApplicants.map((applicant, index) => (
              <motion.div
                key={applicant.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="hover:shadow-2xl transition-all duration-500 bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row gap-6">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={applicant.avatar || "/placeholder.svg"} alt={applicant.name} />
                          <AvatarFallback className="text-lg bg-primary/10 text-primary">
                            {applicant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{applicant.name}</h3>
                              <p className="text-muted-foreground font-medium">{applicant.jobTitle}</p>
                            </div>
                            <Badge className={`${getStatusColor(applicant.status)} border-0 font-medium`}>
                              {applicant.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                                <span>{applicant.college}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-muted-foreground" />
                                <span>
                                  {applicant.course} • {applicant.year}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{applicant.location}</span>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{applicant.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{applicant.phone}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">CGPA:</span>
                                <span className="font-medium text-primary">{applicant.cgpa}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground mb-2">Skills:</p>
                            <div className="flex flex-wrap gap-2">
                              {applicant.skills.map((skill) => (
                                <Badge key={skill} variant="outline" className="bg-background/50">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
                            {applicant.experience && ` • ${applicant.experience}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:w-48">
                        <Button className="w-full shadow-lg hover:shadow-xl transition-all duration-300">
                          View Profile
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-background/50 hover:bg-background/80 border-border/50"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download CV
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-background/50 hover:bg-background/80 border-border/50"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-background/50 hover:bg-background/80 border-border/50"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredApplicants.length === 0 && (
            <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No applications found</h3>
                <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
