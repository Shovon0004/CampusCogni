"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { GridBackground } from "@/components/grid-background"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Footer } from "@/components/footer"
import { useToast } from "@/hooks/use-toast"
import { Chrome, Mail, Lock, User } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

function AuthPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { login, user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if there's cached auth data but user is null (indicates validation failed)
    const cachedToken = localStorage.getItem('token')
    const cachedUserData = localStorage.getItem('userData')
    
    if (cachedToken && cachedUserData && !user) {
      toast({
        title: "Session Expired",
        description: "Your previous session has expired. Please sign in again.",
        variant: "destructive"
      })
      // Clear any remaining cached data
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
    }
    
    // Redirect if already logged in
    if (user) {
      const redirectParam = searchParams.get("redirect")
      if (user.role === 'RECRUITER' && redirectParam === "post-job") {
        router.push('/recruiter/post-job')
      } else {
        router.push(user.role === 'USER' ? '/user/dashboard' : '/recruiter/dashboard')
      }
      return
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
    router.push("/user/register")
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
                <User className="w-8 h-8 text-primary" />
              </motion.div>
              <CardTitle className="text-2xl font-bold">Welcome to CampusCogni</CardTitle>
              <CardDescription className="text-base">Sign in to continue</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
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
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </div>
  )
}

// Loading component for Suspense fallback
function AuthPageLoading() {
  return (
    <div className="min-h-screen">
      <GridBackground />
      <FloatingNavbar />
      <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="backdrop-blur-xl bg-background/80 border-0 shadow-2xl rounded-xl p-8 animate-pulse">
            <div className="text-center pb-8">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10" />
              <div className="h-8 bg-muted rounded mb-2" />
              <div className="h-4 bg-muted rounded w-2/3 mx-auto" />
            </div>
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthPageLoading />}>
      <AuthPageContent />
    </Suspense>
  )
}
