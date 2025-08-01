"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
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
import { Skeleton, CardSkeleton, StatCardSkeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { createNotification } from "@/lib/notification-api"
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  GraduationCap,
  Briefcase,
  Edit,
  Save,
  X,
  Camera,
  Award,
  Star,
  Github,
  Linkedin,
  Globe,
  Upload,
  FileText,
  Download,
  Eye
} from "lucide-react"
import { SkillsAutocomplete } from "@/components/ui/skills-autocomplete"
import { ProfilePictureUpload } from "@/components/profile-picture-upload"
import ProjectManagement from "@/components/project-management"
import ExperienceManagement from "@/components/experience-management"
import CertificationManagement from "@/components/certification-management"
import { cachedApiClient } from "@/lib/cached-api-client"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  dateOfBirth: string
  college: string
  course: string
  year: string
  bio: string
  skills: string[]
  experience: string
  projects: string[]
  github: string
  linkedin: string
  portfolio: string
  achievements: string[]
  cgpa: number
  resumeUrl: string
  profilePicture: string
}

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  skills: string[]
}

export default function UserProfilePage() {
  // Skill verification state
  const [verifiedSkills, setVerifiedSkills] = useState<string[]>([])
  const [verifyingSkill, setVerifyingSkill] = useState<string | null>(null)
  const [examModalOpen, setExamModalOpen] = useState(false)
  // MCQ exam state
  const [examQuestions, setExamQuestions] = useState<any[]>([])
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([])
  const [examLoading, setExamLoading] = useState(false)
  const [examResult, setExamResult] = useState<string | null>(null)
  const [timer, setTimer] = useState(10)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch verified skills from backend
  const fetchVerifiedSkills = async () => {
    if (!user?.id) return
    try {
      const res = await apiClient.getVerifiedSkills(user.id)
      setVerifiedSkills(res.verifiedSkills || [])
    } catch (e) {
      setVerifiedSkills([])
    }
  }

  // Save verified skills to backend
  const saveVerifiedSkill = async (skill: string) => {
    if (!user?.id) return
    try {
      const res = await apiClient.addVerifiedSkill(user.id, skill)
      setVerifiedSkills(res.verifiedSkills || [])
    } catch (e) {
      // fallback: do nothing
    }
  }

  // Start verification exam for a skill
  const handleVerifySkill = async (skill: string) => {
    setVerifyingSkill(skill)
    setExamModalOpen(true)
    setExamLoading(true)
    setExamResult(null)
    setExamQuestions([])
    setSelectedAnswers([])
    setCurrentQuestionIdx(0)
    setTimer(10)
    // Fetch 10 MCQ questions from API
    try {
      const res = await fetch("/api/skill-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill })
      })
      const data = await res.json()
      if (data.questions && Array.isArray(data.questions)) {
        setExamQuestions(data.questions)
        setSelectedAnswers(Array(data.questions.length).fill(-1))
        setCurrentQuestionIdx(0)
        setTimer(10)
      } else {
        setExamResult("Failed to load questions. Please try again.")
      }
    } catch (e) {
      setExamResult("Failed to load questions. Please try again.")
    }
    setExamLoading(false)
  }

  // Submit exam answer
  // Submit all answers for evaluation
  const handleSubmitExam = async () => {
    setExamLoading(true)
    setExamResult(null)
    if (!verifyingSkill) return
    try {
      const res = await fetch("/api/skill-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skill: verifyingSkill,
          questions: examQuestions,
          answers: selectedAnswers
        })
      })
      const data = await res.json()
      if (data.passed) {
        setExamResult("Congratulations! You have verified this skill.")
        await saveVerifiedSkill(verifyingSkill)
        // Ensure UI updates instantly for blue dot
        setVerifiedSkills((prev) => prev.includes(verifyingSkill) ? prev : [...prev, verifyingSkill])
      } else {
        setExamResult("Sorry, you did not pass. Try again!")
      }
    } catch (e) {
      setExamResult("Error submitting exam. Please try again.")
    }
    setExamLoading(false)
  }

  // Close modal
  const handleCloseExam = () => {
    setExamModalOpen(false)
    setVerifyingSkill(null)
    setExamQuestions([])
    setSelectedAnswers([])
    setCurrentQuestionIdx(0)
    setExamResult(null)
    setExamLoading(false)
    setTimer(10)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  // Timer effect for each question
  useEffect(() => {
    if (!examModalOpen || examResult || examLoading || examQuestions.length === 0) return
    setTimer(10)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleNextQuestion(true)
        return 10
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    // eslint-disable-next-line
  }, [currentQuestionIdx, examModalOpen, examQuestions.length])

  // Move to next question or submit
  const handleNextQuestion = (auto = false) => {
    if (currentQuestionIdx < examQuestions.length - 1) {
      setCurrentQuestionIdx((idx) => idx + 1)
      setTimer(10)
    } else {
      handleSubmitExam()
    }
  }

  // Select answer for current question
  const handleSelectOption = (optionIdx: number) => {
    const updated = [...selectedAnswers]
    updated[currentQuestionIdx] = optionIdx
    setSelectedAnswers(updated)
    // Move to next after selection
    setTimeout(() => handleNextQuestion(), 300)
  }
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    phone: "",
    location: "",
    dateOfBirth: "",
    college: "",
    course: "",
    year: "",
    bio: "",
    skills: [],
    experience: "",
    projects: [],
    github: "",
    linkedin: "",
    portfolio: "",
    achievements: [],
    cgpa: 0,
    resumeUrl: "",
    profilePicture: ""
  })
  const [workExperience, setWorkExperience] = useState<Experience[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [experiences, setExperiences] = useState<any[]>([])
  const [certifications, setCertifications] = useState<any[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [newProject, setNewProject] = useState("")
  const [newAchievement, setNewAchievement] = useState("")

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/auth")
      return
    }

    if (user.role !== "USER" && user.role !== "BOTH") {
      router.push("/recruiter/dashboard")
      return
    }

    fetchUserProfile()
    fetchVerifiedSkills()

  // Save verified skills to backend (stub: localStorage for demo, replace with real API)
  const saveVerifiedSkill = async (skill: string) => {
    const updated = [...verifiedSkills, skill]
    setVerifiedSkills(updated)
    localStorage.setItem(`verifiedSkills_${user?.id}`, JSON.stringify(updated))
    // TODO: Call backend to persist
  }

  // (Obsolete single-question exam flow removed, as MCQ exam flow is used above)

  // Submit exam answer
  const handleSubmitExam = async () => {
    setExamLoading(true)
    setExamResult(null)
    try {
      const res = await fetch("/api/skill-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: verifyingSkill, questions: examQuestions, answers: selectedAnswers })
      })
      const data = await res.json()
      if (data.passed) {
        setExamResult("Congratulations! You have verified this skill.")
        if (verifyingSkill) await saveVerifiedSkill(verifyingSkill)
      } else {
        setExamResult("Sorry, your answer was not sufficient. Try again!")
      }
    } catch (e) {
      setExamResult("Error submitting answer. Please try again.")
    }
    setExamLoading(false)
  }

  // Close modal
  const handleCloseExam = () => {
    setExamModalOpen(false)
    setVerifyingSkill(null)
    setExamResult(null)
    setExamLoading(false)
  }
  }, [user, loading, router])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      
      // Fetch real user profile data from backend
      const response = await apiClient.getUserProfile(user!.id)
      const userProfile = response
      
      // Transform backend data to frontend format
      const profileData: UserProfile = {
        id: userProfile.id,
        name: `${userProfile.firstName} ${userProfile.lastName}`,
        email: user!.email,
        phone: userProfile.phone || "",
        location: userProfile.location || "",
        dateOfBirth: "", // Add this field to backend if needed
        college: userProfile.college,
        course: userProfile.course,
        year: userProfile.year,
        bio: userProfile.bio || "",
        skills: userProfile.skills || [],
        experience: "", // Calculate from experience entries
        projects: userProfile.projects?.map((p: any) => p.title) || [],
        github: "", // Add social links to backend if needed
        linkedin: "",
        portfolio: "",
        achievements: [], // Add achievements to backend if needed
        cgpa: userProfile.cgpa || 0,
        resumeUrl: userProfile.resumeUrl || "",
        profilePicture: userProfile.profilePic || "/placeholder-user.jpg"
      }

      setProfile(profileData)
      
      // Transform experience data
      const experienceData: Experience[] = userProfile.experiences?.map((exp: any) => ({
        id: exp.id,
        company: exp.company,
        position: exp.role,
        startDate: exp.startDate,
        endDate: exp.endDate || (exp.current ? "Present" : ""),
        description: exp.description || "",
        skills: [] // Add skills to experience model if needed
      })) || []

      setWorkExperience(experienceData)

      // Fetch projects, experiences, and certifications
      const [projectsData, experiencesData, certificationsData] = await Promise.all([
        cachedApiClient.getStudentProjects(userProfile.id),
        cachedApiClient.getStudentExperiences(userProfile.id),
        cachedApiClient.getStudentCertifications(userProfile.id)
      ])

      setProjects(projectsData || [])
      setExperiences(experiencesData || [])
      setCertifications(certificationsData || [])
    } catch (error) {
      console.error("Error fetching profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true)
      
      // Split name back into first and last name
      const nameParts = profile.name.split(' ')
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Prepare data for backend
      const updateData = {
        firstName,
        lastName,
        phone: profile.phone,
        location: profile.location,
        college: profile.college,
        course: profile.course,
        year: profile.year,
        cgpa: profile.cgpa || 0,
        bio: profile.bio,
        skills: profile.skills,
        profilePic: profile.profilePicture !== "/placeholder-user.jpg" ? profile.profilePicture : null,
        // Add other fields as needed
      }
      
      await apiClient.updateUserProfile(user!.id, updateData)
      
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
      // Add notification for profile update
      if (user?.id) {
        await createNotification({
          userId: user.id,
          title: "Profile Updated",
          message: "Your profile was updated successfully.",
          type: "PROFILE"
        });
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skill: string) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleAddProject = () => {
    if (newProject.trim() && !profile.projects.includes(newProject.trim())) {
      setProfile(prev => ({
        ...prev,
        projects: [...prev.projects, newProject.trim()]
      }))
      setNewProject("")
    }
  }

  const handleRemoveProject = (project: string) => {
    setProfile(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p !== project)
    }))
  }

  const handleAddAchievement = () => {
    if (newAchievement.trim() && !profile.achievements.includes(newAchievement.trim())) {
      setProfile(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }))
      setNewAchievement("")
    }
  }

  const handleRemoveAchievement = (achievement: string) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a !== achievement)
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800"
      case "INCOMPLETE":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen">
        <BackgroundPaths />
        <FloatingNavbar userRole={user?.role} userName={user?.email} />
        <div className="container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1">
                <CardSkeleton className="h-64" />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <CardSkeleton className="h-48" />
                <CardSkeleton className="h-32" />
                <CardSkeleton className="h-24" />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <BackgroundPaths />
      <FloatingNavbar userRole={user?.role} userName={user?.email} />
      
      <div className="container mx-auto px-4 py-24">{/* Fixed: Changed py-8 to py-24 for proper navbar spacing */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Profile
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Manage your profile information and preferences
                </p>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Profile Overview */}
          <Card className="mb-8 backdrop-blur-sm bg-background/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                {isEditing ? (
                  <ProfilePictureUpload
                    currentImageUrl={profile.profilePicture}
                    userType="student"
                    userId={user?.id || ''}
                    onImageUpdate={(newImageUrl) => setProfile(prev => ({ ...prev, profilePicture: newImageUrl || "/placeholder-user.jpg" }))}
                  />
                ) : (
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.profilePicture} />
                    <AvatarFallback className="text-xl">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          value={profile.name}
                          onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-lg font-medium text-gray-900 dark:text-white mt-1">
                          {profile.name}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {profile.email}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={profile.phone}
                          onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {profile.phone}
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={profile.location}
                          onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                          className="mt-1"
                        />
                      ) : (
                        <p className="text-gray-700 dark:text-gray-300 mt-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {profile.location}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <Label htmlFor="bio">Bio</Label>
                    {isEditing ? (
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself..."
                        className="mt-1"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300 mt-1">
                        {profile.bio}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information */}
          <Card className="mb-8 backdrop-blur-sm bg-background/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Academic Information
              </CardTitle>
              <CardDescription>
                Your academic details are used for job eligibility matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="college" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    College
                  </Label>
                  {isEditing ? (
                    <Input
                      id="college"
                      value={profile.college}
                      onChange={(e) => setProfile(prev => ({ ...prev, college: e.target.value }))}
                      placeholder="Your college name"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{profile.college}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="course" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Course
                  </Label>
                  {isEditing ? (
                    <Select value={profile.course} onValueChange={(value) => setProfile(prev => ({ ...prev, course: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Electronics & Communication">Electronics & Communication</SelectItem>
                        <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                        <SelectItem value="MBA">MBA</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{profile.course || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="year" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Academic Year
                  </Label>
                  {isEditing ? (
                    <Select value={profile.year} onValueChange={(value) => setProfile(prev => ({ ...prev, year: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select your year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st Year">1st Year</SelectItem>
                        <SelectItem value="2nd Year">2nd Year</SelectItem>
                        <SelectItem value="3rd Year">3rd Year</SelectItem>
                        <SelectItem value="4th Year">4th Year</SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{profile.year || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cgpa" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    CGPA
                  </Label>
                  {isEditing ? (
                    <Input
                      id="cgpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={profile.cgpa || ''}
                      onChange={(e) => setProfile(prev => ({ ...prev, cgpa: parseFloat(e.target.value) || 0 }))}
                      placeholder="Your CGPA (e.g., 8.5)"
                      className="mt-1"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 dark:text-gray-100">{profile.cgpa ? profile.cgpa.toFixed(2) : 'Not specified'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Work Experience Management */}
          <Card className="mb-8 backdrop-blur-sm bg-background/95">
            <CardContent className="pt-6">
              <ExperienceManagement
                studentId={profile.id}
                experiences={experiences}
                onExperiencesUpdate={setExperiences}
                isEditing={isEditing}
              />
            </CardContent>
          </Card>

          {/* Projects Management */}
          <Card className="mb-8 backdrop-blur-sm bg-background/95">
            <CardContent className="pt-6">
              <ProjectManagement
                studentId={profile.id}
                projects={projects}
                onProjectsUpdate={setProjects}
                isEditing={isEditing}
              />
            </CardContent>
          </Card>

          {/* Certifications Management */}
          <Card className="mb-8 backdrop-blur-sm bg-background/95">
            <CardContent className="pt-6">
              <CertificationManagement
                studentId={profile.id}
                certifications={certifications}
                onCertificationsUpdate={setCertifications}
                isEditing={isEditing}
              />
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="mb-8 backdrop-blur-sm bg-background/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <SkillsAutocomplete
                  skills={profile.skills}
                  setSkills={(skills) => setProfile(prev => ({ ...prev, skills }))}
                  disabled={!isEditing}
                />
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.skills.map((skill) => {
                    const isVerified = verifiedSkills.includes(skill)
                    return (
                      <div key={skill} className="flex items-center gap-1">
                        <Badge variant="secondary" className="text-sm flex items-center gap-1">
                          <span>{skill}</span>
                          {isVerified ? (
                            <span title="Verified" className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 ml-1" />
                          ) : (
                            <span title="Unverified" className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 ml-1" />
                          )}
                        </Badge>
                        {!isVerified && (
                          <Button size="sm" variant="outline" className="ml-1 px-2 py-0.5 text-xs" onClick={() => handleVerifySkill(skill)}>
                            Verify
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Skill Verification Exam Modal (MCQ) */}
          <Dialog open={examModalOpen} onOpenChange={handleCloseExam}>
            <DialogContent className="max-w-md select-none" onContextMenu={e => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle>Skill Verification: {verifyingSkill}</DialogTitle>
              </DialogHeader>
              {examLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                </div>
              ) : examResult ? (
                <div className="space-y-4">
                  <p>{examResult}</p>
                  <DialogFooter>
                    <Button onClick={handleCloseExam}>Close</Button>
                  </DialogFooter>
                </div>
              ) : (
                <div className="space-y-4">
                  {examQuestions.length > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Question {currentQuestionIdx + 1} of {examQuestions.length}</span>
                        <span className="text-sm font-mono bg-gray-200 dark:bg-gray-700 rounded px-2 py-1">{timer}s</span>
                      </div>
                      <div>
                        <p className="font-medium mb-2">{examQuestions[currentQuestionIdx].question}</p>
                        <div className="space-y-2">
                          {examQuestions[currentQuestionIdx].options.map((opt: string, idx: number) => (
                            <Button
                              key={idx}
                              variant={selectedAnswers[currentQuestionIdx] === idx ? "default" : "outline"}
                              className="w-full text-left"
                              onClick={() => handleSelectOption(idx)}
                              disabled={selectedAnswers[currentQuestionIdx] !== -1}
                            >
                              {String.fromCharCode(65 + idx)}. {opt}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-between mt-4">
                        <span className="text-xs text-gray-500">Auto next in {timer}s</span>
                        <span className="text-xs text-gray-500">Unanswered = skipped</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Links */}
          <Card className="mb-8 backdrop-blur-sm bg-background/95">
            <CardHeader>
              <CardTitle>Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  {isEditing ? (
                    <Input
                      id="github"
                      value={profile.github}
                      onChange={(e) => setProfile(prev => ({ ...prev, github: e.target.value }))}
                      placeholder="https://github.com/username"
                      className="mt-1"
                    />
                  ) : (
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-2"
                    >
                      <Github className="h-4 w-4" />
                      GitHub Profile
                    </a>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  {isEditing ? (
                    <Input
                      id="linkedin"
                      value={profile.linkedin}
                      onChange={(e) => setProfile(prev => ({ ...prev, linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/username"
                      className="mt-1"
                    />
                  ) : (
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-2"
                    >
                      <Linkedin className="h-4 w-4" />
                      LinkedIn Profile
                    </a>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="portfolio">Portfolio</Label>
                  {isEditing ? (
                    <Input
                      id="portfolio"
                      value={profile.portfolio}
                      onChange={(e) => setProfile(prev => ({ ...prev, portfolio: e.target.value }))}
                      placeholder="https://yourportfolio.com"
                      className="mt-1"
                    />
                  ) : (
                    <a
                      href={profile.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Portfolio Website
                    </a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CV Management */}
          <Card className="mb-8 backdrop-blur-sm bg-background/95">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                CV Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {profile.resumeUrl ? (
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Resume.pdf</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Current resume</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(profile.resumeUrl, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.href = profile.resumeUrl
                          link.download = 'resume.pdf'
                          link.click()
                        }}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/user/cv-builder')}
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">No CV uploaded yet</p>
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="outline"
                        onClick={() => router.push('/user/cv-builder')}
                        className="flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Create CV
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          const input = document.createElement('input')
                          input.type = 'file'
                          input.accept = '.pdf,.doc,.docx'
                          input.onchange = async (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0]
                            if (file) {
                              // Handle file upload
                              const formData = new FormData()
                              formData.append('resume', file)
                              try {
                                const response = await fetch('/api/upload/resume', {
                                  method: 'POST',
                                  body: formData,
                                })
                                if (response.ok) {
                                  const data = await response.json()
                                  setProfile(prev => ({ ...prev, resumeUrl: data.url }))
                                  toast({
                                    title: "Success",
                                    description: "CV uploaded successfully"
                                  })
                                }
                              } catch (error) {
                                toast({
                                  title: "Error",
                                  description: "Failed to upload CV",
                                  variant: "destructive"
                                })
                              }
                            }
                          }
                          input.click()
                        }}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload CV
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {profile.achievements.map((achievement) => (
                  <div key={achievement} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveAchievement(achievement)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newAchievement}
                    onChange={(e) => setNewAchievement(e.target.value)}
                    placeholder="Add a new achievement"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddAchievement()}
                  />
                  <Button onClick={handleAddAchievement} variant="outline">
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
