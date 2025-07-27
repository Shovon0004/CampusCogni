/**
 * Centralized configuration for API URLs and keys
 * This ensures consistency across the entire application
 */

// Get the API URL from environment variable with fallback for development
export const getApiUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  
  if (apiUrl) {
    return apiUrl
  }
  
  // Development fallback
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000'
  }
  
  // Production fallback (should not happen if env vars are set correctly)
  console.warn('⚠️ NEXT_PUBLIC_API_URL not set in production! Using fallback.')
  return 'https://campuscogni.onrender.com'
}

// Get the base URL (without /api) for health checks
export const getBaseUrl = (): string => {
  return getApiUrl()
}

// Get the Gemini API key
export const getGeminiApiKey = (): string => {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  
  if (!apiKey) {
    throw new Error('NEXT_PUBLIC_GEMINI_API_KEY is not configured. Please add it to your environment variables.')
  }
  
  return apiKey
}

// Log the current API configuration (for debugging)
export const logApiConfig = () => {
  if (typeof window !== 'undefined') {
    console.log('🌐 API Configuration:')
    console.log('   Environment:', process.env.NODE_ENV)
    console.log('   NEXT_PUBLIC_API_URL env var:', process.env.NEXT_PUBLIC_API_URL)
    console.log('   Resolved API URL:', getApiUrl())
    console.log('   Base URL:', getBaseUrl())
    console.log('   Gemini API Key configured:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY)
  }
}
