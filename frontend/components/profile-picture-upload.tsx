'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Upload, X, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiClient } from '@/lib/api'

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null
  userType: 'student' | 'recruiter'
  userId: string
  onImageUpdate?: (newImageUrl: string | null) => void
  className?: string
}

export function ProfilePictureUpload({
  currentImageUrl,
  userType,
  userId,
  onImageUpdate,
  className = ''
}: ProfilePictureUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(currentImageUrl || null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image smaller than 5MB.',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsUploading(true)

      const formData = new FormData()
      formData.append('profilePic', file)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile-upload/${userType}/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      const newImageUrl = data.profilePic

      setImageUrl(newImageUrl)
      onImageUpdate?.(newImageUrl)

      toast({
        title: 'Success',
        description: 'Profile picture updated successfully!'
      })

    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Upload failed',
        description: 'Failed to upload profile picture. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async () => {
    try {
      setIsUploading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile-upload/${userType}/profile-picture`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Remove failed')
      }

      setImageUrl(null)
      onImageUpdate?.(null)

      toast({
        title: 'Success',
        description: 'Profile picture removed successfully!'
      })

    } catch (error) {
      console.error('Remove error:', error)
      toast({
        title: 'Remove failed',
        description: 'Failed to remove profile picture. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const getInitials = () => {
    // This would ideally come from user data
    return userType === 'student' ? 'ST' : 'RC'
  }

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage 
            src={imageUrl || undefined} 
            alt="Profile picture"
            className="object-cover"
          />
          <AvatarFallback className="text-lg">
            {imageUrl ? <User className="h-8 w-8" /> : getInitials()}
          </AvatarFallback>
        </Avatar>
        
        {imageUrl && (
          <button
            onClick={handleRemoveImage}
            disabled={isUploading}
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center justify-center"
            title="Remove profile picture"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center space-y-2">
        <Button
          onClick={handleFileSelect}
          disabled={isUploading}
          variant="outline"
          size="sm"
          className="flex items-center space-x-2"
        >
          <Upload className="h-4 w-4" />
          <span>{imageUrl ? 'Change Picture' : 'Upload Picture'}</span>
        </Button>
        
        <p className="text-xs text-gray-500 text-center">
          JPG, PNG up to 5MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  )
}
