'use client'

// Smart Caching System with Live Updates
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  staleWhileRevalidate: boolean;
}

type CacheInvalidationCallback = (key: string) => void;

class SmartCache {
  private cache = new Map<string, CacheEntry<any>>();
  private invalidationCallbacks = new Set<CacheInvalidationCallback>();
  private refreshTimers = new Map<string, NodeJS.Timeout>();
  
  private config: CacheConfig = {
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
    staleWhileRevalidate: true
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // Set data in cache with custom TTL
  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const timeToLive = ttl || this.config.defaultTTL;
    
    // Clean old entries if cache is full
    if (this.cache.size >= this.config.maxSize) {
      this.cleanOldEntries();
    }
    
    // Clear existing refresh timer
    const existingTimer = this.refreshTimers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }
    
    // Set cache entry
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: timeToLive,
      key
    });
    
    console.log(`📋 Cached data for key: ${key} (TTL: ${timeToLive / 1000}s)`);
  }

  // Get data from cache
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    const age = now - entry.timestamp;
    
    // Data is fresh
    if (age < entry.ttl) {
      console.log(`📋 Cache hit for key: ${key} (age: ${Math.floor(age / 1000)}s)`);
      return entry.data;
    }
    
    // Data is stale
    if (this.config.staleWhileRevalidate) {
      console.log(`⏰ Returning stale data for key: ${key} (age: ${Math.floor(age / 1000)}s)`);
      return entry.data; // Return stale data while revalidating
    }
    
    // Remove expired entry
    this.cache.delete(key);
    console.log(`🗑️ Removed expired cache entry: ${key}`);
    return null;
  }

  // Check if data is stale (but might still return stale data)
  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    const now = Date.now();
    const age = now - entry.timestamp;
    return age >= entry.ttl;
  }

  // Invalidate specific cache entry
  invalidate(key: string): void {
    this.cache.delete(key);
    const timer = this.refreshTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.refreshTimers.delete(key);
    }
    
    // Notify listeners
    this.invalidationCallbacks.forEach(callback => callback(key));
    console.log(`🗑️ Invalidated cache entry: ${key}`);
  }

  // Invalidate by pattern
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];
    
    this.cache.forEach((_, key) => {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.invalidate(key));
    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.refreshTimers.forEach(timer => clearTimeout(timer));
    this.refreshTimers.clear();
    console.log('🗑️ Cache cleared');
  }

  // Clean old entries
  private cleanOldEntries(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Sort by age (oldest first)
    entries.sort(([,a], [,b]) => a.timestamp - b.timestamp);
    
    // Remove oldest 25% of entries
    const toRemove = entries.slice(0, Math.floor(entries.length * 0.25));
    
    toRemove.forEach(([key]) => {
      this.cache.delete(key);
    });
    
    console.log(`🗑️ Cleaned ${toRemove.length} old cache entries`);
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let fresh = 0;
    let stale = 0;
    
    this.cache.forEach(entry => {
      const age = now - entry.timestamp;
      if (age < entry.ttl) {
        fresh++;
      } else {
        stale++;
      }
    });
    
    return {
      total: this.cache.size,
      fresh,
      stale,
      maxSize: this.config.maxSize,
      hitRate: this.cache.size > 0 ? (fresh / this.cache.size) * 100 : 0
    };
  }

  // Subscribe to cache invalidation events
  onInvalidate(callback: CacheInvalidationCallback): () => void {
    this.invalidationCallbacks.add(callback);
    return () => this.invalidationCallbacks.delete(callback);
  }
}

// Create cache instances for different data types with optimized settings
export const dataCache = new SmartCache({
  defaultTTL: 10 * 60 * 1000, // Increased to 10 minutes for API data
  maxSize: 200, // Increased cache size for better performance
  staleWhileRevalidate: true
});

export const imageCache = new SmartCache({
  defaultTTL: 60 * 60 * 1000, // Increased to 1 hour for images
  maxSize: 300, // Increased image cache size
  staleWhileRevalidate: true
});

export const userCache = new SmartCache({
  defaultTTL: 30 * 60 * 1000, // Increased to 30 minutes for user data
  maxSize: 100, // Increased user cache size
  staleWhileRevalidate: true
});

// Cache keys helper
export const CacheKeys = {
  // User data
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  USER_APPLICATIONS: (userId: string) => `user_applications_${userId}`,
  USER_STATS: (userId: string) => `user_stats_${userId}`,
  
  // Jobs data
  JOBS_LIST: (page: number, filters?: string) => `jobs_list_${page}_${filters || 'all'}`,
  JOB_DETAIL: (jobId: string) => `job_detail_${jobId}`,
  
  // Recruiter data
  RECRUITER_PROFILE: (userId: string) => `recruiter_profile_${userId}`,
  RECRUITER_JOBS: (userId: string) => `recruiter_jobs_${userId}`,
  RECRUITER_APPLICATIONS: (userId: string) => `recruiter_applications_${userId}`,
  
  // Images
  PROFILE_IMAGE: (userId: string) => `profile_image_${userId}`,
  
  // Dashboard data
  DASHBOARD_STATS: (userId: string, role: string) => `dashboard_stats_${userId}_${role}`,
};

// Cache invalidation helpers
export const invalidateUserData = (userId: string) => {
  dataCache.invalidatePattern(`user_.*_${userId}`);
  userCache.invalidatePattern(`.*_${userId}`);
};

export const invalidateJobsData = () => {
  dataCache.invalidatePattern('jobs_.*');
};

export const invalidateRecruiterData = (userId: string) => {
  dataCache.invalidatePattern(`recruiter_.*_${userId}`);
};
