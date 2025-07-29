import express, { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import compression from 'compression'
import { prisma } from './lib/prisma'
import { execSync } from 'child_process'

// Import routes
import authRoutes from './routes/auth'
import studentRoutes from './routes/students'
import recruiterRoutes from './routes/recruiters'
import jobRoutes from './routes/jobs'
import applicationRoutes from './routes/applications'
import uploadRoutes from './routes/upload'
import notificationRoutes from './routes/notifications'
import healthRoutes from './routes/health'
import profileUploadRoutes from './routes/profile-upload'
import aiCandidateSearchRoutes from './routes/ai-candidate-search';
import aiProfileSummaryRoutes from './routes/ai-profile-summary';
import aiCandidateQaRoutes from './routes/ai-candidate-qa';
import aiCandidateCompareRoutes from './routes/ai-candidate-compare';
import projectRoutes from './routes/projects';
import experienceRoutes from './routes/experiences';
import certificationRoutes from './routes/certifications';
import verifiedSkillsRoutes from './routes/verified-skills';




// Load environment variables
dotenv.config()

console.log('🚀 Starting CampusCogni Backend Server...')
console.log('📊 Current working directory:', process.cwd())
console.log('📊 Node version:', process.version)
console.log('📊 Platform:', process.platform)

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar])

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars)
  console.error('Please set these environment variables in your deployment platform')
  process.exit(1)
}

console.log('✅ Environment variables loaded successfully')
console.log('📊 Database URL:', process.env.DATABASE_URL?.includes('localhost') ? 'LOCAL DATABASE' : 'REMOTE DATABASE')
console.log('🔐 JWT Secret:', process.env.JWT_SECRET ? 'SET' : 'NOT SET')
console.log('🌍 NODE_ENV:', process.env.NODE_ENV || 'development')

// Initialize database on startup
async function initializeDatabase() {
  console.log('🔄 [DB INIT] Starting database initialization...')
  
  try {
    console.log('🔄 [DB INIT] Current NODE_ENV:', process.env.NODE_ENV)
    
    // Check if using Prisma Accelerate
    const isAccelerate = process.env.DATABASE_URL?.startsWith('prisma://')
    
    if (isAccelerate) {
      console.log('🚀 [DB INIT] Using Prisma Accelerate - skipping migrations/push')
      console.log('ℹ️ [DB INIT] Note: Database schema should be managed separately for Accelerate')
    } else {
      // Only run migrations/push for direct database connections
      if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
        console.log('📋 [DB INIT] Running database migrations...')
        
        try {
          // First try migrations
          console.log('📋 [DB INIT] Attempting prisma migrate deploy...')
          execSync('npx prisma migrate deploy', { 
            stdio: 'inherit',
            cwd: process.cwd(),
            env: { ...process.env }
          })
          console.log('✅ [DB INIT] Migrations completed successfully')
        } catch (migrationError: any) {
          console.error('⚠️ [DB INIT] Migration failed, attempting database push...')
          console.error('Migration error:', migrationError?.message || migrationError)
          
          try {
            // Fallback to db push if migrations fail
            console.log('📋 [DB INIT] Attempting prisma db push...')
            execSync('npx prisma db push', { 
              stdio: 'inherit',
              cwd: process.cwd(),
              env: { ...process.env }
            })
            console.log('✅ [DB INIT] Database push completed successfully')
          } catch (pushError: any) {
            console.error('❌ [DB INIT] Both migration and push failed!')
            console.error('Push error:', pushError?.message || pushError)
            throw new Error(`Database setup failed: ${pushError?.message || pushError}`)
          }
        }
      }
    }
    
    // Test database connection
    console.log('🔍 [DB INIT] Testing database connection...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ [DB INIT] Database connection verified')
    
    // Check tables
    console.log('📊 [DB INIT] Checking database tables...')
    const tableCount: any = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log(`📊 [DB INIT] Database has ${tableCount[0].count} tables`)
    
    if (tableCount[0].count === 0) {
      console.error('❌ [DB INIT] No tables found in database!')
      throw new Error('No tables found in database - migration may have failed')
    }
    
    // List tables for debugging
    const tables: any = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `
    console.log('📋 [DB INIT] Tables found:', tables.map((t: any) => t.table_name).join(', '))
    
    console.log('🎉 [DB INIT] Database initialization completed successfully!')
    
  } catch (error: any) {
    console.error('❌ [DB INIT] Database initialization failed:', error?.message || error)
    console.error('❌ [DB INIT] Full error:', error)
    throw error
  }
}

const app: express.Application = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}))

// Add compression for better performance
app.use(compression())

// CORS configuration for production
const corsOptions = {
  origin: function (origin: any, callback: any) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001', 
      'https://campuscogni.vercel.app',
      'https://campus-cogni.vercel.app',
      'https://campus-cogni-bay.vercel.app',
      'https://campuscogni-*.vercel.app', // Allow preview deployments
      // Add your actual production frontend URL here
      process.env.FRONTEND_URL || 'https://your-frontend-domain.com'
    ];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin.includes('*')) {
        const pattern = allowedOrigin.replace('*', '.*');
        const regex = new RegExp(`^${pattern}$`);
        return regex.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions))
app.use(morgan('combined'))
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check with performance metrics
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const dbTime = Date.now() - dbStart
    
    const memUsage = process.memoryUsage()
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development',
      performance: {
        databaseResponseTime: `${dbTime}ms`,
        uptime: `${Math.round(process.uptime())}s`,
        memoryUsage: {
          heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
          heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
          rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`
        }
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Database connection failed'
    })
  }
})

