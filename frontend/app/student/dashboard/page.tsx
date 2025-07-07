"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GridBackground } from "@/components/grid-background"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Footer } from "@/components/footer"
import { Search, Filter, MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, TrendingUp } from "lucide-react"

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: "Full-time" | "Internship" | "Part-time"
  stipend: string
  description: string
  requirements: string[]
  postedDate: string
  applied: boolean
  saved: boolean
}

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Software Engineering Intern",
    company: "Google",
    location: "Mountain View, CA",
    type: "Internship",
    stipend: "$8,000/month",
    description:
      "Join our team to work on cutting-edge technologies and make an impact on billions of users worldwide.",
    requirements: ["Computer Science", "3rd Year", "CGPA > 8.0", "JavaScript", "Python"],
    postedDate: "2 days ago",
    applied: false,
    saved: true,
  },
  {
    id: "2",
    title: "Frontend Developer",
    company: "Microsoft",
    location: "Seattle, WA",
    type: "Full-time",
    stipend: "$120,000/year",
    description: "Build amazing user experiences for Microsoft's flagship products.",
    requirements: ["Computer Science", "4th Year", "CGPA > 7.5", "React", "TypeScript"],
    postedDate: "1 week ago",
    applied: true,
    saved: false,
  },
  {
    id: "3",
    title: "Data Science Intern",
    company: "Netflix",
    location: "Los Gatos, CA",
    type: "Internship",
    stipend: "$7,500/month",
    description: "Work with massive datasets to improve recommendation algorithms.",
    requirements: ["Computer Science", "3rd Year", "CGPA > 8.5", "Python", "Machine Learning"],
    postedDate: "3 days ago",
    applied: false,
    saved: false,
  },
  {
    id: "4",
    title: "Mobile App Developer",
    company: "Uber",
    location: "San Francisco, CA",
    type: "Full-time",
    stipend: "$110,000/year",
    description: "Build mobile applications that connect millions of riders and drivers.",
    requirements: ["Computer Science", "4th Year", "CGPA > 7.0", "React Native", "Swift"],
    postedDate: "5 days ago",
    applied: false,
    saved: true,
  },
]

export default function StudentDashboard() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  const handleApply = (jobId: string) => {
    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, applied: true } : job)))
  }

  const handleSave = (jobId: string) => {
    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, saved: !job.saved } : job)))
  }

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || job.type === filterType
    return matchesSearch && matchesFilter
  })

  const stats = {
    totalJobs: jobs.length,
    appliedJobs: jobs.filter((job) => job.applied).length,
    savedJobs: jobs.filter((job) => job.saved).length,
    newJobs: jobs.filter((job) => job.postedDate.includes("day")).length,
  }

  return (
    <div className="min-h-screen">
      <GridBackground />
      <FloatingNavbar userRole="student" userName="John Doe" />

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
              Welcome back, <span className="text-primary">John!</span>
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover new opportunities tailored for your profile
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Available Jobs", value: stats.totalJobs, icon: TrendingUp, color: "text-primary" },
              { label: "Applied", value: stats.appliedJobs, icon: TrendingUp, color: "text-green-600" },
              { label: "Saved", value: stats.savedJobs, icon: Bookmark, color: "text-blue-600" },
              { label: "New This Week", value: stats.newJobs, icon: TrendingUp, color: "text-orange-600" },
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
                      placeholder="Search jobs, companies..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background/50 border-border/50"
                    />
                  </div>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-full md:w-[180px] bg-background/50 border-border/50">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Job Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Listings */}
          <div className="space-y-6">
            {filteredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
                whileHover={{ y: -4 }}
              >
                <Card className="hover:shadow-2xl transition-all duration-500 bg-background/60 backdrop-blur-xl border-0 shadow-lg group">
                  <CardContent className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                              {job.title}
                            </h3>
                            <p className="text-lg text-muted-foreground font-medium">{job.company}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSave(job.id)}
                            className="shrink-0 hover:bg-muted/50"
                          >
                            {job.saved ? (
                              <BookmarkCheck className="h-5 w-5 text-primary" />
                            ) : (
                              <Bookmark className="h-5 w-5" />
                            )}
                          </Button>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.stipend}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.postedDate}
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-4 leading-relaxed">{job.description}</p>

                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {job.type}
                          </Badge>
                          {job.requirements.slice(0, 3).map((req) => (
                            <Badge key={req} variant="outline" className="bg-background/50">
                              {req}
                            </Badge>
                          ))}
                          {job.requirements.length > 3 && (
                            <Badge variant="outline" className="bg-background/50">
                              +{job.requirements.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 lg:w-40">
                        <Button
                          onClick={() => handleApply(job.id)}
                          disabled={job.applied}
                          className="w-full shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          {job.applied ? "Applied" : "Apply Now"}
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full bg-background/50 hover:bg-background/80 border-border/50"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No jobs found</h3>
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
