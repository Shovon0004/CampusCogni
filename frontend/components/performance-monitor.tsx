'use client'

import { useEffect } from 'react'

interface PerformanceMonitorProps {
  pageName: string
  onLoadComplete?: (loadTime: number) => void
}

export function PerformanceMonitor({ pageName, onLoadComplete }: PerformanceMonitorProps) {
  useEffect(() => {
    const startTime = performance.now()
    
    // Mark when the page is fully loaded
    const handleLoad = () => {
      const loadTime = performance.now() - startTime
      console.log(`📊 ${pageName} loaded in ${loadTime.toFixed(2)}ms`)
      onLoadComplete?.(loadTime)
    }

    // Track when page is interactive
    if (document.readyState === 'complete') {
      handleLoad()
    } else {
      window.addEventListener('load', handleLoad)
    }

    return () => {
      window.removeEventListener('load', handleLoad)
    }
  }, [pageName, onLoadComplete])

  return null
}

// Hook for measuring specific operations
export function usePerformanceMeasure(operationName: string) {
  const startMeasure = () => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      console.log(`⏱️ ${operationName} took ${duration.toFixed(2)}ms`)
      return duration
    }
  }

  return { startMeasure }
}