// Debug endpoint for testing API connectivity
app.post('/debug/register', (req, res) => {
  console.log('Debug - Registration data received:', req.body)
  res.json({ 
    message: 'Debug: Data received successfully', 
    receivedData: req.body,
    timestamp: new Date().toISOString()
  })
})

// Environment check endpoint
app.get('/debug/env', (req, res) => {
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
    DATABASE_TYPE: process.env.DATABASE_URL?.includes('localhost') ? 'LOCAL' : 'REMOTE',
    DATABASE_HOST: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
    JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set',
    PORT: process.env.PORT || 'not set',
  }
  
  console.log('Environment check:', envCheck)
  res.json(envCheck)
})

// API Routes (simplified routing to avoid TypeScript conflicts)
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/recruiters', recruiterRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/profile-upload', profileUploadRoutes)
app.use('/api/ai-candidate-search', aiCandidateSearchRoutes)
app.use('/api/ai-profile-summary', aiProfileSummaryRoutes)
app.use('/api/ai-candidate-qa', aiCandidateQaRoutes)
app.use('/api/ai-candidate-compare', aiCandidateCompareRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/experiences', experienceRoutes)
app.use('/api/certifications', certificationRoutes)

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server with database initialization
async function startServer() {
  console.log('🚀 [SERVER] Starting server initialization...')
  
  try {
    // Initialize database first
    console.log('🔄 [SERVER] About to initialize database...')
    await initializeDatabase()
    console.log('✅ [SERVER] Database initialization completed')
    
    // Start the server
    console.log('🔄 [SERVER] Starting HTTP server on port', PORT)
    const server = app.listen(PORT, () => {
      console.log(`🚀 [SERVER] Server running on port ${PORT}`)
      console.log(`📱 [SERVER] Environment: ${process.env.NODE_ENV || 'development'}`)
      console.log(`🌐 [SERVER] Health check: http://localhost:${PORT}/health`)
      console.log(`🔧 [SERVER] Debug env: http://localhost:${PORT}/debug/env`)
    })

    // Graceful shutdown handling
    const gracefulShutdown = async (signal: string) => {
      console.log(`🔄 [SERVER] ${signal} received, starting graceful shutdown...`)
      
      server.close(async () => {
        console.log('🔄 [SERVER] HTTP server closed')
        
        try {
          await prisma.$disconnect()
          console.log('✅ [SERVER] Database disconnected')
          console.log('👋 [SERVER] Graceful shutdown completed')
          process.exit(0)
        } catch (error) {
          console.error('❌ [SERVER] Error during shutdown:', error)
          process.exit(1)
        }
      })
      
      // Force close after 10 seconds
      setTimeout(() => {
        console.error('❌ [SERVER] Forceful shutdown after timeout')
        process.exit(1)
      }, 10000)
    }

    // Listen for shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    
  } catch (error: any) {
    console.error('❌ [SERVER] Failed to start server:', error?.message || error)
    console.error('❌ [SERVER] Stack trace:', error?.stack)
    console.error('❌ [SERVER] Exiting process...')
    process.exit(1)
  }
}

console.log('🎯 [MAIN] About to start server...')
// Start the application
startServer().catch((error) => {
  console.error('❌ [MAIN] Unhandled error in startServer:', error)
  process.exit(1)
})

export default app
