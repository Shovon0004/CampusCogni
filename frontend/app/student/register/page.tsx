"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackgroundPaths } from "@/components/background-paths"
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import { Upload, User, Mail, Phone, FileText } from "lucide-react"

export default function StudentRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [resume, setResume] = useState<string | null>(null)

  const handleFileUpload = (type: "photo" | "resume", file: File) => {
    // Mock file upload
    const fileName = file.name
    if (type === "photo") {
      setProfilePhoto(fileName)
    } else {
      setResume(fileName)
    }
    toast({
      title: "File uploaded successfully",
      description: `${fileName} has been uploaded.`,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock registration
    setTimeout(() => {
      toast({
        title: "Registration Successful",
        description: "Welcome to CampusCogni! Let's build your CV.",
      })
      router.push("/student/cv-builder")
    }, 2000)
  }

  return (
    <div className="min-h-screen bg-background">
      <BackgroundPaths />
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="backdrop-blur-sm bg-background/95">
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Student Registration</CardTitle>
              <CardDescription>Create your student profile to get started</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Doe" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="john.doe@college.edu" className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College/University</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your college" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mit">MIT</SelectItem>
                      <SelectItem value="stanford">Stanford University</SelectItem>
                      <SelectItem value="harvard">Harvard University</SelectItem>
                      <SelectItem value="berkeley">UC Berkeley</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cse">Computer Science</SelectItem>
                        <SelectItem value="ece">Electronics & Communication</SelectItem>
                        <SelectItem value="me">Mechanical Engineering</SelectItem>
                        <SelectItem value="ce">Civil Engineering</SelectItem>
                        <SelectItem value="mba">MBA</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Year</SelectItem>
                        <SelectItem value="2">2nd Year</SelectItem>
                        <SelectItem value="3">3rd Year</SelectItem>
                        <SelectItem value="4">4th Year</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA</Label>
                  <Input id="cgpa" type="number" step="0.01" min="0" max="10" placeholder="8.5" required />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Profile Photo</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload("photo", file)
                        }}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label htmlFor="photo-upload" className="cursor-pointer">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {profilePhoto ? profilePhoto : "Click to upload profile photo"}
                        </p>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Resume</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload("resume", file)
                        }}
                        className="hidden"
                        id="resume-upload"
                      />
                      <label htmlFor="resume-upload" className="cursor-pointer">
                        <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          {resume ? resume : "Click to upload resume (PDF, DOC, DOCX)"}
                        </p>
                      </label>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
