"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const prisma_1 = require("./lib/prisma");
const child_process_1 = require("child_process");
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const students_1 = __importDefault(require("./routes/students"));
const recruiters_1 = __importDefault(require("./routes/recruiters"));
const jobs_1 = __importDefault(require("./routes/jobs"));
const applications_1 = __importDefault(require("./routes/applications"));
const upload_1 = __importDefault(require("./routes/upload"));
const notifications_1 = __importDefault(require("./routes/notifications"));
// Load environment variables
dotenv_1.default.config();
// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingEnvVars);
    console.error('Please set these environment variables in your deployment platform');
    process.exit(1);
}
console.log('✅ Environment variables loaded successfully');
console.log('📊 Database URL:', process.env.DATABASE_URL?.includes('localhost') ? 'LOCAL DATABASE' : 'REMOTE DATABASE');
console.log('🔐 JWT Secret:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
// Initialize database on startup
async function initializeDatabase() {
    try {
        console.log('🔄 Initializing database...');
        // Run migrations in production
        if (process.env.NODE_ENV === 'production') {
            console.log('📋 Running database migrations...');
            try {
                (0, child_process_1.execSync)('npx prisma migrate deploy', {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    env: { ...process.env }
                });
                console.log('✅ Migrations completed successfully');
            }
            catch (migrationError) {
                console.error('⚠️ Migration failed, attempting database push...');
                console.error('Migration error:', migrationError?.message || migrationError);
                // Fallback to db push if migrations fail
                (0, child_process_1.execSync)('npx prisma db push --force-reset', {
                    stdio: 'inherit',
                    cwd: process.cwd(),
                    env: { ...process.env }
                });
                console.log('✅ Database push completed successfully');
            }
        }
        // Test database connection
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        console.log('✅ Database connection verified');
        // Check tables
        const tableCount = await prisma_1.prisma.$queryRaw `
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
        console.log(`📊 Database has ${tableCount[0].count} tables`);
        if (tableCount[0].count === 0) {
            throw new Error('No tables found in database - migration may have failed');
        }
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error?.message || error);
        throw error;
    }
}
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use((0, helmet_1.default)({
    crossOriginEmbedderPolicy: false,
}));
// CORS configuration for production
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
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
        }
        else {
            console.log('CORS blocked origin:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
// Health check
app.get('/health', async (req, res) => {
    try {
        // Check database connection
        await prisma_1.prisma.$queryRaw `SELECT 1`;
        res.json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'connected',
            environment: process.env.NODE_ENV || 'development'
        });
    }
    catch (error) {
        console.error('Health check failed:', error);
        res.status(500).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            database: 'disconnected',
            error: error instanceof Error ? error.message : 'Database connection failed'
        });
    }
});
// Debug endpoint for testing API connectivity
app.post('/debug/register', (req, res) => {
    console.log('Debug - Registration data received:', req.body);
    res.json({
        message: 'Debug: Data received successfully',
        receivedData: req.body,
        timestamp: new Date().toISOString()
    });
});
// Environment check endpoint
app.get('/debug/env', (req, res) => {
    const envCheck = {
        NODE_ENV: process.env.NODE_ENV || 'not set',
        DATABASE_URL: process.env.DATABASE_URL ? 'set' : 'not set',
        DATABASE_TYPE: process.env.DATABASE_URL?.includes('localhost') ? 'LOCAL' : 'REMOTE',
        DATABASE_HOST: process.env.DATABASE_URL?.split('@')[1]?.split('/')[0] || 'unknown',
        JWT_SECRET: process.env.JWT_SECRET ? 'set' : 'not set',
        PORT: process.env.PORT || 'not set',
    };
    console.log('Environment check:', envCheck);
    res.json(envCheck);
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/students', students_1.default);
app.use('/api/recruiters', recruiters_1.default);
app.use('/api/jobs', jobs_1.default);
app.use('/api/applications', applications_1.default);
app.use('/api/upload', upload_1.default);
app.use('/api/notifications', notifications_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Start server with database initialization
async function startServer() {
    try {
        // Initialize database first
        await initializeDatabase();
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error?.message || error);
        process.exit(1);
    }
}
// Start the application
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map