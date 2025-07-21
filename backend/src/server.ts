import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan' 
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

// Load environment variables
dotenv.config()

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

// Initialize database on startup
async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database...')
    
    // Run migrations in production
    if (process.env.NODE_ENV === 'production') {
      console.log('📋 Running database migrations...')
      try {
        execSync('npx prisma migrate deploy', { 
          stdio: 'inherit',
          cwd: process.cwd(),
          env: { ...process.env }
        })
        console.log('✅ Migrations completed successfully')
      } catch (migrationError: any) {
        console.error('⚠️ Migration failed, attempting database push...')
        console.error('Migration error:', migrationError?.message || migrationError)
        
        // Fallback to db push if migrations fail
        execSync('npx prisma db push --force-reset', { 
          stdio: 'inherit',
          cwd: process.cwd(),
          env: { ...process.env }
        })
        console.log('✅ Database push completed successfully')
      }
    }
    
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection verified')
    
    // Check tables
    const tableCount: any = await prisma.$queryRaw`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log(`📊 Database has ${tableCount[0].count} tables`)
    
    if (tableCount[0].count === 0) {
      throw new Error('No tables found in database - migration may have failed')
    }
    
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error?.message || error)
    throw error
  }
}

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
}))

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
      'https://campuscogni-*.vercel.app', // Allow preview deployments
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

// Health check
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
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

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/recruiters', recruiterRoutes)
app.use('/api/jobs', jobRoutes)
app.use('/api/applications', applicationRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/notifications', notificationRoutes)

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Something went wrong!' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Start server with database initialization
async function startServer() {
  try {
    // Initialize database first
    await initializeDatabase()
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`)
    })
  } catch (error: any) {
    console.error('❌ Failed to start server:', error?.message || error)
    process.exit(1)
  }
}

// Start the application
startServer()

export default app
