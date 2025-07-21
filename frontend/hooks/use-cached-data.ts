'use client'

import { useState, useEffect, useCallback, useRef } from 'react';
import { cachedApiClient } from '@/lib/cached-api-client';
import { dataCache } from '@/lib/cache';

interface UseCachedDataOptions {
  enabled?: boolean;
  refetchInterval?: number;
  forceRefreshOnMount?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseCachedDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isStale: boolean;
  lastUpdated: Date | null;
}

export function useCachedData<T>(
  fetchFn: () => Promise<T>,
  cacheKey: string,
  options: UseCachedDataOptions = {}
): UseCachedDataReturn<T> {
  const {
    enabled = true,
    refetchInterval,
    forceRefreshOnMount = false,
    onSuccess,
    onError
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const fetchFnRef = useRef(fetchFn);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update ref when fetchFn changes
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  // Check if data is stale
  const checkStaleStatus = useCallback(() => {
    const stale = dataCache.isStale(cacheKey);
    setIsStale(stale);
    return stale;
  }, [cacheKey]);

  // Fetch data function
  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Get from cache first if not forcing refresh
      if (!force) {
        const cached = dataCache.get<T>(cacheKey);
        if (cached) {
          setData(cached);
          setLastUpdated(new Date());
          setLoading(false);
          checkStaleStatus();
          
          // If data is stale, fetch fresh in background
          if (dataCache.isStale(cacheKey)) {
            console.log(`🔄 Background refresh for stale data: ${cacheKey}`);
            fetchFnRef.current().then(freshData => {
              dataCache.set(cacheKey, freshData);
              setData(freshData);
              setLastUpdated(new Date());
              setIsStale(false);
              onSuccess?.(freshData);
            }).catch(err => {
              console.error('Background refresh failed:', err);
            });
          }
          
          onSuccess?.(cached);
          return;
        }
      }
      
      // Fetch fresh data
      const freshData = await fetchFnRef.current();
      dataCache.set(cacheKey, freshData);
      setData(freshData);
      setLastUpdated(new Date());
      setIsStale(false);
      onSuccess?.(freshData);
      
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      console.error(`Failed to fetch data for ${cacheKey}:`, error);
    } finally {
      setLoading(false);
    }
  }, [enabled, cacheKey, checkStaleStatus, onSuccess, onError]);

  // Refresh function for manual refresh
  const refresh = useCallback(async () => {
    await fetchData(true);
  }, [fetchData]);

  // Set up cache invalidation listener
  useEffect(() => {
    const unsubscribe = dataCache.onInvalidate((invalidatedKey) => {
      if (invalidatedKey === cacheKey) {
        console.log(`🔄 Cache invalidated for: ${cacheKey}, refetching...`);
        fetchData(true);
      }
    });

    return unsubscribe;
  }, [cacheKey, fetchData]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchData(forceRefreshOnMount);
    }
  }, [enabled, forceRefreshOnMount, fetchData]);

  // Set up polling interval
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        console.log(`⏰ Interval refresh for: ${cacheKey}`);
        fetchData(false); // Don't force, use cache strategy
      }, refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [refetchInterval, enabled, fetchData, cacheKey]);

  // Check stale status periodically
  useEffect(() => {
    const staleCheckInterval = setInterval(checkStaleStatus, 30000); // Check every 30 seconds
    return () => clearInterval(staleCheckInterval);
  }, [checkStaleStatus]);

  return {
    data,
    loading,
    error,
    refresh,
    isStale,
    lastUpdated
  };
}

// Specialized hooks for common data patterns
export function useUserProfile(userId: string, options?: UseCachedDataOptions) {
  return useCachedData(
    () => cachedApiClient.getUserProfile(userId),
    `user_profile_${userId}`,
    options
  );
}

export function useJobs(page = 1, filters?: any, options?: UseCachedDataOptions) {
  const filterKey = filters ? JSON.stringify(filters) : 'all';
  return useCachedData(
    () => cachedApiClient.getJobs(page, filters),
    `jobs_list_${page}_${filterKey}`,
    {
      refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes for better performance
      forceRefreshOnMount: false, // Don't force refresh, use cache first
      ...options
    }
  );
}

export function useUserApplications(userId: string, options?: UseCachedDataOptions) {
  return useCachedData(
    () => cachedApiClient.getUserApplications(userId),
    `user_applications_${userId}`,
    {
      refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
      forceRefreshOnMount: false, // Use cache first for faster loading
      ...options
    }
  );
}

export function useDashboardStats(userId: string, role: string, options?: UseCachedDataOptions) {
  return useCachedData(
    () => cachedApiClient.getDashboardStats(userId, role),
    `dashboard_stats_${userId}_${role}`,
    {
      refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes instead of 2
      forceRefreshOnMount: false, // Use cache first
      ...options
    }
  );
}

export function useJobDetail(jobId: string, options?: UseCachedDataOptions) {
  return useCachedData(
    () => cachedApiClient.getJobDetail(jobId),
    `job_detail_${jobId}`,
    options
  );
}
