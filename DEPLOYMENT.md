# Deployment Configuration Guide

## Issues Fixed:
1. **CORS Configuration**: Updated backend to allow Vercel domain
2. **Environment Variables**: Set correct API URL for production
3. **Error Handling**: Better network error handling in API client

## Vercel Environment Variables:
Add these in your Vercel dashboard (Settings > Environment Variables):

```
NEXT_PUBLIC_API_URL=https://campuscogni.onrender.com/api
NEXTAUTH_SECRET=your-secure-production-secret-key
NEXTAUTH_URL=https://campuscogni.vercel.app
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Render Backend Environment Variables:
Make sure these are set in your Render dashboard:

```
DATABASE_URL=your-postgresql-connection-string
PORT=5000 (Render sets this automatically)
NODE_ENV=production
JWT_SECRET=your-jwt-secret-key
```

## Deployment Steps:

### Frontend (Vercel):
1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

### Backend (Render):
1. Push your code to GitHub
2. Create new Web Service in Render
3. Connect your GitHub repository
4. Set environment variables
5. Deploy

## Testing:
1. Check if backend is accessible: https://campuscogni.onrender.com/health
2. Test CORS: Check browser console for any CORS errors
3. Verify API calls are going to the correct endpoint

## Common Issues:
1. **ERR_BLOCKED_BY_CLIENT**: Usually ad blockers or browser extensions
2. **CORS errors**: Check allowed origins in backend
3. **Failed to fetch**: Network connectivity or wrong API URL
4. **500 errors**: Check backend logs in Render dashboard
