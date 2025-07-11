"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useToast } from "@/hooks/use-toast"
import { Briefcase, Mail, Phone, Building, Globe, User, Lock, Eye, EyeOff } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

export default function RecruiterRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, upgradeToRecruiter } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [companySize, setCompanySize] = useState("")
  const [industry, setIndustry] = useState("")

  // Check if user is already logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    
    // If user already has recruiter profile, redirect to dashboard
    if (user.role === 'RECRUITER' || user.role === 'BOTH') {
      router.push('/recruiter/dashboard')
      return
    }
  }, [user, router])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    website: '',
    jobTitle: '',
    description: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required",
        variant: "destructive"
      })
      return false
    }

    if (!formData.lastName.trim()) {
      toast({
        title: "Validation Error", 
        description: "Last name is required",
        variant: "destructive"
      })
      return false
    }

    if (!formData.company.trim()) {
      toast({
        title: "Validation Error",
        description: "Company name is required",
        variant: "destructive"
      })
      return false
    }

    if (!formData.jobTitle.trim()) {
      toast({
        title: "Validation Error",
        description: "Job title is required",
        variant: "destructive"
      })
      return false
    }

    if (!companySize) {
      toast({
        title: "Validation Error",
        description: "Please select company size",
        variant: "destructive"
      })
      return false
    }

    if (!industry) {
      toast({
        title: "Validation Error",
        description: "Please select industry",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const recruiterData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        company: formData.company,
        website: formData.website,
        jobTitle: formData.jobTitle,
        companySize: companySize,
        industry: industry,
        description: formData.description,
      }

      await upgradeToRecruiter(recruiterData)

      toast({
        title: "Profile Created Successfully",
        description: "Your recruiter profile has been created! You can now start posting jobs.",
      })
      
      router.push("/recruiter/dashboard")
    } catch (error) {
      console.error('Profile creation failed:', error)
      toast({
        title: "Profile Creation Failed",
        description: error instanceof Error ? error.message : "Please check your information and try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BackgroundPaths />
      <FloatingNavbar />

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
                <Briefcase className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Create Recruiter Profile</CardTitle>
              <CardDescription>Set up your recruiter profile to start posting jobs</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      name="firstName" 
                      placeholder="Jane" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      name="lastName" 
                      placeholder="Smith" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      placeholder="+1 (555) 123-4567" 
                      className="pl-10" 
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="company" 
                      name="company" 
                      placeholder="Google Inc." 
                      className="pl-10" 
                      value={formData.company}
                      onChange={handleInputChange}
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
                      name="website" 
                      type="url" 
                      placeholder="https://www.google.com" 
                      className="pl-10" 
                      value={formData.website}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Your Job Title</Label>
                  <Input 
                    id="jobTitle" 
                    name="jobTitle" 
                    placeholder="HR Manager" 
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STARTUP">Startup (1-50 employees)</SelectItem>
                      <SelectItem value="SMALL">Small (51-200 employees)</SelectItem>
                      <SelectItem value="MEDIUM">Medium (201-1000 employees)</SelectItem>
                      <SelectItem value="LARGE">Large (1000+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Company Description</Label>
                  <Textarea 
                    id="description" 
                    name="description" 
                    placeholder="Brief description of your company..." 
                    rows={4} 
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Profile..." : "Create Recruiter Profile"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
