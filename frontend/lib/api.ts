import { getApiUrl, logApiConfig } from './config'

class ApiClient {
  private baseUrl = getApiUrl()

  constructor() {
    // Log the API configuration for debugging
    logApiConfig()
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`
    const token = localStorage.getItem('token')
    
    // Log API calls (always log to debug deployment issues)
    if (typeof window !== 'undefined') {
      console.log('🔗 API Request:', url)
    }
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: response.statusText }))
        
        // If user ID is invalid, clear cached auth data
        if (error.error === 'Invalid user ID format' || error.error === 'User not found') {
          localStorage.removeItem('token')
          localStorage.removeItem('userData')
          window.location.href = '/auth'
          return
        }
        
        throw new Error(error.error || `API Error: ${response.statusText}`)
      }

      return response.json()
    } catch (error) {
      // Handle network errors (CORS, connectivity issues)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.error('Network error - check if backend is running:', this.baseUrl)
        throw new Error('Unable to connect to server. Please check your internet connection and try again.')
      }
      throw error
    }
  }

  // Authentication
  async registerUser(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'USER' }),
    })
  }

  async registerRecruiter(data: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, role: 'RECRUITER' }),
    })
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUserRole(userId: string, oldRole?: string) {
    return this.request(`/recruiters/check-role/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ oldRole }),
    })
  }

  async debugUser(userId: string) {
    return this.request(`/auth/debug/${userId}`)
  }

  // User APIs
  async getUserProfile(id: string) {
    return this.request(`/students/${id}`)
  }

  async updateUserProfile(id: string, data: any) {
    return this.request(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getUserStats(userId: string) {
    return this.request(`/students/${userId}/stats`)
  }

  async getUserCV(userId: string) {
    return this.request(`/students/${userId}/cv`)
  }

  async updateUserCV(userId: string, cvData: any) {
    return this.request(`/students/${userId}/cv`, {
      method: 'PUT',
      body: JSON.stringify(cvData),
    })
  }

  async getUserApplications(userId: string) {
    return this.request(`/applications?userId=${userId}`)
  }

  // Job APIs
  async getJobs(filters?: any) {
    const params = new URLSearchParams(filters)
    return this.request(`/jobs?${params}`)
  }

  async getJob(id: string) {
    return this.request(`/jobs/${id}`)
  }

  async applyToJob(jobId: string, userId: string) {
    // Get user data to pass email
    const userData = localStorage.getItem('userData')
    const userEmail = userData ? JSON.parse(userData).email : null
    
    return this.request(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ userEmail, coverLetter: '' }),
    })
  }

  async createJob(jobData: any) {
    return this.request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    })
  }

  // Recruiter APIs
  async getRecruiterProfile(userId: string) {
    return this.request(`/recruiters/${userId}`)
  }

  async updateRecruiterProfile(userId: string, data: any) {
    return this.request(`/recruiters/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async getRecruiterJobs(recruiterId: string) {
    return this.request(`/recruiters/${recruiterId}/jobs`)
  }

  async getRecruiterApplications(recruiterId: string) {
    return this.request(`/applications?recruiterId=${recruiterId}`)
  }

  async getCollegeData() {
    return this.request('/colleges')
  }

  // Application APIs
  async updateApplicationStatus(applicationId: string, status: string) {
    return this.request(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    })
  }

  // AI Candidate Search
  async searchCandidates(prompt: string, mode: "normal" | "reasoning" = "normal") {
    return this.request('/ai-candidate-search', {
      method: 'POST',
      body: JSON.stringify({ prompt, mode }),
    })
  }

  // AI Profile Summary
  async getProfileSummary(candidate: any, prompt: string) {
    return this.request('/ai-profile-summary', {
      method: 'POST',
      body: JSON.stringify({ candidate, prompt }),
    })
  }
  
  // AI Candidate Comparison
  async compareCandidates(candidates: any[], prompt: string) {
    return this.request('/ai-candidate-compare', {
      method: 'POST',
      body: JSON.stringify({ candidates, prompt }),
    })
  }
  
  // Ask questions about candidates
  async askAboutCandidates(candidates: any[], question: string) {
    return this.request('/ai-candidate-qa', {
      method: 'POST',
      body: JSON.stringify({ candidates, question }),
    })
  }

  // File Upload
  async uploadFile(file: File, folder: string) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Upload failed')
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()
