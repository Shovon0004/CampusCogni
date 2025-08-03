"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThreeHero } from "@/components/three-hero"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Footer } from "@/components/footer"
import { FlipLink } from "@/components/flip-link"
import { CampusCogniFeatureDemo } from "@/components/ui/campus-cogni-feature-demo"
import { Users, Briefcase, TrendingUp, Shield, ArrowRight, Sparkles, Star } from "lucide-react"
import Marquee from "react-fast-marquee"
import { useAuth } from "@/contexts/AuthContext"

// Extract FloatingPaths component from KokonutUI
function FloatingPaths({ position }: { position: number }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }))

  return (
    <div className="absolute inset-0 pointer-events-none opacity-50 blur-[0.5px]">
      <svg className="w-full h-full text-slate-950 dark:text-white" viewBox="0 0 696 316" fill="none">
        <title>Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.08 + path.id * 0.02}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.2, 0.4, 0.2],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export default function HomePage() {
  const { user, loading } = useAuth()

  // Determine the appropriate dashboard link based on user role
  const getDashboardLink = () => {
    if (!user) return "/auth"
    
    if (user.role === "RECRUITER") return "/recruiter/dashboard"
    if (user.role === "BOTH") {
      // For BOTH role, check current preference or default to user dashboard
      // You could store last visited dashboard in localStorage or user preferences
      const lastDashboard = typeof window !== 'undefined' ? localStorage.getItem('lastDashboard') : null
      return lastDashboard || "/user/dashboard"
    }
    return "/user/dashboard" // Default for USER role
  }

  const getButtonText = () => {
    if (loading) return "Loading..."
    if (user) {
      if (user.role === "BOTH") return "Go to Dashboard"
      if (user.role === "RECRUITER") return "Go to Recruiter Dashboard"
      return "Go to Dashboard"
    }
    return "Join the Community"
  }

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Background Paths Animation restored to original position */}
      <div className="absolute inset-0 pointer-events-none">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>
      <div className="relative z-10 max-w-full">
        <FloatingNavbar />

        <main className="relative">
          {/* Hero Section */}
          <section className="container mx-auto px-4 py-20 md:py-32 max-w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-8rem)]">
              {/* Left side - Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="space-y-8 ml-0 md:ml-8 lg:ml-16 xl:ml-24"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium backdrop-blur-sm border border-primary/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Introducing CampusCogni
                  <Star className="w-3 h-3 fill-current" />
                </motion.div>

                <motion.div
                  className="flex flex-col space-y-4 py-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  style={{ overflow: 'visible' }}
                >
                  <div className="overflow-visible">
                    <FlipLink 
                      className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-100"
                    >
                      Campus Recruit
                    </FlipLink>
                  </div>
                  <div className="overflow-visible">
                    <FlipLink 
                      className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-primary"
                    >
                      Reimagined
                    </FlipLink>
                  </div>
                </motion.div>

                <motion.p
                  className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  Connect talented students with top recruiters through our intelligent platform designed for the modern
                  recruitment landscape.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      asChild
                      size="lg"
                      className="text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 border-0"
                    >
                      <Link href={getDashboardLink()} className="flex items-center gap-2 group">
                        {getButtonText()}
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-lg px-8 py-6 rounded-2xl border-2 hover:bg-muted/50 transition-all duration-300"
                    >
                      Learn More
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Right side - 3D Component */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="h-[500px] md:h-[600px] w-full max-h-[70vh] overflow-hidden"
              >
                <ThreeHero />
              </motion.div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 relative">
            <div className="container mx-auto px-4">
              <h2 className="text-4xl font-bold text-center mb-16">
                <span className="gradient-text">Powerful Features</span>
              </h2>
              <CampusCogniFeatureDemo />
            </div>
          </section>

          {/* CTA Section */}
          <section className="container mx-auto px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card className="max-w-4xl mx-auto border-0 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-xl shadow-2xl">
                <CardContent className="p-12">
                  <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Ready to Get Started?</h2>
                  <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                    Join thousands of students and recruiters building meaningful career connections.
                  </p>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      asChild
                      size="lg"
                      className="text-lg px-8 py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90"
                    >
                      <Link href={getDashboardLink()} className="flex items-center gap-2">
                        {user ? "Go to Dashboard" : "Get Started Today"}
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </section>
        </main>

        <Footer showFAQ={true} />
      </div>
    </div>
  )
}
