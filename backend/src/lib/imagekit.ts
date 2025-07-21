import ImageKit from 'imagekit';

// Environment variables for ImageKit
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT;

// Cache for authentication parameters
interface AuthCache {
  params: any;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

let authCache: AuthCache | null = null;
const AUTH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

// Validate environment variables
const validateImageKitConfig = () => {
  const missing = [];
  
  if (!IMAGEKIT_PUBLIC_KEY) missing.push('IMAGEKIT_PUBLIC_KEY');
  if (!IMAGEKIT_PRIVATE_KEY) missing.push('IMAGEKIT_PRIVATE_KEY');
  if (!IMAGEKIT_URL_ENDPOINT) missing.push('IMAGEKIT_URL_ENDPOINT');
  
  if (missing.length > 0) {
    console.warn('⚠️ ImageKit configuration incomplete. Missing:', missing.join(', '));
    console.warn('⚠️ Profile picture upload will be disabled until environment variables are set');
    return false;
  }
  
  return true;
};

// Initialize ImageKit only if all environment variables are present
let imagekit: ImageKit | null = null;

if (validateImageKitConfig()) {
  try {
    imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY!,
      privateKey: IMAGEKIT_PRIVATE_KEY!,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT!,
    });
    console.log('✅ ImageKit initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize ImageKit:', error);
  }
} else {
  console.log('⚠️ ImageKit not initialized - missing environment variables');
}

// Helper function to check if ImageKit is available
export const isImageKitAvailable = (): boolean => {
  return imagekit !== null;
};

// Safe getter for ImageKit instance
export const getImageKit = (): ImageKit => {
  if (!imagekit) {
    throw new Error('ImageKit is not initialized. Please check environment variables.');
  }
  return imagekit;
};

export default imagekit;

export const uploadToImageKit = async (
  file: Buffer,
  fileName: string,
  folder: string = 'profile-pictures'
): Promise<string> => {
  if (!isImageKitAvailable()) {
    throw new Error('ImageKit service is not available. Please check environment variables.');
  }
  
  try {
    const imagekit = getImageKit();
    const uploadResponse = await imagekit.upload({
      file: file,
      fileName: fileName,
      folder: folder,
      useUniqueFileName: true,
      tags: ['profile', 'user'],
    });
    
    return uploadResponse.url;
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Failed to upload image');
  }
};

export const deleteFromImageKit = async (fileId: string): Promise<void> => {
  if (!isImageKitAvailable()) {
    throw new Error('ImageKit service is not available. Please check environment variables.');
  }
  
  try {
    const imagekit = getImageKit();
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error('ImageKit delete error:', error);
    throw new Error('Failed to delete image');
  }
};

export const getImageKitAuthParams = () => {
  if (!isImageKitAvailable()) {
    throw new Error('ImageKit service is not available. Please check environment variables.');
  }
  
  const now = Date.now();
  
  // Return cached params if still valid
  if (authCache && (now - authCache.timestamp) < authCache.ttl) {
    console.log('📋 Using cached ImageKit auth params');
    return authCache.params;
  }
  
  // Generate new auth params and cache them
  const imagekit = getImageKit();
  const params = imagekit.getAuthenticationParameters();
  
  authCache = {
    params,
    timestamp: now,
    ttl: AUTH_CACHE_TTL
  };
  
  console.log('🔄 Generated new ImageKit auth params (cached for 10 minutes)');
  return params;
};
