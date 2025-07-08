# CampusCogni Backend

A comprehensive backend API for the CampusCogni campus recruitment platform. Built with modern technologies to provide a robust, scalable, and type-safe backend solution.

## 🚀 Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Node.js** | Runtime environment | v18+ |
| **Express.js** | Web framework | v4.x |
| **TypeScript** | Type safety | v5.x |
| **Prisma** | Database ORM | v6.x |
| **MongoDB Atlas** | Cloud database | Latest |
| **JWT** | Authentication | v9.x |
| **bcryptjs** | Password hashing | v2.x |
| **Multer** | File uploads | v1.x |
| **CORS** | Cross-origin requests | v2.x |
| **Helmet** | Security headers | v7.x |

## 📁 Project Structure

```
backend/
├── src/
│   ├── lib/
│   │   └── prisma.ts          # Prisma client instance
│   ├── middleware/
│   │   └── auth.ts            # Authentication middleware
│   ├── routes/
│   │   ├── auth.ts            # Authentication endpoints
│   │   ├── students.ts        # Student profile endpoints
│   │   ├── recruiters.ts      # Recruiter profile endpoints
│   │   ├── jobs.ts            # Job posting endpoints
│   │   ├── applications.ts    # Application endpoints
│   │   ├── upload.ts          # File upload endpoints
│   │   └── notifications.ts   # Notification endpoints
│   └── server.ts              # Main server file
├── prisma/
│   └── schema.prisma          # Database schema
├── uploads/                   # Local file storage
├── .env                       # Environment variables
├── package.json               # Dependencies
└── tsconfig.json              # TypeScript config
```

## 🗄️ Database Architecture

### User Authentication System
```
User (Base)
├── id: String (ObjectId)
├── email: String (unique)
├── password: String (hashed)
├── role: STUDENT | RECRUITER
└── timestamps
```

### Student Profile
```
Student
├── userId: String (ObjectId, unique)
├── firstName: String
├── lastName: String
├── phone: String
├── college: String
├── course: String
├── year: String
├── cgpa: Float
├── location: String?
├── bio: String?
├── profilePic: String?
├── resumeUrl: String?
├── skills: String[]
└── timestamps
```

### Recruiter Profile
```
Recruiter
├── userId: String (ObjectId, unique)
├── firstName: String
├── lastName: String
├── phone: String
├── company: String
├── jobTitle: String
├── website: String?
├── companySize: STARTUP | SMALL | MEDIUM | LARGE
├── industry: String
├── description: String?
└── timestamps
```

### Job Postings
```
Job
├── id: String (ObjectId)
├── recruiterId: String (ObjectId)
├── title: String
├── description: String
├── requirements: String[]
├── location: String
├── type: INTERNSHIP | FULL_TIME | PART_TIME
├── workMode: REMOTE | ONSITE | HYBRID
├── stipend: Float?
├── salary: Float?
├── deadline: DateTime
├── status: DRAFT | ACTIVE | CLOSED
└── timestamps
```

## 🔑 Authentication Flow

### Registration Process
1. **User submits registration form** (email, password, role, profile data)
2. **Backend validates input** (required fields, email format)
3. **Check for existing user** (email uniqueness)
4. **Hash password** (bcrypt with salt rounds 12)
5. **Create User record** (in users collection)
6. **Create Profile record** (in students/recruiters collection)
7. **Generate JWT token** (24h expiry)
8. **Return token + user data** (automatic login)

### Login Process
1. **User submits credentials** (email, password)
2. **Find user by email** (include profile relations)
3. **Verify password** (bcrypt compare)
4. **Generate JWT token** (24h expiry)
5. **Return token + user data**

### Token Verification
1. **Extract token from header** (Bearer scheme)
2. **Verify JWT signature** (using JWT_SECRET)
3. **Find user in database** (ensure user still exists)
4. **Return user data** (for protected routes)

## 🛠️ API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user (student or recruiter)

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "role": "STUDENT",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "555-1234",
  "college": "MIT",
  "course": "Computer Science",
  "year": "3rd Year",
  "cgpa": 8.5
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "STUDENT"
  }
}
```

#### POST `/api/auth/login`
Login existing user

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "STUDENT",
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "college": "MIT"
    }
  }
}
```

#### GET `/api/auth/verify`
Verify JWT token validity

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "role": "STUDENT",
    "profile": { ... }
  }
}
```

### Student Endpoints

#### GET `/api/students/:userId`
Get student profile by user ID

**Response:**
```json
{
  "id": "student_id",
  "userId": "user_id",
  "firstName": "John",
  "lastName": "Doe",
  "college": "MIT",
  "course": "Computer Science",
  "year": "3rd Year",
  "cgpa": 8.5,
  "skills": ["JavaScript", "React"],
  "projects": [...],
  "experiences": [...],
  "applications": [...]
}
```

#### PUT `/api/students/:userId`
Update student profile

### Job Endpoints

#### GET `/api/jobs`
Get all active jobs with pagination and filters

**Query Parameters:**
- `search`: Search in title, description, location
- `type`: INTERNSHIP | FULL_TIME | PART_TIME
- `workMode`: REMOTE | ONSITE | HYBRID
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "jobs": [
    {
      "id": "job_id",
      "title": "Software Engineer Intern",
      "company": "Google",
      "location": "Mountain View, CA",
      "type": "INTERNSHIP",
      "stipend": 5000,
      "description": "...",
      "recruiter": {
        "company": "Google",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

## 🔒 Security Features

### Password Security
- **bcrypt hashing** with 12 salt rounds
- **Password validation** (minimum requirements)
- **No plain text storage**

### JWT Security
- **Signed tokens** with strong secret
- **24-hour expiry** (prevents long-term exposure)
- **Bearer token scheme**

### CORS Configuration
```typescript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}))
```

### Security Headers
```typescript
app.use(helmet()) // Adds various HTTP headers
```

### Input Validation
- **Required field validation**
- **Email format validation**
- **Role-based data validation**

## 🚀 Getting Started

### Prerequisites
```bash
# Check Node.js version
node --version  # Should be v18+

