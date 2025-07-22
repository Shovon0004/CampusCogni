"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ThreeHero } from "@/components/three-hero"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Footer } from "@/components/footer"
import { Users, Briefcase, TrendingUp, Shield, ArrowRight, Sparkles, Star } from "lucide-react"

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
  const features = [
    {
      icon: Users,
      title: "Smart Matching",
      description: "AI-powered matching between students and recruiters based on skills and requirements",
    },
    {
      icon: Briefcase,
      title: "Campus Focused",
      description: "Designed specifically for campus recruitment drives and college placements",
    },
    {
      icon: TrendingUp,
      title: "Real-time Analytics",
      description: "Track application progress and recruitment metrics in real-time",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Enterprise-grade security for all your recruitment data and communications",
    },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden relative">
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
                className="space-y-8"
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

                <motion.h1
                  className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.9]"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70">
                    Campus Recruitment
                  </span>
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                    Reimagined
                  </span>
                </motion.h1>

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
                      <Link href="/auth" className="flex items-center gap-2 group">
                        Join the Community
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

          {/* Features Section with Background Paths Animation */}
          <section className="container mx-auto px-4 py-20 relative">
            {/* Background Paths Animation moved here */}
            <div className="absolute inset-0 pointer-events-none">
              <FloatingPaths position={1} />
              <FloatingPaths position={-1} />
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16 relative z-10"
            >
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Why Choose CampusCogni?</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Built specifically for campus recruitment with features that matter most.
              </p>
            </motion.div>

            {/* Auto-sliding feature boxes */}
            <div className="relative overflow-hidden z-10">
              <motion.div
                className="flex gap-8"
                animate={{
                  x: [0, -100 * features.length],
                }}
                transition={{
                  duration: 20,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
                style={{ width: `${200 * features.length}%` }}
              >
                {/* Duplicate features for seamless loop */}
                {[...features, ...features].map((feature, index) => (
                  <motion.div
                    key={`${feature.title}-${index}`}
                    className="flex-shrink-0 w-80"
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 bg-background/60 backdrop-blur-xl shadow-lg">
                      <CardContent className="p-8 text-center">
                        <motion.div
                          className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center"
                          whileHover={{ rotate: 5, scale: 1.1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <feature.icon className="w-8 h-8 text-primary" />
                        </motion.div>
                        <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                        <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Static grid for mobile/fallback */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 md:hidden z-10 relative">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  className="group"
                >
                  <Card className="h-full hover:shadow-2xl transition-all duration-500 border-0 bg-background/60 backdrop-blur-xl shadow-lg">
                    <CardContent className="p-8 text-center">
                      <motion.div
                        className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                        whileHover={{ rotate: 5 }}
                      >
                        <feature.icon className="w-8 h-8 text-primary" />
                      </motion.div>
                      <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
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
                      <Link href="/auth" className="flex items-center gap-2">
                        Get Started Today
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
