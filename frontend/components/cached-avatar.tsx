'use client'

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { imageCache, CacheKeys } from '@/lib/cache';
import { User } from 'lucide-react';

interface CachedAvatarProps {
  src?: string | null;
  userId: string;
  alt: string;
  fallback?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
  xl: 'h-24 w-24'
};

export function CachedAvatar({ 
  src, 
  userId, 
  alt, 
  fallback, 
  className = '', 
  size = 'md' 
}: CachedAvatarProps) {
  const [cachedSrc, setCachedSrc] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const cacheKey = CacheKeys.PROFILE_IMAGE(userId);

  useEffect(() => {
    if (!src) {
      setCachedSrc(undefined);
      setError(false);
      return;
    }

    const loadImage = async () => {
      setLoading(true);
      setError(false);
      
      try {
        // Check cache first
        const cached = imageCache.get<string>(cacheKey);
        if (cached && !imageCache.isStale(cacheKey)) {
          setCachedSrc(cached);
          setLoading(false);
          return;
        }

        // Load image and create object URL
        const response = await fetch(src);
        if (!response.ok) {
          throw new Error('Failed to load image');
        }

        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        
        // Cache the object URL
        imageCache.set(cacheKey, objectUrl, 30 * 60 * 1000); // 30 minutes
        setCachedSrc(objectUrl);
        
        // Clean up old object URL if it exists
        if (cached && cached.startsWith('blob:')) {
          URL.revokeObjectURL(cached);
        }

      } catch (err) {
        console.error('Failed to load profile image:', err);
        setError(true);
        setCachedSrc(src); // Fallback to original URL
      } finally {
        setLoading(false);
      }
    };

    loadImage();

    // Cleanup function
    return () => {
      // Don't revoke the URL here as it might be used elsewhere
      // The cache will handle cleanup when the entry expires
    };
  }, [src, userId, cacheKey]);

  // Listen for cache invalidation
  useEffect(() => {
    const unsubscribe = imageCache.onInvalidate((key) => {
      if (key === cacheKey) {
        setCachedSrc(undefined);
        setError(false);
      }
    });

    return unsubscribe;
  }, [cacheKey]);

  const getInitials = () => {
    if (fallback) return fallback;
    return alt.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
  };

  const avatarClasses = `${sizeClasses[size]} ${className}`;

  return (
    <Avatar className={avatarClasses}>
      <AvatarImage 
        src={error ? undefined : cachedSrc} 
        alt={alt}
        className={`object-cover transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}
        onError={() => setError(true)}
      />
      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
        {cachedSrc || src ? <User className="h-1/2 w-1/2" /> : getInitials()}
      </AvatarFallback>
    </Avatar>
  );
}

// Invalidate image cache for a user (useful after profile picture update)
export const invalidateUserImage = (userId: string) => {
  const cacheKey = CacheKeys.PROFILE_IMAGE(userId);
  imageCache.invalidate(cacheKey);
};
