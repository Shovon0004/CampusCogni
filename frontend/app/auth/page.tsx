"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { GridBackground } from "@/components/grid-background"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import { Chrome, Mail, Lock, User, Briefcase } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<"student" | "recruiter">("student")

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      const redirectParam = searchParams.get("redirect")
      if (user.role === 'RECRUITER' && redirectParam === "post-job") {
        router.push('/recruiter/post-job')
      } else {
        router.push(user.role === 'STUDENT' ? '/student/dashboard' : '/recruiter/dashboard')
      }
      return
    }

    const roleParam = searchParams.get("role")
    if (roleParam === "recruiter") {
      setRole("recruiter")
    }

    // Check for registration success message
    const message = searchParams.get("message")
    if (message === "registration-success") {
      toast({
        title: "Registration Successful",
        description: "Please sign in with your new account.",
      })
    }
  }, [searchParams, user, router, toast])

  const handleGoogleLogin = async () => {
    // TODO: Implement Google OAuth with backend
    toast({
      title: "Feature Coming Soon",
      description: "Google login will be available soon. Please use email login for now.",
    })
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.target as HTMLFormElement)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      await login(email, password)
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      })
      
      // The useEffect will handle redirection based on user role
    } catch (error) {
      console.error('Login failed:', error)
      toast({
        title: "Login Failed",
        description: "Please check your email and password.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = () => {
    router.push(role === "student" ? "/student/register" : "/recruiter/register")
  }

  return (
    <div className="min-h-screen">
      <GridBackground />
      <FloatingNavbar />

      <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-xl bg-background/80 border-0 shadow-2xl">
            <CardHeader className="text-center pb-8">
              <motion.div
                className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {role === "student" ? (
                  <User className="w-8 h-8 text-primary" />
                ) : (
                  <Briefcase className="w-8 h-8 text-primary" />
                )}
              </motion.div>
              <CardTitle className="text-2xl font-bold">Welcome to CampusCogni</CardTitle>
              <CardDescription className="text-base">Sign in as a {role} to continue</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs value={role} onValueChange={(value) => setRole(value as "student" | "recruiter")}>
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger value="student" className="data-[state=active]:bg-background">
                    Student
                  </TabsTrigger>
                  <TabsTrigger value="recruiter" className="data-[state=active]:bg-background">
                    Recruiter
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={role} className="space-y-6 mt-8">
                  <Button
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                    className="w-full bg-background hover:bg-muted/50 text-foreground border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300"
                    variant="outline"
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="bg-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
                    </div>
                  </div>

                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="Enter your email"
                          className="pl-10 bg-background/50 border-border/50"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          placeholder="Enter your password"
                          className="pl-10 bg-background/50 border-border/50"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>

                  <div className="text-center text-sm">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <Button variant="link" className="p-0 text-primary" onClick={handleRegister}>
                      Sign up
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}
