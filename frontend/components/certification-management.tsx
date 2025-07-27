'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Award, Calendar, Link as LinkIcon, X, ExternalLink } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cachedApiClient } from '@/lib/cached-api-client'
import { toast } from 'sonner'

interface Certification {
  id: string
  name: string
  issuer: string
  issueDate?: string      // Frontend display name
  dateObtained?: string   // Backend field name
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
}

interface CertificationFormData {
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  credentialId: string
  credentialUrl: string
}

interface CertificationManagementProps {
  studentId: string
  certifications: Certification[]
  onCertificationsUpdate: (certifications: Certification[]) => void
  isEditing?: boolean
}

export default function CertificationManagement({ studentId, certifications, onCertificationsUpdate, isEditing = false }: CertificationManagementProps) {
  const [isAddingCertification, setIsAddingCertification] = useState(false)
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null)
  const [formData, setFormData] = useState<CertificationFormData>({
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const resetForm = () => {
    setFormData({
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: ''
    })
  }

  const handleStartAdd = () => {
    resetForm()
    setIsAddingCertification(true)
  }

  const handleStartEdit = (certification: Certification) => {
    setFormData({
      name: certification.name,
      issuer: certification.issuer,
      // Use dateObtained if available, otherwise fall back to issueDate
      issueDate: (certification.dateObtained || certification.issueDate) 
        ? new Date(certification.dateObtained || certification.issueDate as string).toISOString().split('T')[0] 
        : '',
      expiryDate: certification.expiryDate 
        ? new Date(certification.expiryDate).toISOString().split('T')[0] 
        : '',
      credentialId: certification.credentialId || '',
      credentialUrl: certification.credentialUrl || ''
    })
    setEditingCertification(certification)
  }

  const handleCancel = () => {
    setIsAddingCertification(false)
    setEditingCertification(null)
    resetForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.issuer) {
      toast.error('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    try {
      const certificationData = {
        studentId,
        name: formData.name,
        issuer: formData.issuer,
        // Pass both fields for compatibility - backend uses dateObtained
        issueDate: formData.issueDate || new Date().toISOString().split('T')[0],
        dateObtained: formData.issueDate || new Date().toISOString().split('T')[0],
        expiryDate: formData.expiryDate || undefined,
        credentialId: formData.credentialId || undefined,
        credentialUrl: formData.credentialUrl || undefined
      }

      let result: Certification
      if (editingCertification) {
        result = await cachedApiClient.updateCertification(editingCertification.id, certificationData)
        const updatedCertifications = certifications.map(c => c.id === editingCertification.id ? result : c)
        onCertificationsUpdate(updatedCertifications)
        toast.success('Certification updated successfully')
      } else {
        result = await cachedApiClient.createCertification(certificationData)
        onCertificationsUpdate([...certifications, result])
        toast.success('Certification added successfully')
      }

      handleCancel()
    } catch (error) {
      console.error('Error saving certification:', error)
      toast.error('Failed to save certification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (certification: Certification) => {
    if (!confirm('Are you sure you want to delete this certification?')) return

    setIsLoading(true)
    try {
      await cachedApiClient.deleteCertification(certification.id)
      const updatedCertifications = certifications.filter(c => c.id !== certification.id)
      onCertificationsUpdate(updatedCertifications)
      toast.success('Certification deleted successfully')
    } catch (error) {
      console.error('Error deleting certification:', error)
      toast.error('Failed to delete certification')
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

  const isExpired = (expiryDate: string) => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const now = new Date()
    const monthsUntilExpiry = (expiry.getFullYear() - now.getFullYear()) * 12 + (expiry.getMonth() - now.getMonth())
    return monthsUntilExpiry <= 3 && monthsUntilExpiry > 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Certifications</h3>
        {isEditing && (
          <Button 
            onClick={handleStartAdd}
            size="sm"
            className="gap-2"
            disabled={isAddingCertification || editingCertification !== null}
          >
            <Plus className="h-4 w-4" />
            Add Certification
          </Button>
        )}
      </div>

      <AnimatePresence>
        {(isAddingCertification || editingCertification) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border rounded-lg p-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium">
                  {editingCertification ? 'Edit Certification' : 'Add New Certification'}
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
                  <Label htmlFor="name">Certification Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., AWS Solutions Architect, Google Cloud Professional"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="issuer">Issuing Organization *</Label>
                  <Input
                    id="issuer"
                    value={formData.issuer}
                    onChange={(e) => setFormData(prev => ({ ...prev, issuer: e.target.value }))}
                    placeholder="e.g., Amazon Web Services, Google, Microsoft"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, issueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Leave empty if certification doesn't expire
                  </p>
                </div>

                <div>
                  <Label htmlFor="credentialId">Credential ID</Label>
                  <Input
                    id="credentialId"
                    value={formData.credentialId}
                    onChange={(e) => setFormData(prev => ({ ...prev, credentialId: e.target.value }))}
                    placeholder="e.g., ABC123XYZ, Certificate Number"
                  />
                </div>

                <div>
                  <Label htmlFor="credentialUrl">Credential URL</Label>
                  <Input
                    id="credentialUrl"
                    type="url"
                    value={formData.credentialUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, credentialUrl: e.target.value }))}
                    placeholder="https://www.credential-verification-url.com"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingCertification ? 'Update Certification' : 'Add Certification'}
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
        {certifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No certifications added yet</p>
            <p className="text-sm">Add your professional certifications to showcase your expertise</p>
          </div>
        ) : (
          certifications.map((certification) => (
            <motion.div
              key={certification.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-lg font-semibold mb-1">{certification.name}</h4>
                      <p className="text-muted-foreground font-medium">{certification.issuer}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    {(certification.dateObtained || certification.issueDate) && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Issued {formatDate(certification.dateObtained || certification.issueDate as string)}
                      </div>
                    )}
                    {certification.expiryDate && (
                      <div className="flex items-center gap-2">
                        <span>Expires {formatDate(certification.expiryDate)}</span>
                        {isExpired(certification.expiryDate) && (
                          <Badge variant="destructive" className="text-xs">Expired</Badge>
                        )}
                        {isExpiringSoon(certification.expiryDate) && !isExpired(certification.expiryDate) && (
                          <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">Expiring Soon</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {certification.credentialId && (
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">ID:</span>
                        <code className="bg-muted px-2 py-1 rounded text-xs">{certification.credentialId}</code>
                      </div>
                    )}
                    {certification.credentialUrl && (
                      <a
                        href={certification.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <LinkIcon className="h-4 w-4" />
                        View Credential
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(certification)}
                      disabled={isAddingCertification || editingCertification !== null}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(certification)}
                      disabled={isLoading}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
