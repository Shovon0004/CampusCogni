"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

export default function StudentCVBuilderRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to user CV builder
    router.replace('/user/cv-builder')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md">
        <Skeleton className="h-4 w-[250px] mx-auto" />
        <Skeleton className="h-4 w-[200px] mx-auto" />
        <div className="flex items-center justify-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        </div>
      </div>
    </div>
  )
}
