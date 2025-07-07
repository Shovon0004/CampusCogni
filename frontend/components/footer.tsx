"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Mail, Phone, Github, Twitter, Linkedin, ArrowUp } from "lucide-react"

interface FooterProps {
  showFAQ?: boolean
}

export function Footer({ showFAQ = false }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const faqItems = [
    {
      question: "How does CampusCogni work?",
      answer:
        "CampusCogni connects students with recruiters through AI-powered matching based on skills, qualifications, and job requirements.",
    },
    {
      question: "Is CampusCogni free for students?",
      answer:
        "Yes, CampusCogni is completely free for students. We believe in making career opportunities accessible to everyone.",
    },
    {
      question: "How do I create a profile?",
      answer:
        "Simply sign up with your email or Google account, complete your profile with academic details, and start applying to jobs.",
    },
    {
      question: "Can I track my applications?",
      answer:
        "Yes, you can track all your applications, interview schedules, and application status in real-time through your dashboard.",
    },
  ]

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Security", href: "#security" },
      { name: "Integrations", href: "#integrations" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Careers", href: "/careers" },
      { name: "Blog", href: "/blog" },
      { name: "Press", href: "/press" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Us", href: "/contact" },
      { name: "Status", href: "/status" },
      { name: "Documentation", href: "/docs" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR", href: "/gdpr" },
    ],
  }

  return (
    <footer className="relative mt-20">
      {/* FAQ Section - Only on landing page */}
      {showFAQ && (
        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about CampusCogni
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full bg-background/60 backdrop-blur-xl border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8">
                    <h3 className="text-lg font-semibold mb-4">{item.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Main Footer */}
      <div className="bg-background/80 backdrop-blur-xl border-t border-border/50">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-6">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  <Briefcase className="h-8 w-8 text-primary" />
                </motion.div>
                <span className="font-bold text-2xl bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  CampusCogni
                </span>
              </Link>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Connecting talented students with top recruiters through intelligent campus recruitment platform.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="hover:bg-muted/50">
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Links Sections */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h3 className="font-semibold mb-4 capitalize">{category}</h3>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Separator className="my-12 bg-border/50" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm text-muted-foreground">
              <p>&copy; 2024 CampusCogni. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Mail className="h-3 w-3" />
                  <span>hello@campuscogni.com</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>+1 (555) 123-4567</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="icon" onClick={scrollToTop} className="mt-4 md:mt-0 hover:bg-muted/50">
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  )
}
