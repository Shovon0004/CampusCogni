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
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useToast } from "@/hooks/use-toast"
import { Briefcase, Mail, Phone, Building, Globe } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function RecruiterRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [companySize, setCompanySize] = useState("")
  const [industry, setIndustry] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      company: formData.get("company"),
      website: formData.get("website"),
      jobTitle: formData.get("jobTitle"),
      companySize,
      industry,
      description: formData.get("description"),
      password: formData.get("password") || undefined, // add password if needed
    }
    try {
      await apiClient.registerRecruiter(data)
      toast({
        title: "Registration Successful",
        description: "Welcome to CampusCogni! You can now start posting jobs.",
      })
      router.push("/recruiter/dashboard")
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong.",
        variant: "destructive",
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
              <CardTitle className="text-2xl">Recruiter Registration</CardTitle>
              <CardDescription>Create your recruiter profile to start posting jobs</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" placeholder="Jane" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" placeholder="Smith" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" name="email" type="email" placeholder="jane.smith@company.com" className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 123-4567" className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="company" name="company" placeholder="Google Inc." className="pl-10" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Company Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="website" name="website" type="url" placeholder="https://www.google.com" className="pl-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Your Job Title</Label>
                  <Input id="jobTitle" name="jobTitle" placeholder="HR Manager" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select required value={companySize} onValueChange={setCompanySize} name="companySize">
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
                  <Select required value={industry} onValueChange={setIndustry} name="industry">
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
                  <Textarea id="description" name="description" placeholder="Brief description of your company..." rows={4} />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Creating Account..." : "Create Recruiter Account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
