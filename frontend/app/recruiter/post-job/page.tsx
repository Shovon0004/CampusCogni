"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { BackgroundPaths } from "@/components/background-paths"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import { Briefcase, MapPin, DollarSign, Users, GraduationCap } from "lucide-react"

export default function PostJobPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])

  const courses = [
    "Computer Science",
    "Electronics & Communication",
    "Mechanical Engineering",
    "Civil Engineering",
    "MBA",
    "Other",
  ]

  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year", "Graduate"]

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

    // Mock job posting
    setTimeout(() => {
      toast({
        title: "Job Posted Successfully!",
        description: "Your job posting is now live and visible to students.",
      })
      router.push("/recruiter/dashboard")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <BackgroundPaths />
      <Navbar userRole="recruiter" userName="Jane Smith" />

      <div className="container mx-auto px-4 py-8">
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
                    <Input id="jobTitle" placeholder="Software Engineering Intern" required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select required>
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
                      <Select required>
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
                        <Input id="location" placeholder="San Francisco, CA" className="pl-10" required />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="stipend">Stipend/Salary</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="stipend" placeholder="$8,000/month or $120,000/year" className="pl-10" required />
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
                      placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                      rows={6}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements</Label>
                    <Textarea
                      id="requirements"
                      placeholder="List the required skills, qualifications, and experience..."
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="benefits">Benefits & Perks</Label>
                    <Textarea
                      id="benefits"
                      placeholder="Mention benefits, learning opportunities, mentorship, etc..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Student Filters */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Target Students
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
                            <Label htmlFor={course} className="text-sm">
                              {course}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Eligible Years</Label>
                      <p className="text-sm text-muted-foreground mb-3">Select which academic years can apply</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {years.map((year) => (
                          <div key={year} className="flex items-center space-x-2">
                            <Checkbox
                              id={year}
                              checked={selectedYears.includes(year)}
                              onCheckedChange={(checked) => handleYearChange(year, checked as boolean)}
                            />
                            <Label htmlFor={year} className="text-sm">
                              {year}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minCGPA">Minimum CGPA</Label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="minCGPA"
                            type="number"
                            step="0.1"
                            min="0"
                            max="10"
                            placeholder="7.0"
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="applicationDeadline">Application Deadline</Label>
                        <Input id="applicationDeadline" type="date" required />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Additional Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="applicationProcess">Application Process</Label>
                    <Textarea
                      id="applicationProcess"
                      placeholder="Describe the application and interview process..."
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input id="contactEmail" type="email" placeholder="hr@company.com" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? "Posting Job..." : "Post Job"}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 bg-transparent">
                    Save as Draft
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
