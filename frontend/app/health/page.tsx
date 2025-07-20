"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function HealthCheck() {
  const [backendHealth, setBackendHealth] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/health`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setBackendHealth(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>System Health Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL}
          </div>
          
          <div className="flex items-center gap-2">
            <strong>Backend Status:</strong>
            {loading ? (
              <Badge variant="secondary">Checking...</Badge>
            ) : backendHealth ? (
              <Badge variant="default" className="bg-green-600">Online</Badge>
            ) : (
              <Badge variant="destructive">Offline</Badge>
            )}
          </div>

          {backendHealth && (
            <div>
              <strong>Backend Response:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                {JSON.stringify(backendHealth, null, 2)}
              </pre>
            </div>
          )}

          {error && (
            <div>
              <strong>Error:</strong>
              <div className="bg-red-100 text-red-800 p-2 rounded mt-2 text-sm">
                {error}
              </div>
            </div>
          )}

          <Button onClick={checkHealth} disabled={loading}>
            {loading ? 'Checking...' : 'Refresh Health Check'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
