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
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
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
  Globe
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string
  location: string
  dateOfBirth: string
  college: string
  degree: string
  graduationYear: string
  bio: string
  skills: string[]
  experience: string
  projects: string[]
  github: string
  linkedin: string
  portfolio: string
  achievements: string[]
  gpa: string
  resumeUrl: string
  profilePicture: string
}

interface Education {
  id: string
  institution: string
  degree: string
  fieldOfStudy: string
  startYear: string
  endYear: string
  gpa?: string
  achievements?: string[]
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
    degree: "",
    graduationYear: "",
    bio: "",
    skills: [],
    experience: "",
    projects: [],
    github: "",
    linkedin: "",
    portfolio: "",
    achievements: [],
    gpa: "",
    resumeUrl: "",
    profilePicture: ""
  })
  const [education, setEducation] = useState<Education[]>([])
  const [workExperience, setWorkExperience] = useState<Experience[]>([])
  const [newSkill, setNewSkill] = useState("")
  const [newProject, setNewProject] = useState("")
  const [newAchievement, setNewAchievement] = useState("")

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push("/auth")
      return
    }

    if (user.role !== "USER") {
      router.push("/recruiter/dashboard")
      return
    }

    fetchUserProfile()
  }, [user, loading, router])

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with actual API call
      const mockProfile: UserProfile = {
        id: user?.id || "1",
        name: user?.profile?.name || user?.email?.split('@')[0] || "John Doe",
        email: user?.email || "john.doe@example.com",
        phone: "+1 (555) 123-4567",
        location: "New York, NY",
        dateOfBirth: "1999-05-15",
        college: "Tech University",
        degree: "Computer Science",
        graduationYear: "2024",
        bio: "Passionate computer science student with experience in full-stack development and machine learning. Always eager to learn new technologies and solve complex problems.",
        skills: ["JavaScript", "Python", "React", "Node.js", "SQL", "MongoDB", "Machine Learning", "Git"],
        experience: "2 years",
        projects: ["E-commerce Platform", "Weather App", "Task Management System"],
        github: "https://github.com/johndoe",
        linkedin: "https://linkedin.com/in/johndoe",
        portfolio: "https://johndoe.dev",
        achievements: ["Dean's List", "Hackathon Winner", "Open Source Contributor"],
        gpa: "3.8",
        resumeUrl: "/resume.pdf",
        profilePicture: "/placeholder-user.jpg"
      }

      const mockEducation: Education[] = [
        {
          id: "1",
          institution: "Tech University",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          startYear: "2020",
          endYear: "2024",
          gpa: "3.8",
          achievements: ["Dean's List", "Magna Cum Laude"]
        }
      ]

      const mockExperience: Experience[] = [
        {
          id: "1",
          company: "Tech Startup Inc.",
          position: "Software Development Intern",
          startDate: "2023-06",
          endDate: "2023-08",
          description: "Developed and maintained web applications using React and Node.js. Collaborated with cross-functional teams to deliver high-quality software solutions.",
          skills: ["React", "Node.js", "MongoDB", "REST APIs"]
        }
      ]

      setProfile(mockProfile)
      setEducation(mockEducation)
      setWorkExperience(mockExperience)
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
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <BackgroundPaths />
        <FloatingNavbar userRole={user?.role} userName={user?.email} />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <BackgroundPaths />
      <FloatingNavbar userRole={user?.role} userName={user?.email} />
      
      <div className="container mx-auto px-4 py-8">
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.profilePicture} />
                    <AvatarFallback className="text-xl">
                      {profile.name.split(' ').map(n => n[0]).join('')}
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

          {/* Education */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {education.map((edu) => (
                  <div key={edu.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {edu.degree} in {edu.fieldOfStudy}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {edu.institution}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {edu.startYear} - {edu.endYear}
                        </p>
                        {edu.gpa && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            GPA: {edu.gpa}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor("ACTIVE")}>
                        Current
                      </Badge>
                    </div>
                    {edu.achievements && edu.achievements.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Achievements:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {edu.achievements.map((achievement, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              {achievement}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Work Experience */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workExperience.map((exp) => (
                  <div key={exp.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {exp.position}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300">
                          {exp.company}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {exp.startDate} - {exp.endDate}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                          {exp.description}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Skills:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {exp.skills.map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Skills
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm">
                    {skill}
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              
              {isEditing && (
                <div className="flex gap-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a new skill"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                  />
                  <Button onClick={handleAddSkill} variant="outline">
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Projects */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {profile.projects.map((project) => (
                  <div key={project} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-gray-700 dark:text-gray-300">{project}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveProject(project)}
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
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    placeholder="Add a new project"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                  />
                  <Button onClick={handleAddProject} variant="outline">
                    Add
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="mb-8">
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
