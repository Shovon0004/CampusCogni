"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GridBackground } from "@/components/grid-background"
import { FloatingNavbar } from "@/components/floating-navbar"
import { Footer } from "@/components/footer"
import { Users, Briefcase, TrendingUp, Shield, ArrowRight, Sparkles, Star } from "lucide-react"

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
    <div className="min-h-screen">
      <GridBackground />
      <FloatingNavbar />

      <main className="relative pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 backdrop-blur-sm border border-primary/20"
              >
                <Sparkles className="w-4 h-4" />
                Introducing CampusCogni
                <Star className="w-3 h-3 fill-current" />
              </motion.div>

              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 tracking-tight leading-[0.9]"
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
                className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Connect talented students with top recruiters through our intelligent platform designed for the modern
                recruitment landscape.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20"
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
                    <Link href="/auth?role=student" className="flex items-center gap-2 group">
                      Join as Student
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-lg px-8 py-6 rounded-2xl bg-background/50 backdrop-blur-sm border-2 border-border/50 hover:bg-background/80 hover:border-border transition-all duration-300"
                  >
                    <Link href="/auth?role=recruiter">Join as Recruiter</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section with Auto-sliding Animation */}
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Why Choose CampusCogni?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Built specifically for campus recruitment with features that matter most.
            </p>
          </motion.div>

          {/* Auto-sliding feature boxes */}
          <div className="relative overflow-hidden">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-16 md:hidden">
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
  )
}
