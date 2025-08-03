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
import { Progress } from "@/components/ui/progress"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useToast } from "@/hooks/use-toast"
import { Briefcase, Mail, Phone, Building, Globe, User, Lock, Eye, EyeOff, ChevronLeft, ChevronRight, Check } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/AuthContext"

interface RegistrationStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
}

const registrationSteps: RegistrationStep[] = [
  {
    id: "personal",
    title: "Personal Information",
    description: "Tell us about yourself",
    icon: <User className="w-5 h-5" />
  },
  {
    id: "company",
    title: "Company Details",
    description: "Information about your organization",
    icon: <Building className="w-5 h-5" />
  },
  {
    id: "role",
    title: "Your Role",
    description: "Your position and responsibilities",
    icon: <Briefcase className="w-5 h-5" />
  },
  {
    id: "additional",
    title: "Additional Info",
    description: "Company size, industry, and description",
    icon: <Globe className="w-5 h-5" />
  }
]

export default function RecruiterRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, upgradeToRecruiter } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
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

  const progress = ((currentStep + 1) / registrationSteps.length) * 100

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const validateCurrentStep = () => {
    const step = registrationSteps[currentStep]
    
    switch (step.id) {
      case "personal":
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
        break
      
      case "company":
        if (!formData.company.trim()) {
          toast({
            title: "Validation Error",
            description: "Company name is required",
            variant: "destructive"
          })
          return false
        }
        break
      
      case "role":
        if (!formData.jobTitle.trim()) {
          toast({
            title: "Validation Error",
            description: "Job title is required",
            variant: "destructive"
          })
          return false
        }
        break
      
      case "additional":
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
        break
    }
    
    return true
  }

  const handleNext = () => {
    if (!validateCurrentStep()) {
      return
    }
    
    if (currentStep < registrationSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
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

  const renderStepContent = () => {
    const step = registrationSteps[currentStep]

    switch (step.id) {
      case "personal":
        return (
          <div className="space-y-6">
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
          </div>
        )

      case "company":
        return (
          <div className="space-y-6">
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
              <Label htmlFor="website">Company Website (Optional)</Label>
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
          </div>
        )

      case "role":
        return (
          <div className="space-y-6">
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
          </div>
        )

      case "additional":
        return (
          <div className="space-y-6">
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
              <Label htmlFor="description">Company Description (Optional)</Label>
              <Textarea 
                id="description" 
                name="description" 
                placeholder="Brief description of your company..." 
                rows={4} 
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BackgroundPaths />
      <FloatingNavbar />

      <div className="container mx-auto px-4 py-8 pt-24">
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
              
              {/* Progress Bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Step {currentStep + 1} of {registrationSteps.length}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Step Indicators */}
              <div className="flex justify-between mt-4">
                {registrationSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex flex-col items-center space-y-2 ${
                      index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors ${
                        index < currentStep
                          ? 'bg-primary border-primary text-primary-foreground'
                          : index === currentStep
                          ? 'border-primary text-primary'
                          : 'border-muted-foreground'
                      }`}
                    >
                      {index < currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.icon
                      )}
                    </div>
                    <span className="text-xs font-medium hidden sm:block">{step.title}</span>
                  </div>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {/* Current Step Header */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{registrationSteps[currentStep].title}</h3>
                  <p className="text-sm text-muted-foreground">{registrationSteps[currentStep].description}</p>
                </div>

                {/* Step Content */}
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStepContent()}
                </motion.div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>

                  {currentStep === registrationSteps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="flex items-center space-x-2"
                    >
                      <span>{isLoading ? "Creating Profile..." : "Create Profile"}</span>
                      <Check className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="flex items-center space-x-2"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
