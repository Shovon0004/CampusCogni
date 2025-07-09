"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, GraduationCap, BookOpen } from "lucide-react"

export default function UserRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [course, setCourse] = useState("")
  const [year, setYear] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const userData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        phone: formData.get('phone') as string,
        college: formData.get('college') as string,
        course: course,
        year: year,
        cgpa: parseFloat(formData.get('cgpa') as string),
        bio: formData.get('bio') as string,
      }

      // For demo purposes, just simulate registration
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Registration Successful",
        description: "Welcome to CampusCogni! Please sign in with your new account.",
      })
      
      router.push("/auth?message=registration-success")
    } catch (error) {
      console.error('Registration failed:', error)
      toast({
        title: "Registration Failed",
        description: "Please check your information and try again.",
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
                <User className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">User Registration</CardTitle>
              <CardDescription>Create your profile to get started with job searching</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" name="firstName" placeholder="John" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" name="lastName" placeholder="Doe" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.doe@university.edu"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" placeholder="Enter a strong password" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      name="phone"
                      placeholder="+1 (555) 123-4567"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="college">College/University</Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="college"
                      name="college"
                      placeholder="University of Technology"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Course/Major</Label>
                    <Select value={course} onValueChange={setCourse} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="computer-science">Computer Science</SelectItem>
                        <SelectItem value="electronics-communication">Electronics & Communication</SelectItem>
                        <SelectItem value="mechanical-engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="civil-engineering">Civil Engineering</SelectItem>
                        <SelectItem value="electrical-engineering">Electrical Engineering</SelectItem>
                        <SelectItem value="information-technology">Information Technology</SelectItem>
                        <SelectItem value="mba">MBA</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Academic Year</Label>
                    <Select value={year} onValueChange={setYear} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st-year">1st Year</SelectItem>
                        <SelectItem value="2nd-year">2nd Year</SelectItem>
                        <SelectItem value="3rd-year">3rd Year</SelectItem>
                        <SelectItem value="4th-year">4th Year</SelectItem>
                        <SelectItem value="graduate">Graduate</SelectItem>
                        <SelectItem value="postgraduate">Postgraduate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA/GPA</Label>
                  <Input
                    id="cgpa"
                    name="cgpa"
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    placeholder="8.5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (Optional)</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us a bit about yourself, your interests, and career goals..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <>
                      <BookOpen className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <a href="/auth" className="text-primary hover:underline">
                    Sign in
                  </a>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
