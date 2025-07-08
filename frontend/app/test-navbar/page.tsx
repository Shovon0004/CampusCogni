"use client"

import { Button } from "@/components/ui/button"
import { FloatingNavbar } from "@/components/floating-navbar"
import Link from "next/link"
import { Briefcase } from "lucide-react"

export default function TestRecruiterNavbar() {
  return (
    <div className="min-h-screen">
      {/* Test with hardcoded recruiter role */}
      <FloatingNavbar userRole="recruiter" userName="Test Recruiter" />
      
      <div className="container mx-auto px-4 py-24">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Test Recruiter Navbar</h1>
          <p className="text-lg mb-8">
            This page tests the navbar with recruiter role. You should see a "Post Job" button in the navbar.
          </p>
          
          {/* Also add a standalone button for reference */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Standalone Post Job Button (for reference):</h2>
            <Button asChild variant="default" size="sm" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Link href="/recruiter/post-job" className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                Post Job
              </Link>
            </Button>
          </div>
          
          <div className="space-y-4">
            <p><strong>Expected:</strong> "Post Job" button should be visible in the navbar above</p>
            <p><strong>userRole:</strong> "recruiter"</p>
            <p><strong>userName:</strong> "Test Recruiter"</p>
          </div>
        </div>
      </div>
    </div>
  )
}
