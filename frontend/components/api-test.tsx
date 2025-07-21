"use client"

import { useEffect, useState } from 'react'
import { getApiUrl, getBaseUrl } from '@/lib/config'

export default function ApiTest() {
  const [apiUrl, setApiUrl] = useState<string>('')
  const [testResult, setTestResult] = useState<string>('')

  useEffect(() => {
    const url = getApiUrl()
    const baseUrl = getBaseUrl()
    setApiUrl(url)
    
    // Test the API URL
    fetch(`${baseUrl}/health`)
      .then(res => res.json())
      .then(data => {
        setTestResult(`✅ API Connected: ${JSON.stringify(data)}`)
      })
      .catch(err => {
        setTestResult(`❌ API Error: ${err.message}`)
      })
  }, [])

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold text-lg mb-2">API Configuration Test</h3>
      <div className="space-y-2">
        <p><strong>API URL:</strong> {apiUrl}</p>
        <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
        <p><strong>Test Result:</strong> {testResult}</p>
      </div>
    </div>
  )
}
