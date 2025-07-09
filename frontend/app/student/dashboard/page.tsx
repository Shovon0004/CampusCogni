"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StudentDashboardRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to user dashboard
    router.replace('/user/dashboard')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  )
}
