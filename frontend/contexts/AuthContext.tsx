'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getApiUrl, logApiConfig } from '@/lib/config'

interface User {
  id: string
  email: string
  role: 'USER' | 'RECRUITER' | 'BOTH'
  profile?: any
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  setUserFromToken: (token: string, userData: User) => void
  upgradeToRecruiter: (recruiterData: any) => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Log API configuration for debugging
    logApiConfig()
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      const savedUserData = localStorage.getItem('userData')
      
      if (!token || !savedUserData) {
        setLoading(false)
        return
      }

      const userData = JSON.parse(savedUserData)
      
      // Validate user data format
      if (!userData.id || !userData.email || !userData.role) {
        console.log('Invalid user data format, clearing cache')
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
        setLoading(false)
        return
      }
      
      // Validate user ID format (cuid format)
      if (!userData.id.match(/^c[a-z0-9]{20,}$/)) {
        console.log('Invalid user ID format, clearing cache')
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
        setLoading(false)
        return
      }

      // Verify with backend that user still exists
      const apiUrl = getApiUrl()
      try {
        const response = await fetch(`${apiUrl}/api/students/${userData.id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        
        if (!response.ok) {
          console.log('User validation failed, clearing cache')
          localStorage.removeItem('token')
          localStorage.removeItem('userData')
          setLoading(false)
          return
        }
        
        // User exists in database, set user data
        setUser(userData)
      } catch (backendError) {
        console.log('Backend validation failed, clearing cache')
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
        setLoading(false)
        return
      }
      
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    if (!email || !password) {
      throw new Error('Email and password required')
    }
    
    try {
      // Use the proper backend login endpoint with environment variable
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }
      
      const { user: userData, token } = await response.json()
      
      // Store token and user data
      localStorage.setItem('token', token)
      localStorage.setItem('userData', JSON.stringify(userData))
      setUser(userData)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    setUser(null)
    // Force reload to clear any cached state
    window.location.href = '/auth'
  }

  // Force clear all auth data (for debugging)
  const forceClearAuth = () => {
    localStorage.clear()
    sessionStorage.clear()
    setUser(null)
    window.location.href = '/auth'
  }

  // Make forceClearAuth available globally for debugging
  if (typeof window !== 'undefined') {
    (window as any).forceClearAuth = forceClearAuth
  }

  const setUserFromToken = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const upgradeToRecruiter = async (recruiterData: any) => {
    if (!user) return
    
    try {
      const token = localStorage.getItem('token')
      const apiUrl = getApiUrl()
      const response = await fetch(`${apiUrl}/api/auth/upgrade-to-recruiter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(recruiterData),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upgrade failed')
      }
      
      const { user: updatedUser } = await response.json()
      
      // Update user data
      setUser(updatedUser)
      localStorage.setItem('userData', JSON.stringify(updatedUser))
    } catch (error) {
      console.error('Upgrade to recruiter failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, setUserFromToken, upgradeToRecruiter, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
