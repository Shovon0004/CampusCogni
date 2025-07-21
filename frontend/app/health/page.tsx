"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getApiUrl, getBaseUrl } from '@/lib/config'

export default function HealthCheck() {
  const [backendHealth, setBackendHealth] = useState<any>(null)
  const [envCheck, setEnvCheck] = useState<any>(null)
  const [testRegistration, setTestRegistration] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Test registration data
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [testPassword, setTestPassword] = useState('testpassword123')

  const apiUrl = getBaseUrl()
  const currentEnvironment = process.env.NODE_ENV || 'development'
  const expectedApiUrl = getApiUrl()

  const checkHealth = async () => {
    setLoading(true)
    setError(null)
    
    try {
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

  const checkEnvironment = async () => {
    try {
      const response = await fetch(`${apiUrl}/debug/env`)
      if (response.ok) {
        const data = await response.json()
        setEnvCheck(data)
      }
    } catch (err) {
      console.error('Environment check failed:', err)
    }
  }

  const testRegisterEndpoint = async () => {
    try {
      const response = await fetch(`${apiUrl}/debug/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: testEmail,
          password: testPassword,
          role: 'USER',
          firstName: 'Test',
          lastName: 'User',
          college: 'Test College',
          course: 'Computer Science',
          year: '2024'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setTestRegistration(data)
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (err: any) {
      setTestRegistration({ error: err.message })
    }
  }

  useEffect(() => {
    checkHealth()
    checkEnvironment()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Frontend Environment:</strong> 
              <Badge variant={currentEnvironment === 'production' ? 'default' : 'secondary'} className="ml-2">
                {currentEnvironment}
              </Badge>
            </div>
            <div>
              <strong>Expected API URL:</strong> 
              <code className="bg-gray-100 px-2 py-1 rounded text-sm ml-2">
                {expectedApiUrl}
              </code>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <strong>⚠️ If you see localhost:5000 in production:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
              <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
              <li>Add: <code>NEXT_PUBLIC_API_URL = https://campuscogni.onrender.com/api</code></li>
              <li>Redeploy your Vercel app</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Health Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

      {envCheck && (
        <Card>
          <CardHeader>
            <CardTitle>Backend Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-2 rounded text-sm">
              {JSON.stringify(envCheck, null, 2)}
            </pre>
            <Button onClick={checkEnvironment} className="mt-2" variant="outline">
              Refresh Environment Check
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Test Registration Endpoint</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="testEmail">Test Email</Label>
              <Input
                id="testEmail"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="testPassword">Test Password</Label>
              <Input
                id="testPassword"
                type="password"
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
              />
            </div>
          </div>
          
          <Button onClick={testRegisterEndpoint}>
            Test Debug Registration Endpoint
          </Button>

          {testRegistration && (
            <div>
              <strong>Test Registration Response:</strong>
              <pre className="bg-gray-100 p-2 rounded mt-2 text-sm">
                {JSON.stringify(testRegistration, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
