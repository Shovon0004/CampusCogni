"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { BackgroundPaths } from "@/components/background-paths"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, ChevronRight, Download, Eye, Plus, X } from "lucide-react"

interface CVStep {
  id: string
  title: string
  description: string
}

const cvSteps: CVStep[] = [
  { id: "education", title: "Education", description: "Add your educational background" },
  { id: "skills", title: "Skills", description: "List your technical and soft skills" },
  { id: "projects", title: "Projects", description: "Showcase your projects and achievements" },
  { id: "certifications", title: "Certifications", description: "Add your certifications and courses" },
  { id: "experience", title: "Work Experience", description: "Include internships and work experience" },
]

export default function CVBuilderPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [skills, setSkills] = useState<string[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [certifications, setCertifications] = useState<any[]>([])
  const [experiences, setExperiences] = useState<any[]>([])

  const progress = ((currentStep + 1) / cvSteps.length) * 100

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill])
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const addProject = () => {
    setProjects([...projects, { title: "", description: "", technologies: "", link: "" }])
  }

  const addCertification = () => {
    setCertifications([...certifications, { name: "", issuer: "", date: "" }])
  }

  const addExperience = () => {
    setExperiences([...experiences, { company: "", role: "", duration: "", description: "" }])
  }

  const handleNext = () => {
    if (currentStep < cvSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    toast({
      title: "CV Created Successfully!",
      description: "Your CV has been saved. Redirecting to dashboard...",
    })
    setTimeout(() => {
      router.push("/student/dashboard")
    }, 2000)
  }

  const renderStepContent = () => {
    const step = cvSteps[currentStep]

    switch (step.id) {
      case "education":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="degree">Degree</Label>
                <Input id="degree" placeholder="Bachelor of Technology" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="major">Major/Field</Label>
                <Input id="major" placeholder="Computer Science" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="university">University/College</Label>
              <Input id="university" placeholder="Massachusetts Institute of Technology" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year</Label>
                <Input id="graduationYear" type="number" placeholder="2024" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gpa">GPA/CGPA</Label>
                <Input id="gpa" type="number" step="0.01" placeholder="8.5" />
              </div>
            </div>
          </div>
        )

      case "skills":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="skillInput">Add Skills</Label>
              <div className="flex gap-2">
                <Input
                  id="skillInput"
                  placeholder="e.g., JavaScript, Python, React"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addSkill(e.currentTarget.value)
                      e.currentTarget.value = ""
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("skillInput") as HTMLInputElement
                    addSkill(input.value)
                    input.value = ""
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                  <Button size="sm" variant="ghost" className="h-4 w-4 p-0" onClick={() => removeSkill(skill)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )

      case "projects":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Projects</h3>
              <Button onClick={addProject} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Project
              </Button>
            </div>
            {projects.map((project, index) => (
              <Card key={index}>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Project Title</Label>
                      <Input placeholder="E-commerce Website" />
                    </div>
                    <div className="space-y-2">
                      <Label>Technologies Used</Label>
                      <Input placeholder="React, Node.js, MongoDB" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe your project..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Project Link (Optional)</Label>
                    <Input placeholder="https://github.com/username/project" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {projects.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No projects added yet. Click "Add Project" to get started.
              </div>
            )}
          </div>
        )

      case "certifications":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Certifications</h3>
              <Button onClick={addCertification} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Certification
              </Button>
            </div>
            {certifications.map((cert, index) => (
              <Card key={index}>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Certification Name</Label>
                      <Input placeholder="AWS Certified Developer" />
                    </div>
                    <div className="space-y-2">
                      <Label>Issuing Organization</Label>
                      <Input placeholder="Amazon Web Services" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Date Obtained</Label>
                    <Input type="date" />
                  </div>
                </CardContent>
              </Card>
            ))}
            {certifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No certifications added yet. Click "Add Certification" to get started.
              </div>
            )}
          </div>
        )

      case "experience":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <Button onClick={addExperience} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Experience
              </Button>
            </div>
            {experiences.map((exp, index) => (
              <Card key={index}>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company</Label>
                      <Input placeholder="Google Inc." />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Input placeholder="Software Engineering Intern" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input placeholder="June 2023 - August 2023" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe your role and achievements..." />
                  </div>
                </CardContent>
              </Card>
            ))}
            {experiences.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No experience added yet. Click "Add Experience" to get started.
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <BackgroundPaths />
      <FloatingNavbar userRole="USER" userName="John Doe" />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="backdrop-blur-sm bg-background/95">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">CV Builder</CardTitle>
                  <CardDescription>
                    Step {currentStep + 1} of {cvSteps.length}: {cvSteps[currentStep].description}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Progress value={progress} className="mt-4" />
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex justify-center">
                <div className="flex items-center space-x-2">
                  {cvSteps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          index <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index < cvSteps.length - 1 && (
                        <div className={`w-8 h-0.5 ${index < currentStep ? "bg-primary" : "bg-muted"}`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-h-[400px]">
                <h2 className="text-xl font-semibold mb-4">{cvSteps[currentStep].title}</h2>
                {renderStepContent()}
              </div>

              <div className="flex justify-between">
                <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                {currentStep === cvSteps.length - 1 ? (
                  <Button onClick={handleFinish}>Finish & Save CV</Button>
                ) : (
                  <Button onClick={handleNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
