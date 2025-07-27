'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Calendar, Link as LinkIcon, Code, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cachedApiClient } from '@/lib/cached-api-client'
import { toast } from 'sonner'

interface Project {
  id: string
  title: string
  description: string
  technologies: string[]
  link?: string
  startDate?: string
  endDate?: string
}

interface ProjectFormData {
  title: string
  description: string
  technologies: string[]
  link: string
  startDate: string
  endDate: string
}

interface ProjectManagementProps {
  studentId: string
  projects: Project[]
  onProjectsUpdate: (projects: Project[]) => void
  isEditing?: boolean
}

export default function ProjectManagement({ studentId, projects, onProjectsUpdate, isEditing = false }: ProjectManagementProps) {
  const [isAddingProject, setIsAddingProject] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    technologies: [],
    link: '',
    startDate: '',
    endDate: ''
  })
  const [currentTechnology, setCurrentTechnology] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      technologies: [],
      link: '',
      startDate: '',
      endDate: ''
    })
    setCurrentTechnology('')
  }

  const handleStartAdd = () => {
    resetForm()
    setIsAddingProject(true)
  }

  const handleStartEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      technologies: project.technologies || [],
      link: project.link || '',
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''
    })
    setEditingProject(project)
  }

  const handleCancel = () => {
    setIsAddingProject(false)
    setEditingProject(null)
    resetForm()
  }

  const addTechnology = () => {
    if (currentTechnology.trim() && !formData.technologies.includes(currentTechnology.trim())) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, currentTechnology.trim()]
      }))
      setCurrentTechnology('')
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.filter(t => t !== tech)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const projectData = {
        studentId,
        title: formData.title,
        description: formData.description,
        technologies: formData.technologies,
        link: formData.link || null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      }

      let result: Project;
      if (editingProject) {
        result = await cachedApiClient.updateProject(editingProject.id, projectData)
        const updatedProjects = projects.map(p => p.id === editingProject.id ? result : p)
        onProjectsUpdate(updatedProjects)
        toast.success('Project updated successfully')
      } else {
        result = await cachedApiClient.createProject(projectData)
        onProjectsUpdate([...projects, result])
        toast.success('Project added successfully')
      }

      handleCancel()
    } catch (error) {
      console.error('Error saving project:', error)
      toast.error('Failed to save project')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (project: Project) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    setIsLoading(true)
    try {
      await cachedApiClient.deleteProject(project.id)
      const updatedProjects = projects.filter(p => p.id !== project.id)
      onProjectsUpdate(updatedProjects)
      toast.success('Project deleted successfully')
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project')
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Projects</h3>
        {isEditing && (
          <Button 
            onClick={handleStartAdd}
            size="sm"
            className="gap-2"
            disabled={isAddingProject || editingProject !== null}
          >
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        )}
      </div>

      <AnimatePresence>
        {(isAddingProject || editingProject) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border rounded-lg p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
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
                <div className="md:col-span-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., E-commerce Website"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project, its features, and your role..."
                    rows={4}
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
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="link">Project Link</Label>
                  <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    placeholder="https://github.com/username/project or live demo URL"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Technologies Used</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={currentTechnology}
                      onChange={(e) => setCurrentTechnology(e.target.value)}
                      placeholder="e.g., React, Node.js, MongoDB"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTechnology}
                      disabled={!currentTechnology.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.technologies.map((tech, index) => (
                      <Badge key={index} variant="secondary" className="gap-1">
                        <Code className="h-3 w-3" />
                        {tech}
                        <button
                          type="button"
                          onClick={() => removeTechnology(tech)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingProject ? 'Update Project' : 'Add Project'}
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
        {projects.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No projects added yet</p>
            <p className="text-sm">Add your first project to showcase your work</p>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold mb-1">{project.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    {(project.startDate || project.endDate) && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(project.startDate ?? '')} 
                        {project.startDate && project.endDate && ' - '}
                        {formatDate(project.endDate ?? '')}
                      </div>
                    )}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <LinkIcon className="h-4 w-4" />
                        View Project
                      </a>
                    )}
                  </div>
                </div>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(project)}
                      disabled={isAddingProject || editingProject !== null}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(project)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-muted-foreground mb-3">{project.description}</p>

              {project.technologies && project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
