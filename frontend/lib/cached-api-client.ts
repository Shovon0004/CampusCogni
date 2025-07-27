import { getApiUrl } from './config';
import { dataCache, userCache, CacheKeys, invalidateUserData, invalidateJobsData } from './cache';

// Cached API Client with Smart Fetching
class CachedApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = getApiUrl();
  }

  private async fetchWithCache<T>(
    endpoint: string,
    cacheKey: string,
    options: RequestInit = {},
    cacheTTL?: number
  ): Promise<T> {
    // Try to get from cache first
    const cached = dataCache.get<T>(cacheKey);
    const isStale = dataCache.isStale(cacheKey);
    
    // If we have fresh data, return it
    if (cached && !isStale) {
      return cached;
    }
    
    // If we have stale data, return it but refresh in background
    if (cached && isStale) {
      console.log(`🔄 Background refresh for: ${cacheKey}`);
      this.backgroundRefresh(endpoint, cacheKey, options, cacheTTL);
      return cached;
    }
    
    // No cached data, fetch fresh
    return this.fetchFresh(endpoint, cacheKey, options, cacheTTL);
  }

  private async fetchFresh<T>(
    endpoint: string,
    cacheKey: string,
    options: RequestInit = {},
    cacheTTL?: number
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the fresh data
      dataCache.set(cacheKey, data, cacheTTL);
      
      return data;
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  private async backgroundRefresh<T>(
    endpoint: string,
    cacheKey: string,
    options: RequestInit = {},
    cacheTTL?: number
  ): Promise<void> {
    try {
      // Fetch fresh data in background
      setTimeout(async () => {
        await this.fetchFresh(endpoint, cacheKey, options, cacheTTL);
        console.log(`✅ Background refresh completed for: ${cacheKey}`);
      }, 100); // Small delay to not block current request
    } catch (error) {
      console.error(`Background refresh failed for ${cacheKey}:`, error);
    }
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // User Profile Methods
  async getUserProfile(userId: string, forceRefresh = false): Promise<any> {
    const cacheKey = CacheKeys.USER_PROFILE(userId);
    
    if (forceRefresh) {
      dataCache.invalidate(cacheKey);
    }

    return this.fetchWithCache(
      `/api/students/${userId}`,
      cacheKey,
      {},
      30 * 60 * 1000 // Increased to 30 minutes for user profiles
    );
  }

  async updateUserProfile(userId: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/students/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Invalidate related cache entries
      invalidateUserData(userId);
      
      return result;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  }

  // Jobs Methods
  async getJobs(page = 1, filters?: any, forceRefresh = false): Promise<any> {
    const filterKey = filters ? JSON.stringify(filters) : 'all';
    const cacheKey = CacheKeys.JOBS_LIST(page, filterKey);
    
    if (forceRefresh) {
      dataCache.invalidate(cacheKey);
    }
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      ...(filters && Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== null && v !== undefined)
      ))
    });
    
    return this.fetchWithCache(
      `/api/jobs?${queryParams}`,
      cacheKey,
      {},
      15 * 60 * 1000 // Increased to 15 minutes for job listings
    );
  }

  async getJobDetail(jobId: string, forceRefresh = false): Promise<any> {
    const cacheKey = CacheKeys.JOB_DETAIL(jobId);
    
    if (forceRefresh) {
      dataCache.invalidate(cacheKey);
    }
    
    return this.fetchWithCache(
      `/api/jobs/${jobId}`,
      cacheKey,
      {},
      5 * 60 * 1000 // 5 minutes
    );
  }

  // Applications Methods
  async getUserApplications(userId: string, forceRefresh = false): Promise<any> {
    const cacheKey = CacheKeys.USER_APPLICATIONS(userId);
    
    if (forceRefresh) {
      dataCache.invalidate(cacheKey);
    }
    
    return this.fetchWithCache(
      `/api/applications?userId=${userId}`,
      cacheKey,
      {},
      5 * 60 * 1000 // 5 minutes
    );
  }

  async applyToJob(jobId: string, userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/jobs/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify({ 
          coverLetter: '' // Default empty cover letter for now
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Create a custom error object with details for eligibility issues
        const error = new Error(errorData.error || `HTTP error! status: ${response.status}`);
        (error as any).details = errorData.details || [];
        throw error;
      }

      const result = await response.json();
      
      // Invalidate related cache entries
      dataCache.invalidate(CacheKeys.USER_APPLICATIONS(userId));
      dataCache.invalidate(CacheKeys.DASHBOARD_STATS(userId, 'user'));
      invalidateJobsData(); // Job application counts might change
      
      return result;
    } catch (error) {
      console.error('Failed to apply to job:', error);
      throw error;
    }
  }

  // Dashboard Methods
  async getDashboardStats(userId: string, role: string, forceRefresh = false): Promise<any> {
    const cacheKey = CacheKeys.DASHBOARD_STATS(userId, role);
    
    if (forceRefresh) {
      dataCache.invalidate(cacheKey);
    }
    
    // Use the correct endpoint that exists in the backend
    const endpoint = `/api/students/${userId}/stats`;
    
    try {
      const response = await this.fetchWithCache(
        endpoint,
        cacheKey,
        {},
        2 * 60 * 1000 // 2 minutes for dashboard stats
      );
      
      // Transform the backend response to match frontend expectations
      return {
        totalApplications: (response as any).applications || 0,
        interviewsScheduled: (response as any).interviews || 0,
        savedJobs: 0, // TODO: Implement saved jobs functionality
        profileViews: (response as any).profileViews || 0,
        cvDownloads: (response as any).cvDownloads || 0
      };
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Return fallback stats if the request fails
      return {
        totalApplications: 0,
        interviewsScheduled: 0,
        savedJobs: 0,
        profileViews: 0,
        cvDownloads: 0
      };
    }
  }

  // Recruiter Methods
  async getRecruiterProfile(userId: string, forceRefresh = false): Promise<any> {
    const cacheKey = CacheKeys.RECRUITER_PROFILE(userId);
    
    if (forceRefresh) {
      dataCache.invalidate(cacheKey);
    }
    
    return this.fetchWithCache(
      `/api/recruiters/${userId}`,
      cacheKey,
      {},
      10 * 60 * 1000 // 10 minutes
    );
  }

  async getRecruiterJobs(userId: string, forceRefresh = false): Promise<any> {
    const cacheKey = CacheKeys.RECRUITER_JOBS(userId);
    
    if (forceRefresh) {
      dataCache.invalidate(cacheKey);
    }
    
    return this.fetchWithCache(
      `/api/recruiters/${userId}/jobs`,
      cacheKey,
      {},
      5 * 60 * 1000 // 5 minutes
    );
  }

  // Get recruiter applications
  async getRecruiterApplications(recruiterId: string, forceRefresh = false): Promise<any> {
    const cacheKey = `recruiter_applications_${recruiterId}`;
    
    if (forceRefresh) {
      dataCache.invalidate(cacheKey);
    }
    
    return this.fetchWithCache(
      `/api/applications/recruiter/${recruiterId}`,
      cacheKey,
      {},
      2 * 60 * 1000 // 2 minutes
    );
  }

  // Update application status
  async updateApplicationStatus(applicationId: string, status: string): Promise<any> {
    const response = await this.fetchFresh(
      `/api/applications/${applicationId}/status`,
      `application_status_${applicationId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }
    );

    // Invalidate related cache
    const recruiterId = this.getCurrentUserId();
    if (recruiterId) {
      dataCache.invalidate(`recruiter_applications_${recruiterId}`);
    }
    
    return response;
  }

  // User role management
  async updateUserRole(userId: string, currentRole: string): Promise<any> {
    const response = await this.fetchFresh(
      `/auth/update-role`,
      `user_role_update_${userId}`,
      {
        method: 'POST',
        body: JSON.stringify({ userId, currentRole }),
      }
    );

    // Invalidate user-related cache after role update
    this.refreshUserData(userId);
    
    return response;
  }

  // Utility Methods
  private getCurrentUserId(): string | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        try {
          return JSON.parse(userData).id;
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  // Cache management methods
  clearAllCache(): void {
    dataCache.clear();
    userCache.clear();
  }

  getCacheStats(): any {
    return {
      dataCache: dataCache.getStats(),
      userCache: userCache.getStats(),
    };
  }

  // Force refresh specific data
  refreshUserData(userId: string): void {
    invalidateUserData(userId);
  }

  refreshJobsData(): void {
    invalidateJobsData();
  }
}

export const cachedApiClient = new CachedApiClient();
