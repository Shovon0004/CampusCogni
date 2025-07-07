"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { GeometricBackground } from "@/components/geometric-background"
import { FloatingNavbar } from "@/components/floating-navbar"
import { useToast } from "@/hooks/use-toast"
import { User, Mail, Phone, MapPin, GraduationCap, Award, Briefcase, Edit, Save, Download, Eye } from "lucide-react"

export default function StudentProfilePage() {
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@college.edu",
    phone: "+1 (555) 123-4567",
    college: "Massachusetts Institute of Technology",
    course: "Computer Science",
    year: "3rd Year",
    cgpa: "8.5",
    location: "Boston, MA",
    bio: "Passionate computer science student with experience in full-stack development and machine learning.",
  })

  const skills = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "Machine Learning",
    "SQL",
    "Git",
    "AWS",
    "Docker",
    "TypeScript",
  ]

  const projects = [
    {
      title: "E-commerce Platform",
      description: "Full-stack web application built with React and Node.js",
      technologies: ["React", "Node.js", "MongoDB", "Express"],
      link: "https://github.com/johndoe/ecommerce",
    },
    {
      title: "ML Recommendation System",
      description: "Machine-learning model for product recommendations",
      technologies: ["Python", "TensorFlow", "Pandas"],
      link: "https://github.com/johndoe/ml-recommender",
    },
  ]

  const experience = [
    {
      company: "Tech Startup Inc.",
      role: "Software Development Intern",
      duration: "Jun 2023 – Aug 2023",
      description: "Developed web applications using React and Node.js; collaborated with cross-functional teams.",
    },
  ]

  const handleSave = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsEditing(false)
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      })
    }, 1200)
  }

  const handleDownloadCV = () => {
    toast({
      title: "CV Downloaded",
      description: "Your CV has been downloaded successfully.",
    })
  }

  return (
    <div className="min-h-screen">
      <GeometricBackground />
      <FloatingNavbar userRole="student" userName="John Doe" />

      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">My Profile</h1>
              <p className="text-xl text-muted-foreground">Manage your profile information and CV</p>
            </div>
            <div className="flex gap-3 mt-6 md:mt-0">
              <Button
                variant="outline"
                onClick={handleDownloadCV}
                className="bg-background/50 hover:bg-background/70 border-border/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download CV
              </Button>
              <Button variant="outline" className="bg-background/50 hover:bg-background/70 border-border/50">
                <Eye className="h-4 w-4 mr-2" />
                Preview CV
              </Button>
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <Button onClick={handleSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving…" : "Save Changes"}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-6">
                    <AvatarImage src="/placeholder.svg" alt="Profile" />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">JD</AvatarFallback>
                  </Avatar>
                  <h2 className="text-2xl font-bold mb-1">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {profile.course} • {profile.year}
                  </p>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      <span>{profile.college}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Award className="h-4 w-4" />
                      <span>CGPA: {profile.cgpa}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Applications</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interviews</span>
                    <span className="font-semibold">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profile Views</span>
                    <span className="font-semibold">45</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CV Downloads</span>
                    <span className="font-semibold">8</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Personal Info */}
              <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { label: "First Name", id: "firstName", value: profile.firstName },
                        { label: "Last Name", id: "lastName", value: profile.lastName },
                      ].map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id}>{field.label}</Label>
                          <Input
                            id={field.id}
                            value={field.value}
                            onChange={(e) => setProfile({ ...profile, [field.id]: e.target.value })}
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                      ))}
                      {[
                        { label: "Email", id: "email", value: profile.email, type: "email" },
                        { label: "Phone", id: "phone", value: profile.phone },
                      ].map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label htmlFor={field.id}>{field.label}</Label>
                          <Input
                            id={field.id}
                            type={field.type ?? "text"}
                            value={field.value}
                            onChange={(e) => setProfile({ ...profile, [field.id]: e.target.value })}
                            className="bg-background/50 border-border/50"
                          />
                        </div>
                      ))}
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          rows={3}
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          className="bg-background/50 border-border/50"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{profile.phone}</span>
                        </div>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Projects */}
              <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {projects.map((project) => (
                    <div key={project.title} className="border rounded-lg p-6 bg-background/40">
                      <h4 className="font-semibold text-lg mb-2">{project.title}</h4>
                      <p className="text-muted-foreground mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.technologies.map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                      <Button variant="link" className="p-0 h-auto text-primary">
                        View Project →
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Experience */}
              <Card className="bg-background/60 backdrop-blur-xl border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Experience
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {experience.map((exp) => (
                    <div key={exp.company} className="border rounded-lg p-6 bg-background/40">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold">{exp.role}</h4>
                          <p className="text-primary font-medium">{exp.company}</p>
                        </div>
                        <Badge variant="outline">{exp.duration}</Badge>
                      </div>
                      <p className="text-muted-foreground">{exp.description}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
