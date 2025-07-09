'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface User {
  id: string
  email: string
  role: 'USER' | 'RECRUITER'
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

      // For demo purposes, just use saved user data
      const userData = JSON.parse(savedUserData)
      
      // Validate user data format
      if (!userData.id || !userData.email || !userData.role) {
        console.log('Invalid user data format, clearing cache')
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
        setLoading(false)
        return
      }
      
      // Validate user ID format (MongoDB ObjectId)
      if (!userData.id.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('Invalid user ID format, clearing cache')
        localStorage.removeItem('token')
        localStorage.removeItem('userData')
        setLoading(false)
        return
      }
      
      setUser(userData)
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
      // Use the new backend demo login endpoint
      const response = await fetch('http://localhost:5000/api/auth/demo-login', {
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
  }

  const setUserFromToken = (token: string, userData: User) => {
    localStorage.setItem('token', token)
    setUser(userData)
  }

  const upgradeToRecruiter = async (recruiterData: any) => {
    if (!user) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/auth/upgrade-to-recruiter', {
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
