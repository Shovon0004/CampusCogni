'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cachedApiClient } from '@/lib/cached-api-client';

// Preload common routes and data
export function RoutePreloader({ userId, userRole }: { userId?: string; userRole?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!userId || !userRole) return;

    // Preload common routes
    const commonRoutes = [
      '/jobs',
      '/user/applications',
      '/user/profile'
    ];

    // Add recruiter routes if user has recruiter access
    if (userRole === 'RECRUITER' || userRole === 'BOTH') {
      commonRoutes.push('/recruiter/dashboard');
    }

    // Prefetch routes in the background
    commonRoutes.forEach(route => {
      router.prefetch(route);
    });

    // Preload common data in background
    const preloadData = async () => {
      try {
        // Preload jobs data
        cachedApiClient.getJobs(1);
        
        // Preload user applications
        if (userId) {
          cachedApiClient.getUserApplications(userId);
        }
        
        // Preload dashboard stats
        if (userId && userRole) {
          cachedApiClient.getDashboardStats(userId, userRole);
        }
      } catch (error) {
        // Silently fail - these are just performance optimizations
        console.log('Background preloading failed:', error);
      }
    };

    // Delay preloading to not interfere with current page load
    const timeoutId = setTimeout(preloadData, 2000);

    return () => clearTimeout(timeoutId);
  }, [userId, userRole, router]);

  return null; // This component doesn't render anything
}

// Hook for background data prefetching
export function useDataPrefetch(userId?: string, userRole?: string) {
  useEffect(() => {
    if (!userId || !userRole) return;

    const prefetchData = async () => {
      try {
        // Prefetch next page of jobs
        cachedApiClient.getJobs(2);
        
        // Prefetch user profile if not already cached
        cachedApiClient.getUserProfile(userId);
        
      } catch (error) {
        // Silently handle errors
      }
    };

    // Prefetch after a delay
    const timeoutId = setTimeout(prefetchData, 3000);
    return () => clearTimeout(timeoutId);
  }, [userId, userRole]);
}
