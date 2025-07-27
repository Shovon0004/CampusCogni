'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Calendar, Building, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cachedApiClient } from '@/lib/cached-api-client'
import { toast } from 'sonner'

interface Experience {
  id: string
  company: string
  position?: string // Frontend display name
  role: string      // Backend field name
  description?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean // Frontend display name
  current: boolean    // Backend field name
}

interface ExperienceFormData {
  company: string
  position: string
  description: string
  startDate: string
  endDate: string
  isCurrent: boolean
}

interface ExperienceManagementProps {
  studentId: string
  experiences: Experience[]
  onExperiencesUpdate: (experiences: Experience[]) => void
  isEditing?: boolean
}

export default function ExperienceManagement({ studentId, experiences, onExperiencesUpdate, isEditing = false }: ExperienceManagementProps) {
  const [isAddingExperience, setIsAddingExperience] = useState(false)
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null)
  const [formData, setFormData] = useState<ExperienceFormData>({
    company: '',
    position: '',
    description: '',
    startDate: '',
    endDate: '',
    isCurrent: false
  })
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      description: '',
      startDate: '',
      endDate: '',
      isCurrent: false
    })
  }

  const handleStartAdd = () => {
    resetForm()
    setIsAddingExperience(true)
  }

  const handleStartEdit = (experience: Experience) => {
    setFormData({
      company: experience.company,
      position: experience.position || experience.role, // Use either position or role
      description: experience.description || '',
      startDate: experience.startDate ? new Date(experience.startDate).toISOString().split('T')[0] : '',
      endDate: experience.endDate ? new Date(experience.endDate).toISOString().split('T')[0] : '',
      isCurrent: experience.isCurrent !== undefined ? experience.isCurrent : experience.current // Use either isCurrent or current
    })
    setEditingExperience(experience)
  }

  const handleCancel = () => {
    setIsAddingExperience(false)
    setEditingExperience(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.company || !formData.position) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const experienceData = {
        studentId,
        company: formData.company,
        position: formData.position, // Backend expects 'position' field in request body
        description: formData.description || undefined, // Use undefined instead of null for optional fields
        startDate: formData.startDate || new Date().toISOString(), // Always provide a date
        endDate: formData.isCurrent ? undefined : (formData.endDate || undefined), // Use undefined instead of null
        isCurrent: formData.isCurrent // Backend expects 'isCurrent' field in request body
      }

      let result: Experience
      if (editingExperience) {
        result = await cachedApiClient.updateExperience(editingExperience.id, experienceData)
        const updatedExperiences = experiences.map(e => e.id === editingExperience.id ? result : e)
        onExperiencesUpdate(updatedExperiences)
        toast.success('Experience updated successfully')
      } else {
        result = await cachedApiClient.createExperience(experienceData)
        onExperiencesUpdate([...experiences, result])
        toast.success('Experience added successfully')
      }

      handleCancel()
    } catch (error) {
      console.error('Error saving experience:', error)
      toast.error('Failed to save experience')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (experience: Experience) => {
    if (!confirm('Are you sure you want to delete this experience?')) return

    setIsLoading(true)
    try {
      await cachedApiClient.deleteExperience(experience.id)
      const updatedExperiences = experiences.filter(e => e.id !== experience.id)
      onExperiencesUpdate(updatedExperiences)
      toast.success('Experience deleted successfully')
    } catch (error) {
      console.error('Error deleting experience:', error)
      toast.error('Failed to delete experience')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    })
  }

  const calculateDuration = (startDate: string, endDate: string | null, isCurrent: boolean) => {
    if (!startDate) return ''
    
    const start = new Date(startDate)
    const end = isCurrent ? new Date() : (endDate ? new Date(endDate) : new Date())
    
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth())
    
    if (months < 1) return '< 1 month'
    if (months < 12) return `${months} month${months === 1 ? '' : 's'}`
    
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    
    let duration = `${years} year${years === 1 ? '' : 's'}`
    if (remainingMonths > 0) {
      duration += ` ${remainingMonths} month${remainingMonths === 1 ? '' : 's'}`
    }
    
    return duration
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Work Experience</h3>
        {isEditing && (
          <Button 
            onClick={handleStartAdd}
            size="sm"
            className="gap-2"
            disabled={isAddingExperience || editingExperience !== null}
          >
            <Plus className="h-4 w-4" />
            Add Experience
          </Button>
        )}
      </div>

      <AnimatePresence>
        {(isAddingExperience || editingExperience) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border rounded-lg p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">
                  {editingExperience ? 'Edit Experience' : 'Add New Experience'}
                </h4>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="e.g., Google, Microsoft, Startup Inc."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="position">Job Title *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="e.g., Software Engineer, Marketing Intern"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    disabled={formData.isCurrent}
                  />
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isCurrent"
                      checked={formData.isCurrent}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          isCurrent: checked as boolean,
                          endDate: checked ? '' : prev.endDate
                        }))
                      }}
                    />
                    <Label htmlFor="isCurrent" className="text-sm font-normal">
                      I currently work here
                    </Label>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your responsibilities, achievements, and key projects..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingExperience ? 'Update Experience' : 'Add Experience'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {experiences.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No work experience added yet</p>
            <p className="text-sm">Add your professional experience to showcase your career</p>
          </div>
        ) : (
          experiences.map((experience) => (
            <motion.div
              key={experience.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">{experience.position || experience.role}</h4>
                  <div className="flex items-center gap-1 text-primary font-medium mb-2">
                    <Building className="h-4 w-4" />
                    {experience.company}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(experience.startDate ?? '')} - {
                        (experience.isCurrent || experience.current) ? 'Present' : formatDate(experience.endDate ?? '')
                      }
                    </div>
                    {experience.startDate && (
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {calculateDuration(experience.startDate ?? '', experience.endDate ?? null, experience.isCurrent || experience.current)}
                      </span>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(experience)}
                      disabled={isAddingExperience || editingExperience !== null}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(experience)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {experience.description && (
                <p className="text-muted-foreground whitespace-pre-wrap">{experience.description}</p>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
