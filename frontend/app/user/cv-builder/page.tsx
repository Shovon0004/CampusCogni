"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { 
  FileText, 
  Download, 
  Eye, 
  Plus,
  Trash2,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Award,
  Star,
  Calendar,
  Globe,
  Github,
  Linkedin
} from "lucide-react"

interface PersonalInfo {
  name: string
  email: string
  phone: string
  address: string
  website: string
  linkedin: string
  github: string
  summary: string
}

interface Education {
  id: string
  school: string
  degree: string
  field: string
  startDate: string
  endDate: string
  gpa: string
  achievements: string[]
}

interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  achievements: string[]
}

interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  link: string
  startDate: string
  endDate: string
}

interface CVData {
  personalInfo: PersonalInfo
  education: Education[]
  experience: Experience[]
  projects: Project[]
  skills: string[]
  languages: string[]
  certifications: string[]
}

export default function CVBuilderPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      name: "",
      email: "",
      phone: "",
      address: "",
      website: "",
      linkedin: "",
      github: "",
      summary: ""
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    languages: [],
    certifications: []
  })
  const [activeSection, setActiveSection] = useState("personal")
  const [newSkill, setNewSkill] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [newCertification, setNewCertification] = useState("")

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

    loadCVData()
  }, [user, loading, router])

  const loadCVData = async () => {
    try {
      setIsLoading(true)
      // Mock data for now - replace with actual API call
      const mockCVData: CVData = {
        personalInfo: {
          name: user?.profile?.name || user?.email?.split('@')[0] || "",
          email: user?.email || "",
          phone: "",
          address: "",
          website: "",
          linkedin: "",
          github: "",
          summary: ""
        },
        education: [],
        experience: [],
        projects: [],
        skills: [],
        languages: [],
        certifications: []
      }

      setCvData(mockCVData)
    } catch (error) {
      console.error("Error loading CV data:", error)
      toast({
        title: "Error",
        description: "Failed to load CV data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCV = async () => {
    try {
      setIsLoading(true)
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "CV saved successfully"
      })
    } catch (error) {
      console.error("Error saving CV:", error)
      toast({
        title: "Error",
        description: "Failed to save CV",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadCV = async () => {
    try {
      setIsLoading(true)
      // Mock PDF generation - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Success",
        description: "CV downloaded successfully"
      })
    } catch (error) {
      console.error("Error downloading CV:", error)
      toast({
        title: "Error",
        description: "Failed to download CV",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      school: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
      achievements: []
    }
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }))
  }

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }))
  }

  const updateEducation = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }))
  }

  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
      achievements: []
    }
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }))
  }

  const removeExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }))
  }

  const updateExperience = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }))
  }

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: [],
      link: "",
      startDate: "",
      endDate: ""
    }
    setCvData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }))
  }

  const removeProject = (id: string) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }))
  }

  const updateProject = (id: string, field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, [field]: value } : proj
      )
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      setCvData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const addLanguage = () => {
    if (newLanguage.trim() && !cvData.languages.includes(newLanguage.trim())) {
      setCvData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }))
      setNewLanguage("")
    }
  }

  const removeLanguage = (language: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }))
  }

  const addCertification = () => {
    if (newCertification.trim() && !cvData.certifications.includes(newCertification.trim())) {
      setCvData(prev => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()]
      }))
      setNewCertification("")
    }
  }

  const removeCertification = (certification: string) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c !== certification)
    }))
  }

  const menuItems = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "projects", label: "Projects", icon: FileText },
    { id: "skills", label: "Skills", icon: Star },
    { id: "languages", label: "Languages", icon: Globe },
    { id: "certifications", label: "Certifications", icon: Award }
  ]

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
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  CV Builder
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Create and customize your professional CV
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveCV}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save CV
                </Button>
                <Button
                  onClick={handleDownloadCV}
                  disabled={isLoading}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  disabled={isLoading}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Navigation */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sections</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {menuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                            activeSection === item.id 
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-2 border-blue-600" 
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {(() => {
                      const activeItem = menuItems.find(item => item.id === activeSection)
                      const Icon = activeItem?.icon || User
                      return (
                        <>
                          <Icon className="h-5 w-5" />
                          {activeItem?.label}
                        </>
                      )
                    })()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Personal Info Section */}
                  {activeSection === "personal" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={cvData.personalInfo.name}
                            onChange={(e) => setCvData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, name: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={cvData.personalInfo.email}
                            onChange={(e) => setCvData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, email: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={cvData.personalInfo.phone}
                            onChange={(e) => setCvData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, phone: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={cvData.personalInfo.address}
                            onChange={(e) => setCvData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, address: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="website">Website</Label>
                          <Input
                            id="website"
                            value={cvData.personalInfo.website}
                            onChange={(e) => setCvData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, website: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="linkedin">LinkedIn</Label>
                          <Input
                            id="linkedin"
                            value={cvData.personalInfo.linkedin}
                            onChange={(e) => setCvData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="github">GitHub</Label>
                          <Input
                            id="github"
                            value={cvData.personalInfo.github}
                            onChange={(e) => setCvData(prev => ({
                              ...prev,
                              personalInfo: { ...prev.personalInfo, github: e.target.value }
                            }))}
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="summary">Professional Summary</Label>
                        <Textarea
                          id="summary"
                          value={cvData.personalInfo.summary}
                          onChange={(e) => setCvData(prev => ({
                            ...prev,
                            personalInfo: { ...prev.personalInfo, summary: e.target.value }
                          }))}
                          placeholder="Write a brief summary of your professional background..."
                          className="mt-1"
                          rows={4}
                        />
                      </div>
                    </div>
                  )}

                  {/* Education Section */}
                  {activeSection === "education" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Education</h3>
                        <Button onClick={addEducation} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Education
                        </Button>
                      </div>
                      
                      {cvData.education.map((edu) => (
                        <div key={edu.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Education Entry</h4>
                            <Button
                              onClick={() => removeEducation(edu.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>School/University</Label>
                              <Input
                                value={edu.school}
                                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Degree</Label>
                              <Input
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Field of Study</Label>
                              <Input
                                value={edu.field}
                                onChange={(e) => updateEducation(edu.id, 'field', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>GPA</Label>
                              <Input
                                value={edu.gpa}
                                onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={edu.startDate}
                                onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={edu.endDate}
                                onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {cvData.education.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No education entries yet. Click "Add Education" to get started.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Experience Section */}
                  {activeSection === "experience" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Work Experience</h3>
                        <Button onClick={addExperience} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Experience
                        </Button>
                      </div>
                      
                      {cvData.experience.map((exp) => (
                        <div key={exp.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Work Experience</h4>
                            <Button
                              onClick={() => removeExperience(exp.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Company</Label>
                              <Input
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Position</Label>
                              <Input
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={exp.startDate}
                                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={exp.endDate}
                                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={exp.description}
                              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                              placeholder="Describe your responsibilities and achievements..."
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                      
                      {cvData.experience.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No work experience entries yet. Click "Add Experience" to get started.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Projects Section */}
                  {activeSection === "projects" && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Projects</h3>
                        <Button onClick={addProject} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Project
                        </Button>
                      </div>
                      
                      {cvData.projects.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium">Project</h4>
                            <Button
                              onClick={() => removeProject(project.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label>Project Name</Label>
                              <Input
                                value={project.name}
                                onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Project Link</Label>
                              <Input
                                value={project.link}
                                onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>Start Date</Label>
                              <Input
                                type="date"
                                value={project.startDate}
                                onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div>
                              <Label>End Date</Label>
                              <Input
                                type="date"
                                value={project.endDate}
                                onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <Label>Description</Label>
                            <Textarea
                              value={project.description}
                              onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                              placeholder="Describe your project, its features, and impact..."
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                      
                      {cvData.projects.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          No projects yet. Click "Add Project" to get started.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Skills Section */}
                  {activeSection === "skills" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Technical Skills</h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {cvData.skills.map((skill) => (
                          <div key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a new skill"
                          onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                        />
                        <Button onClick={addSkill} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Languages Section */}
                  {activeSection === "languages" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Languages</h3>
                      
                      <div className="flex flex-wrap gap-2">
                        {cvData.languages.map((language) => (
                          <div key={language} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {language}
                            <button
                              onClick={() => removeLanguage(language)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newLanguage}
                          onChange={(e) => setNewLanguage(e.target.value)}
                          placeholder="Add a new language"
                          onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                        />
                        <Button onClick={addLanguage} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Certifications Section */}
                  {activeSection === "certifications" && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Certifications</h3>
                      
                      <div className="space-y-2">
                        {cvData.certifications.map((certification) => (
                          <div key={certification} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-gray-700 dark:text-gray-300">{certification}</span>
                            <button
                              onClick={() => removeCertification(certification)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Input
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          placeholder="Add a new certification"
                          onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                        />
                        <Button onClick={addCertification} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
