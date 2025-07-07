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
import { Navbar } from "@/components/navbar"
import { useToast } from "@/hooks/use-toast"
import { Briefcase, Mail, Phone, Building, Globe } from "lucide-react"

export default function RecruiterRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Mock registration
    setTimeout(() => {
      toast({
        title: "Registration Successful",
        description: "Welcome to CampusCogni! You can now start posting jobs.",
      })
      router.push("/recruiter/dashboard")
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
                    <Input id="firstName" placeholder="Jane" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Smith" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" placeholder="jane.smith@company.com" className="pl-10" required />
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
                  <Label htmlFor="company">Company Name</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="company" placeholder="Google Inc." className="pl-10" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Company Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="website" type="url" placeholder="https://www.google.com" className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Your Job Title</Label>
                  <Input id="jobTitle" placeholder="HR Manager" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-50 employees)</SelectItem>
                      <SelectItem value="small">Small (51-200 employees)</SelectItem>
                      <SelectItem value="medium">Medium (201-1000 employees)</SelectItem>
                      <SelectItem value="large">Large (1000+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select required>
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
                  <Textarea id="description" placeholder="Brief description of your company..." rows={4} />
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
