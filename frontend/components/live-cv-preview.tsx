"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Github, 
  Linkedin,
  Calendar,
  Building,
  GraduationCap,
  Award,
  Star
} from 'lucide-react';

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa: string;
  achievements: string[];
}

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
  achievements: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link: string;
  startDate: string;
  endDate: string;
}

interface CVData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: string[];
  languages: string[];
  certifications: string[];
}

interface LiveCVPreviewProps {
  cvData: CVData;
  isUpdating?: boolean;
}

export function LiveCVPreview({ cvData, isUpdating = false }: LiveCVPreviewProps) {
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Present';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const getDateRange = (startDate: string, endDate: string) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);
    return `${start} - ${end}`;
  };

  return (
    <Card className={`w-full max-w-4xl mx-auto backdrop-blur-sm bg-background/95 transition-all duration-300 ${
      isUpdating ? 'ring-2 ring-blue-500 ring-opacity-50 shadow-lg' : ''
    }`}>
      <CardContent className="p-8 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className={`transition-all duration-500 ${isUpdating ? 'animate-pulse' : ''}`}>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {cvData.personalInfo.name || 'Your Name'}
            </h1>
            {cvData.personalInfo.summary && (
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2 max-w-3xl mx-auto">
                {cvData.personalInfo.summary}
              </p>
            )}
          </div>
          
          {/* Contact Information */}
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600 dark:text-gray-300">
            {cvData.personalInfo.email && (
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                {cvData.personalInfo.email}
              </div>
            )}
            {cvData.personalInfo.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                {cvData.personalInfo.phone}
              </div>
            )}
            {cvData.personalInfo.address && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {cvData.personalInfo.address}
              </div>
            )}
            {cvData.personalInfo.website && (
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                {cvData.personalInfo.website}
              </div>
            )}
            {cvData.personalInfo.linkedin && (
              <div className="flex items-center gap-1">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </div>
            )}
            {cvData.personalInfo.github && (
              <div className="flex items-center gap-1">
                <Github className="h-4 w-4" />
                GitHub
              </div>
            )}
          </div>
        </div>

        {/* Education Section */}
        {cvData.education.length > 0 && (
          <div className={`transition-all duration-500 ${isUpdating ? 'animate-pulse' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Education</h2>
            </div>
            <div className="space-y-4">
              {cvData.education.map((edu) => (
                <div key={edu.id} className="border-l-2 border-blue-200 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {edu.degree} {edu.field && `in ${edu.field}`}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">{edu.school}</p>
                      {edu.gpa && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">GPA: {edu.gpa}</p>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {getDateRange(edu.startDate, edu.endDate)}
                    </div>
                  </div>
                  {edu.achievements.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                      {edu.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience Section */}
        {cvData.experience.length > 0 && (
          <div className={`transition-all duration-500 ${isUpdating ? 'animate-pulse' : ''}`}>
            <Separator className="my-6" />
            <div className="flex items-center gap-2 mb-4">
              <Building className="h-5 w-5 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Experience</h2>
            </div>
            <div className="space-y-6">
              {cvData.experience.map((exp) => (
                <div key={exp.id} className="border-l-2 border-green-200 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {exp.position}
                      </h3>
                      <p className="text-green-600 dark:text-green-400 font-medium">{exp.company}</p>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {getDateRange(exp.startDate, exp.endDate)}
                    </div>
                  </div>
                  {exp.description && (
                    <p className="mt-2 text-gray-600 dark:text-gray-300">{exp.description}</p>
                  )}
                  {exp.achievements.length > 0 && (
                    <ul className="mt-2 text-sm text-gray-600 dark:text-gray-300 list-disc list-inside">
                      {exp.achievements.map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Section */}
        {cvData.projects.length > 0 && (
          <div className={`transition-all duration-500 ${isUpdating ? 'animate-pulse' : ''}`}>
            <Separator className="my-6" />
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h2>
            </div>
            <div className="space-y-4">
              {cvData.projects.map((project) => (
                <div key={project.id} className="border-l-2 border-purple-200 pl-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      {project.description && (
                        <p className="text-gray-600 dark:text-gray-300 mt-1">{project.description}</p>
                      )}
                      {project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {(project.startDate || project.endDate) && (
                      <div className="text-sm text-gray-500 flex items-center gap-1 ml-4">
                        <Calendar className="h-4 w-4" />
                        {getDateRange(project.startDate, project.endDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Section */}
        {cvData.skills.length > 0 && (
          <div className={`transition-all duration-500 ${isUpdating ? 'animate-pulse' : ''}`}>
            <Separator className="my-6" />
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-orange-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Skills</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {cvData.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Languages and Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Languages */}
          {cvData.languages.length > 0 && (
            <div className={`transition-all duration-500 ${isUpdating ? 'animate-pulse' : ''}`}>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Languages</h2>
              <div className="space-y-2">
                {cvData.languages.map((language, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-700 dark:text-gray-300">{language}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {cvData.certifications.length > 0 && (
            <div className={`transition-all duration-500 ${isUpdating ? 'animate-pulse' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Certifications</h2>
              </div>
              <div className="space-y-2">
                {cvData.certifications.map((cert, index) => (
                  <div key={index} className="text-gray-700 dark:text-gray-300">
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Live Update Indicator */}
        {isUpdating && (
          <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              Updating CV...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
