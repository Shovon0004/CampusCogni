'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'

interface UserProfileData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  college: string
  course: string
  year: string
  cgpa: number
  location?: string
  bio?: string
  profilePic?: string
  skills: string[]
}

export function useUserProfile() {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!user || user.role === 'RECRUITER') {
      setLoading(false)
      return
    }

    fetchUserProfile()
  }, [user])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await apiClient.getUserProfile(user!.id)
      setProfileData(response)
    } catch (err) {
      setError(err as Error)
      console.error('Error fetching user profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updateData: Partial<UserProfileData>) => {
    try {
      await apiClient.updateUserProfile(user!.id, updateData)
      
      // Update local state
      if (profileData) {
        setProfileData({ ...profileData, ...updateData })
      }
      
      return true
    } catch (err) {
      console.error('Error updating profile:', err)
      throw err
    }
  }

  return {
    profileData,
    loading,
    error,
    refetch: fetchUserProfile,
    updateProfile
  }
}
