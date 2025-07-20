"use client"

import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"

export default function CandidateSearchPage() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole={user?.role as "USER" | "RECRUITER" | "BOTH"} userName={user?.email || "Recruiter"} />
      <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-4">Candidate Search</h1>
        <p className="text-muted-foreground text-lg">This page will soon allow recruiters to search for candidates using AI-powered filters and chat. Stay tuned!</p>
      </div>
    </div>
  )
} 