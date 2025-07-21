'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import { startBackendPing } from '@/lib/ping-service'

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Start the backend ping service when the app loads
    startBackendPing()
  }, [])

  return (
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>
        {children}
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  )
}