# Check npm version  
npm --version
```

### Installation Steps

1. **Clone and navigate:**
   ```bash
   git clone <repository-url>
   cd CampusCogni/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Database setup:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to MongoDB
   npx prisma db push
   ```

5. **Start development:**
   ```bash
   npm run dev
   ```

6. **Verify installation:**
   ```bash
   curl http://localhost:5000/health
   # Should return: {"status":"OK","timestamp":"..."}
   ```

## 📋 Environment Variables

### Required Variables
```env
# Database Connection
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters"
JWT_REFRESH_SECRET="your-refresh-secret-key"

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL="http://localhost:3000"
```

### Optional Variables
```env
# File Upload
UPLOAD_PATH="./uploads"
MAX_FILE_SIZE=10485760  # 10MB

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
FROM_EMAIL="noreply@campuscogni.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100          # 100 requests per window
```

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start with nodemon + ts-node
npm run build        # Compile TypeScript
npm start           # Start production server

# Database
npm run db:generate  # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:studio   # Open Prisma Studio GUI
npm run db:reset    # Reset database (dev only)

# Utilities
npm run lint        # ESLint
npm run test        # Run tests
npm run type-check  # TypeScript validation
```

## 🐛 Debugging & Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check MongoDB Atlas connection
   npx prisma db push
   ```

2. **CORS Issues**
   ```bash
   # Verify FRONTEND_URL matches your frontend port
   echo $FRONTEND_URL
   ```

3. **JWT Token Issues**
   ```bash
   # Verify JWT_SECRET is set and secure
   echo $JWT_SECRET
   ```

4. **Port Already in Use**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   ```

### Logging
The server uses Morgan for HTTP request logging:
```
GET /api/jobs 200 45.123 ms - 1024
POST /api/auth/login 401 12.456 ms - 56
```

## 🚀 Deployment Guide

### Option 1: Railway (Recommended)
1. **Connect Repository:**
   - Visit [Railway](https://railway.app)
   - Connect your GitHub repository
   - Select the backend folder

2. **Set Environment Variables:**
   ```
   DATABASE_URL=your-mongodb-connection
   JWT_SECRET=your-jwt-secret
   NODE_ENV=production
   ```

3. **Deploy:**
   - Railway auto-deploys on git push
   - Monitor logs in Railway dashboard

### Option 2: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option 3: Heroku
```bash
# Install Heroku CLI
# Create Heroku app
heroku create campuscogni-backend

# Set environment variables
heroku config:set DATABASE_URL=your-mongodb-connection
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main
```

## 🧪 Testing

### Manual Testing with curl
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass","role":"STUDENT"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'
```

### Using Prisma Studio
```bash
# Open database GUI
npx prisma studio
# Visit http://localhost:5555
```

## 🔧 Prisma ORM Features

### Schema Management
- **Declarative schema** in `prisma/schema.prisma`
- **Type-safe database access**
- **Automatic migrations**
- **Relation management**

### Query Examples
```typescript
// Find user with relations
const user = await prisma.user.findUnique({
  where: { email },
  include: {
    student: true,
    recruiter: true,
  }
})

// Create student with validation
const student = await prisma.student.create({
  data: {
    userId: user.id,
    firstName: "John",
    lastName: "Doe",
    // ... other fields
  }
})

// Complex queries with filters
const jobs = await prisma.job.findMany({
  where: {
    status: 'ACTIVE',
    deadline: { gte: new Date() },
    type: { in: ['INTERNSHIP', 'FULL_TIME'] }
  },
  include: {
    recruiter: {
      select: { company: true }
    }
  },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: (page - 1) * 10
})
```

## 🎯 Best Practices Implemented

### Code Organization
- **Modular route structure**
- **Separate middleware files**
- **Type definitions**
- **Error handling**

### Security
- **Input validation**
- **Password hashing**
- **JWT authentication**
- **CORS configuration**
- **Rate limiting ready**

### Performance
- **Database indexing**
- **Pagination for large datasets**
- **Efficient queries with relations**
- **Connection pooling**

### Maintainability
- **TypeScript for type safety**
- **Consistent error responses**
- **Clear API documentation**
- **Environment-based configuration**

## 📊 Monitoring & Production

### Health Checks
- `/health` endpoint for load balancers
- Database connectivity checks
- API response time monitoring

### Logging
- HTTP request logging with Morgan
- Error logging with stack traces
- Environment-specific log levels

### Performance Metrics
- Response time tracking
- Database query performance
- Memory usage monitoring

## 🆘 Support & Contributing

### Getting Help
1. Check this README
2. Search existing issues
3. Check server logs
4. Use Prisma Studio for database inspection

### Development Workflow
1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with description

This backend provides a solid foundation for the CampusCogni platform with room for scaling and additional features!
