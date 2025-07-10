"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GridBackground } from "@/components/grid-background"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building,
  Briefcase,
  Edit,
  Save,
  X,
  Camera,
  Globe,
  Users,
  Calendar,
  Trophy
} from "lucide-react"

interface RecruiterProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  jobTitle: string
  website: string
  companySize: string
  industry: string
  description: string
  profilePic?: string
}

export default function RecruiterProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<RecruiterProfile>({
    id: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    jobTitle: "",
    website: "",
    companySize: "",
    industry: "",
    description: "",
    profilePic: ""
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
      return
    }
    
    if (user && (user.role !== 'RECRUITER' && user.role !== 'BOTH')) {
      router.push('/user/dashboard')
      return
    }

    if (user) {
      fetchProfile()
    }
  }, [user, loading, router])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const profileData = await apiClient.getRecruiterProfile(user!.id)
      
      setProfile({
        id: profileData.id || '',
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: user!.email || '',
        phone: profileData.phone || '',
        company: profileData.company || '',
        jobTitle: profileData.jobTitle || '',
        website: profileData.website || '',
        companySize: profileData.companySize || '',
        industry: profileData.industry || '',
        description: profileData.description || '',
        profilePic: profileData.profilePic || ''
      })
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof RecruiterProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      await apiClient.updateRecruiterProfile(user!.id, profile)
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
      
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    fetchProfile() // Reset to original data
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <GridBackground />
        <FloatingNavbar userRole={user?.role as "USER" | "RECRUITER" | "BOTH"} />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <GridBackground />
      <FloatingNavbar userRole={user?.role as "USER" | "RECRUITER" | "BOTH"} />
      
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Recruiter Profile
              </h1>
              <p className="text-muted-foreground mt-2">
                Manage your recruiter profile and company information
              </p>
            </div>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Profile Picture & Basic Info */}
              <Card className="backdrop-blur-sm bg-background/95">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profile.profilePic} />
                        <AvatarFallback className="text-2xl">
                          {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <h2 className="text-xl font-semibold">
                      {profile.firstName} {profile.lastName}
                    </h2>
                    <p className="text-muted-foreground">{profile.jobTitle}</p>
                    <p className="text-sm text-muted-foreground">{profile.company}</p>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{profile.phone}</span>
                      </div>
                    )}
                    {profile.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline"
                        >
                          {profile.website}
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Company Info */}
              <Card className="backdrop-blur-sm bg-background/95">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Company Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Industry</Label>
                    <p className="capitalize">{profile.industry}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Company Size</Label>
                    <Badge variant="secondary" className="mt-1">
                      {profile.companySize === 'STARTUP' && '1-50 employees'}
                      {profile.companySize === 'SMALL' && '51-200 employees'}
                      {profile.companySize === 'MEDIUM' && '201-1000 employees'}
                      {profile.companySize === 'LARGE' && '1000+ employees'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card className="backdrop-blur-sm bg-background/95">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={profile.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                        />
                      ) : (
                        <p className="p-2 text-sm">{profile.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={profile.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                        />
                      ) : (
                        <p className="p-2 text-sm">{profile.lastName}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    {isEditing ? (
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="p-2 text-sm">{profile.phone || 'Not provided'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card className="backdrop-blur-sm bg-background/95">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    {isEditing ? (
                      <Input
                        id="company"
                        value={profile.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    ) : (
                      <p className="p-2 text-sm">{profile.company}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    {isEditing ? (
                      <Input
                        id="jobTitle"
                        value={profile.jobTitle}
                        onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      />
                    ) : (
                      <p className="p-2 text-sm">{profile.jobTitle}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Company Website</Label>
                    {isEditing ? (
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="https://company.com"
                      />
                    ) : (
                      <p className="p-2 text-sm">{profile.website || 'Not provided'}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companySize">Company Size</Label>
                      {isEditing ? (
                        <Select value={profile.companySize} onValueChange={(value) => handleInputChange('companySize', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STARTUP">Startup (1-50 employees)</SelectItem>
                            <SelectItem value="SMALL">Small (51-200 employees)</SelectItem>
                            <SelectItem value="MEDIUM">Medium (201-1000 employees)</SelectItem>
                            <SelectItem value="LARGE">Large (1000+ employees)</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="p-2 text-sm">
                          {profile.companySize === 'STARTUP' && 'Startup (1-50 employees)'}
                          {profile.companySize === 'SMALL' && 'Small (51-200 employees)'}
                          {profile.companySize === 'MEDIUM' && 'Medium (201-1000 employees)'}
                          {profile.companySize === 'LARGE' && 'Large (1000+ employees)'}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry</Label>
                      {isEditing ? (
                        <Select value={profile.industry} onValueChange={(value) => handleInputChange('industry', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="technology">Technology</SelectItem>
                            <SelectItem value="finance">Finance</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="retail">Retail</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <p className="p-2 text-sm capitalize">{profile.industry}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    {isEditing ? (
                      <Textarea
                        id="description"
                        value={profile.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Brief description of your company..."
                        rows={4}
                      />
                    ) : (
                      <p className="p-2 text-sm min-h-[100px]">{profile.description || 'No description provided'}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
