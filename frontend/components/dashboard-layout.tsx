'use client'

import { memo } from 'react'
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: "USER" | "RECRUITER" | "BOTH" | null
  userName?: string
}

export const DashboardLayout = memo(function DashboardLayout({ 
  children, 
  userRole, 
  userName 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole={userRole} userName={userName || "User"} />
      
      <div className="container mx-auto px-4 py-24">
        {children}
      </div>
    </div>
  )
})

DashboardLayout.displayName = 'DashboardLayout'
