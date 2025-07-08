"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, X, Mail, Phone, MapPin, Calendar, ExternalLink } from "lucide-react"

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
    link?: string
    startDate?: string
    endDate?: string
  }>
  experiences: Array<{
    company: string
    role: string
    description?: string
    startDate: string
    endDate?: string
    current: boolean
  }>
  certifications: Array<{
    name: string
    issuer: string
    dateObtained: string
    expiryDate?: string
    credentialId?: string
    credentialUrl?: string
  }>
}

interface CVPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  cvData: CVData | null
  onDownload: () => void
}

export function CVPreviewModal({ isOpen, onClose, cvData, onDownload }: CVPreviewModalProps) {
  if (!cvData) return null

  const formatDate = (dateString: string) => {
    if (!dateString) return ""
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>CV Preview</DialogTitle>
          <div className="flex gap-2">
            <Button onClick={onDownload} size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="cv-preview bg-white text-black p-8 min-h-[800px]">
          {/* Header */}
          <div className="border-b border-gray-300 pb-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {cvData.personalInfo.email}
              </div>
              {cvData.personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  {cvData.personalInfo.phone}
                </div>
              )}
              {cvData.personalInfo.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {cvData.personalInfo.location}
                </div>
              )}
            </div>
            {cvData.personalInfo.bio && (
              <p className="text-gray-700 leading-relaxed">{cvData.personalInfo.bio}</p>
            )}
          </div>

          {/* Education */}
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
              Education
            </h2>
            <div>
              <h3 className="font-semibold text-gray-900">{cvData.education.course}</h3>
              <p className="text-gray-700">{cvData.education.college}</p>
              <p className="text-sm text-gray-600">
                {cvData.education.year} Year • CGPA: {cvData.education.cgpa}/10.0
              </p>
            </div>
          </div>

          {/* Skills */}
          {cvData.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {cvData.skills.map((skill, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {cvData.experiences.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Experience
              </h2>
              <div className="space-y-4">
                {cvData.experiences.map((exp, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">{exp.role}</h3>
                      <span className="text-sm text-gray-600">
                        {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate || '')}
                      </span>
                    </div>
                    <p className="text-gray-700 font-medium mb-1">{exp.company}</p>
                    {exp.description && (
                      <p className="text-gray-600 text-sm leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {cvData.projects.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Projects
              </h2>
              <div className="space-y-4">
                {cvData.projects.map((project, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{project.title}</h3>
                        {project.link && (
                          <ExternalLink className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      {project.startDate && (
                        <span className="text-sm text-gray-600">
                          {formatDate(project.startDate)} - {project.endDate ? formatDate(project.endDate) : 'Present'}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed mb-2">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.map((tech, techIndex) => (
                          <span 
                            key={techIndex}
                            className="px-2 py-1 bg-gray-50 text-gray-600 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {cvData.certifications.length > 0 && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-200 pb-1">
                Certifications
              </h2>
              <div className="space-y-3">
                {cvData.certifications.map((cert, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                      <span className="text-sm text-gray-600">{formatDate(cert.dateObtained)}</span>
                    </div>
                    <p className="text-gray-700 text-sm">{cert.issuer}</p>
                    {cert.credentialId && (
                      <p className="text-gray-500 text-xs">ID: {cert.credentialId}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
