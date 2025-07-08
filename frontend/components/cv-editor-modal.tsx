"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Plus, Trash2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CVData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    location: string
    bio: string
  }
  education: {
    college: string
    course: string
    year: string
    cgpa: number
  }
  skills: string[]
  projects: Array<{
    title: string
    description: string
    technologies: string[]
    link: string
    startDate: string
    endDate: string
  }>
  experiences: Array<{
    company: string
    role: string
    description: string
    startDate: string
    endDate: string
    current: boolean
  }>
  certifications: Array<{
    name: string
    issuer: string
    dateObtained: string
    expiryDate: string
    credentialId: string
    credentialUrl: string
  }>
}

interface CVEditorModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: CVData | null
  onSave: (cvData: CVData) => Promise<void>
}

export function CVEditorModal({ isOpen, onClose, initialData, onSave }: CVEditorModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
    },
    education: {
      college: "",
      course: "",
      year: "",
      cgpa: 0,
    },
    skills: [],
    projects: [],
    experiences: [],
    certifications: [],
  })

  const [newSkill, setNewSkill] = useState("")

  useEffect(() => {
    if (initialData) {
      setCvData(initialData)
    }
  }, [initialData])

  const addSkill = () => {
    if (newSkill.trim() && !cvData.skills.includes(newSkill.trim())) {
      setCvData({
        ...cvData,
        skills: [...cvData.skills, newSkill.trim()]
      })
      setNewSkill("")
    }
  }

  const removeSkill = (skill: string) => {
    setCvData({
      ...cvData,
      skills: cvData.skills.filter(s => s !== skill)
    })
  }

  const addProject = () => {
    setCvData({
      ...cvData,
      projects: [...cvData.projects, {
        title: "",
        description: "",
        technologies: [],
        link: "",
        startDate: "",
        endDate: "",
      }]
    })
  }

  const updateProject = (index: number, field: string, value: any) => {
    const updatedProjects = [...cvData.projects]
    updatedProjects[index] = { ...updatedProjects[index], [field]: value }
    setCvData({ ...cvData, projects: updatedProjects })
  }

  const removeProject = (index: number) => {
    setCvData({
      ...cvData,
      projects: cvData.projects.filter((_, i) => i !== index)
    })
  }

  const addExperience = () => {
    setCvData({
      ...cvData,
      experiences: [...cvData.experiences, {
        company: "",
        role: "",
        description: "",
        startDate: "",
        endDate: "",
        current: false,
      }]
    })
  }

  const updateExperience = (index: number, field: string, value: any) => {
    const updatedExperiences = [...cvData.experiences]
    updatedExperiences[index] = { ...updatedExperiences[index], [field]: value }
    setCvData({ ...cvData, experiences: updatedExperiences })
  }

  const removeExperience = (index: number) => {
    setCvData({
      ...cvData,
      experiences: cvData.experiences.filter((_, i) => i !== index)
    })
  }

  const addCertification = () => {
    setCvData({
      ...cvData,
      certifications: [...cvData.certifications, {
        name: "",
        issuer: "",
        dateObtained: "",
        expiryDate: "",
        credentialId: "",
        credentialUrl: "",
      }]
    })
  }

  const updateCertification = (index: number, field: string, value: any) => {
    const updatedCertifications = [...cvData.certifications]
    updatedCertifications[index] = { ...updatedCertifications[index], [field]: value }
    setCvData({ ...cvData, certifications: updatedCertifications })
  }

  const removeCertification = (index: number) => {
    setCvData({
      ...cvData,
      certifications: cvData.certifications.filter((_, i) => i !== index)
    })
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      await onSave(cvData)
      toast({
        title: "CV Updated",
        description: "Your CV has been successfully updated.",
      })
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update CV. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Edit CV</DialogTitle>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : "Save CV"}
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={cvData.personalInfo.firstName}
                    onChange={(e) => setCvData({
                      ...cvData,
                      personalInfo: { ...cvData.personalInfo, firstName: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={cvData.personalInfo.lastName}
                    onChange={(e) => setCvData({
                      ...cvData,
                      personalInfo: { ...cvData.personalInfo, lastName: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={cvData.personalInfo.email}
                    onChange={(e) => setCvData({
                      ...cvData,
                      personalInfo: { ...cvData.personalInfo, email: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={cvData.personalInfo.phone}
                    onChange={(e) => setCvData({
                      ...cvData,
                      personalInfo: { ...cvData.personalInfo, phone: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={cvData.personalInfo.location}
                    onChange={(e) => setCvData({
                      ...cvData,
                      personalInfo: { ...cvData.personalInfo, location: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={cvData.personalInfo.bio}
                  onChange={(e) => setCvData({
                    ...cvData,
                    personalInfo: { ...cvData.personalInfo, bio: e.target.value }
                  })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="college">College</Label>
                  <Input
                    id="college"
                    value={cvData.education.college}
                    onChange={(e) => setCvData({
                      ...cvData,
                      education: { ...cvData.education, college: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="course">Course</Label>
                  <Input
                    id="course"
                    value={cvData.education.course}
                    onChange={(e) => setCvData({
                      ...cvData,
                      education: { ...cvData.education, course: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    value={cvData.education.year}
                    onChange={(e) => setCvData({
                      ...cvData,
                      education: { ...cvData.education, year: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label htmlFor="cgpa">CGPA</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.1"
                    value={cvData.education.cgpa}
                    onChange={(e) => setCvData({
                      ...cvData,
                      education: { ...cvData.education, cgpa: parseFloat(e.target.value) || 0 }
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button onClick={addSkill}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {skill}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => removeSkill(skill)}
                    />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projects</CardTitle>
              <Button onClick={addProject} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {cvData.projects.map((project, index) => (
                <div key={index} className="border rounded p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Project {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProject(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Project title"
                      value={project.title}
                      onChange={(e) => updateProject(index, 'title', e.target.value)}
                    />
                    <Input
                      placeholder="Project link"
                      value={project.link}
                      onChange={(e) => updateProject(index, 'link', e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="Start date"
                      value={project.startDate}
                      onChange={(e) => updateProject(index, 'startDate', e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="End date"
                      value={project.endDate}
                      onChange={(e) => updateProject(index, 'endDate', e.target.value)}
                    />
                  </div>
                  <Textarea
                    placeholder="Project description"
                    value={project.description}
                    onChange={(e) => updateProject(index, 'description', e.target.value)}
                  />
                  <Input
                    placeholder="Technologies (comma-separated)"
                    value={project.technologies.join(', ')}
                    onChange={(e) => updateProject(index, 'technologies', e.target.value.split(',').map(t => t.trim()))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Experience */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Work Experience</CardTitle>
              <Button onClick={addExperience} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {cvData.experiences.map((experience, index) => (
                <div key={index} className="border rounded p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Experience {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExperience(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Company"
                      value={experience.company}
                      onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    />
                    <Input
                      placeholder="Role"
                      value={experience.role}
                      onChange={(e) => updateExperience(index, 'role', e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="Start date"
                      value={experience.startDate}
                      onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="End date"
                      value={experience.endDate}
                      onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                      disabled={experience.current}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={experience.current}
                      onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                    />
                    <Label>Currently working here</Label>
                  </div>
                  <Textarea
                    placeholder="Job description"
                    value={experience.description}
                    onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Certifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Certifications</CardTitle>
              <Button onClick={addCertification} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {cvData.certifications.map((certification, index) => (
                <div key={index} className="border rounded p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium">Certification {index + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCertification(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      placeholder="Certification name"
                      value={certification.name}
                      onChange={(e) => updateCertification(index, 'name', e.target.value)}
                    />
                    <Input
                      placeholder="Issuing organization"
                      value={certification.issuer}
                      onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="Date obtained"
                      value={certification.dateObtained}
                      onChange={(e) => updateCertification(index, 'dateObtained', e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="Expiry date"
                      value={certification.expiryDate}
                      onChange={(e) => updateCertification(index, 'expiryDate', e.target.value)}
                    />
                    <Input
                      placeholder="Credential ID"
                      value={certification.credentialId}
                      onChange={(e) => updateCertification(index, 'credentialId', e.target.value)}
                    />
                    <Input
                      placeholder="Credential URL"
                      value={certification.credentialUrl}
                      onChange={(e) => updateCertification(index, 'credentialUrl', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
