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

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CampusCogni Backend                            │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Frontend  │    │   Mobile    │    │   Admin     │    │   3rd Party │  │
│  │   (React)   │    │    App      │    │   Panel     │    │   Services  │  │
│  └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│         │                   │                   │                   │       │
│         └───────────────────┼───────────────────┼───────────────────┘       │
│                             │                   │                           │
│  ┌─────────────────────────────────────────────────────────────────────────┤
│  │                     API Gateway Layer                                   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  │    CORS     │  │   Helmet    │  │   Morgan    │  │Rate Limiting│   │
│  │  │ Middleware  │  │ (Security)  │  │ (Logging)   │  │ Middleware  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│  └─────────────────────────────────────────────────────────────────────────┤
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┤
│  │                   Express.js Router Layer                               │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  │    Auth     │  │   Jobs      │  │Applications │  │   Users     │   │
│  │  │   Routes    │  │   Routes    │  │   Routes    │  │   Routes    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  │   Upload    │  │Notifications│  │  Students   │  │ Recruiters  │   │
│  │  │   Routes    │  │   Routes    │  │   Routes    │  │   Routes    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│  └─────────────────────────────────────────────────────────────────────────┤
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┤
│  │                 Authentication & Authorization Layer                    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  │     JWT     │  │   bcrypt    │  │Role-Based   │  │   Session   │   │
│  │  │ Middleware  │  │  Hashing    │  │   Access    │  │ Management  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│  └─────────────────────────────────────────────────────────────────────────┤
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┤
│  │                    Business Logic Layer                                 │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  │   User      │  │    Job      │  │Application  │  │Notification │   │
│  │  │ Management  │  │ Management  │  │ Management  │  │ Management  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  │   File      │  │   Search    │  │   Matching  │  │   Analytics │   │
│  │  │ Management  │  │   Engine    │  │   Algorithm │  │   Engine    │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│  └─────────────────────────────────────────────────────────────────────────┤
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┤
│  │                    Database Access Layer                                │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  │   Prisma    │  │Connection   │  │   Query     │  │   Schema    │   │
│  │  │    ORM      │  │  Pooling    │  │Optimization │  │ Validation  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│  └─────────────────────────────────────────────────────────────────────────┤
│                                     │                                       │
│  ┌─────────────────────────────────────────────────────────────────────────┤
│  │                      Database Layer                                     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  │   MongoDB   │  │   Atlas     │  │   Indexes   │  │   Backups   │   │
│  │  │ Collections │  │  Clusters   │  │ & Queries   │  │ & Security  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│  └─────────────────────────────────────────────────────────────────────────┤
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📊 Database Schema & Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Database Schema Diagram                          │
└─────────────────────────────────────────────────────────────────────────────┘

          ┌─────────────────────────────────────────────────────────────────┐
          │                           User                                  │
          │  ┌─────────────────────────────────────────────────────────────┤
          │  │ id: String (ObjectId, Primary Key)                         │
          │  │ email: String (Unique, Indexed)                            │
          │  │ password: String (Hashed with bcrypt)                      │
          │  │ role: Enum [STUDENT, RECRUITER]                            │
          │  │ createdAt: DateTime                                         │
          │  │ updatedAt: DateTime                                         │
          │  └─────────────────────────────────────────────────────────────┤
          └─────────────────────────────────────────────────────────────────┘
                                        │
                   ┌────────────────────┴───────────────────┐
                   │                                        │
                   ▼                                        ▼
    ┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
    │            Student                  │    │           Recruiter                 │
    │  ┌─────────────────────────────────┤    │  ┌─────────────────────────────────┤
    │  │ id: String (ObjectId, PK)       │    │  │ id: String (ObjectId, PK)       │
    │  │ userId: String (FK → User.id)   │    │  │ userId: String (FK → User.id)   │
    │  │ firstName: String               │    │  │ firstName: String               │
    │  │ lastName: String                │    │  │ lastName: String                │
    │  │ phone: String                   │    │  │ phone: String                   │
    │  │ college: String                 │    │  │ company: String                 │
    │  │ course: String                  │    │  │ jobTitle: String                │
    │  │ year: Enum [1st, 2nd, 3rd, 4th]│    │  │ website: String?                │
    │  │ cgpa: Float                     │    │  │ companySize: Enum               │
    │  │ location: String?               │    │  │ industry: String                │
    │  │ bio: String?                    │    │  │ description: String?            │
    │  │ profilePic: String?             │    │  │ createdAt: DateTime             │
    │  │ resumeUrl: String?              │    │  │ updatedAt: DateTime             │
    │  │ skills: String[]                │    │  └─────────────────────────────────┤
    │  │ createdAt: DateTime             │    └─────────────────────────────────────┘
    │  │ updatedAt: DateTime             │                          │
    │  └─────────────────────────────────┤                          │
    └─────────────────────────────────────┘                          │
                      │                                               │
                      │                                               ▼
                      │                              ┌─────────────────────────────────────┐
                      │                              │              Job                    │
                      │                              │  ┌─────────────────────────────────┤
                      │                              │  │ id: String (ObjectId, PK)       │
                      │                              │  │ recruiterId: String (FK)        │
                      │                              │  │ title: String                   │
                      │                              │  │ type: Enum [INTERNSHIP, etc.]   │
                      │                              │  │ workMode: Enum [REMOTE, etc.]   │
                      │                              │  │ location: String                │
                      │                              │  │ stipend: String?                │
                      │                              │  │ description: String             │
                      │                              │  │ requirements: String            │
                      │                              │  │ benefits: String?               │
                      │                              │  │ eligibleCourses: String[]       │
                      │                              │  │ eligibleYears: String[]         │
                      │                              │  │ minCGPA: Float?                 │
                      │                              │  │ deadline: DateTime              │
                      │                              │  │ status: Enum [DRAFT, ACTIVE]    │
                      │                              │  │ createdAt: DateTime             │
                      │                              │  │ updatedAt: DateTime             │
                      │                              │  └─────────────────────────────────┤
                      │                              └─────────────────────────────────────┘
                      │                                                │
                      │                                                │
                      │                ┌───────────────────────────────┴───────────────────────────────┐
                      │                │                                                               │
                      │                ▼                                                               │
                      │  ┌─────────────────────────────────────┐                                      │
                      │  │           Application               │                                      │
                      │  │  ┌─────────────────────────────────┤                                      │
                      │  │  │ id: String (ObjectId, PK)       │                                      │
                      │  │  │ studentId: String (FK)          │◄─────────────────────────────────────┘
                      │  │  │ jobId: String (FK)             │
                      │  │  │ status: Enum [PENDING, etc.]    │
                      │  │  │ coverLetter: String?            │
                      │  │  │ resumeUrl: String?              │
                      │  │  │ appliedAt: DateTime             │
                      │  │  │ updatedAt: DateTime             │
                      │  │  └─────────────────────────────────┤
                      │  └─────────────────────────────────────┘
                      │
                      └────────────────────────────────────────────────────────────────────────────────┘
```

## � Complete System Workflows

### 1. User Registration & Authentication Flow

```mermaid
sequenceDiagram
    participant Frontend as Frontend App
    participant API as Express API
    participant Auth as Auth Middleware
    participant DB as MongoDB Atlas
    participant JWT as JWT Service
    
    Note over Frontend,JWT: User Registration Process
    
    Frontend->>API: POST /api/auth/register
    Note right of API: {email, password, role, profile_data}
    
    API->>API: Validate Input
    Note right of API: Check required fields, email format
    
    API->>DB: Check if user exists
    Note right of DB: findUnique({email})
    
    alt User already exists
        DB-->>API: User found
        API-->>Frontend: 409 Conflict
    else User doesn't exist
        DB-->>API: No user found
        
        API->>API: Hash password
        Note right of API: bcrypt.hash(password, 12)
        
        API->>DB: Create User record
        Note right of DB: user.create({email, password, role})
        
        API->>DB: Create Profile record
        Note right of DB: student.create() OR recruiter.create()
        
        API->>JWT: Generate JWT token
        Note right of JWT: jwt.sign({userId, role}, secret, {expiresIn: '24h'})
        
        JWT-->>API: Return token
        API-->>Frontend: 201 Success + token + user data
    end
    
    Note over Frontend,JWT: User Login Process
    
    Frontend->>API: POST /api/auth/login
    Note right of API: {email, password}
    
    API->>DB: Find user by email
    Note right of DB: findUnique({email, include: {profile}})
    
    alt User not found
        DB-->>API: No user found
        API-->>Frontend: 401 Unauthorized
    else User found
        DB-->>API: User + profile data
        
        API->>API: Compare passwords
        Note right of API: bcrypt.compare(password, hashedPassword)
        
        alt Password incorrect
            API-->>Frontend: 401 Unauthorized
        else Password correct
            API->>JWT: Generate JWT token
            JWT-->>API: Return token
            API-->>Frontend: 200 Success + token + user data
        end
    end
    
    Note over Frontend,JWT: Protected Route Access
    
    Frontend->>API: GET /api/protected-route
    Note right of API: Authorization: Bearer <token>
    
    API->>Auth: Verify JWT token
    Note right of Auth: jwt.verify(token, secret)
    
    alt Token invalid/expired
        Auth-->>API: Token verification failed
        API-->>Frontend: 401 Unauthorized
    else Token valid
        Auth->>DB: Find user by ID
        Note right of DB: findUnique({id: tokenPayload.userId})
        
        alt User not found
            DB-->>Auth: No user found
            Auth-->>API: User not found
            API-->>Frontend: 401 Unauthorized
        else User found
            DB-->>Auth: User data
            Auth-->>API: User authenticated
            API->>API: Process request
            API-->>Frontend: 200 Success + data
        end
    end
```

### 2. Job Posting & Application Workflow

```mermaid
sequenceDiagram
    participant R as Recruiter Frontend
    participant S as Student Frontend
    participant API as Express API
    participant Auth as Auth Middleware
    participant DB as MongoDB Atlas
    participant Email as Email Service
    
    Note over R,Email: Job Posting Process
    
    R->>API: POST /api/jobs
    Note right of API: Authorization: Bearer <token>
    Note right of API: {title, description, requirements, etc.}
    
    API->>Auth: Verify recruiter token
    Auth->>DB: Validate recruiter exists
    DB-->>Auth: Recruiter data
    Auth-->>API: Recruiter authenticated
    
    API->>API: Validate job data
    Note right of API: Required fields, data types, dates
    
    API->>DB: Create job record
    Note right of DB: job.create({recruiterId, title, description, ...})
    
    DB-->>API: Job created
    API-->>R: 201 Created + job data
    
    Note over R,Email: Job Discovery & Application Process
    
    S->>API: GET /api/jobs
    Note right of API: Query params: search, filters, pagination
    
    API->>DB: Fetch jobs with filters
    Note right of DB: job.findMany({where: filters, include: recruiter})
    
    DB-->>API: Job listings
    API-->>S: 200 Success + jobs + pagination
    
    S->>API: POST /api/jobs/:id/apply
    Note right of API: Authorization: Bearer <token>
    Note right of API: {coverLetter, resumeUrl?}
    
    API->>Auth: Verify student token
    Auth->>DB: Validate student exists
    DB-->>Auth: Student data
    Auth-->>API: Student authenticated
    
    API->>DB: Check if already applied
    Note right of DB: application.findFirst({studentId, jobId})
    
    alt Already applied
        DB-->>API: Application exists
        API-->>S: 409 Conflict
    else Not applied
        DB-->>API: No application found
        
        API->>DB: Create application
        Note right of DB: application.create({studentId, jobId, status: 'PENDING'})
        
        DB-->>API: Application created
        
        API->>Email: Send notification to recruiter
        Note right of Email: New application received
        
        API-->>S: 201 Created + application data
    end
    
    Note over R,Email: Application Review Process
    
    R->>API: GET /api/applications
    Note right of API: Authorization: Bearer <token>
    
    API->>Auth: Verify recruiter token
    Auth-->>API: Recruiter authenticated
    
    API->>DB: Fetch applications for recruiter's jobs
    Note right of DB: application.findMany({job: {recruiterId}})
    
    DB-->>API: Applications list
    API-->>R: 200 Success + applications
    
    R->>API: PUT /api/applications/:id/status
    Note right of API: {status: 'ACCEPTED' | 'REJECTED'}
    
    API->>Auth: Verify recruiter token
    Auth-->>API: Recruiter authenticated
    
    API->>DB: Update application status
    Note right of DB: application.update({id, status})
    
    DB-->>API: Application updated
    
    API->>Email: Send notification to student
    Note right of Email: Application status updated
    
    API-->>R: 200 Success + updated application
```

### 3. File Upload & Profile Management Workflow

```mermaid
sequenceDiagram
    participant Frontend as Frontend App
    participant API as Express API
    participant Auth as Auth Middleware
    participant Multer as Multer Middleware
    participant FS as File System
    participant DB as MongoDB Atlas
    
    Note over Frontend,DB: File Upload Process
    
    Frontend->>API: POST /api/upload/resume
    Note right of API: Authorization: Bearer <token>
    Note right of API: Content-Type: multipart/form-data
    
    API->>Auth: Verify JWT token
    Auth-->>API: User authenticated
    
    API->>Multer: Process file upload
    Note right of Multer: Validate file type, size
    
    alt File validation failed
        Multer-->>API: Validation error
        API-->>Frontend: 400 Bad Request
    else File validation passed
        Multer->>FS: Save file to disk
        Note right of FS: /uploads/resumes/{userId}_{timestamp}_{filename}
        
        FS-->>Multer: File saved
        Multer-->>API: File path returned
        
        API->>DB: Update user profile
        Note right of DB: student.update({resumeUrl: filePath})
        
        DB-->>API: Profile updated
        API-->>Frontend: 200 Success + file URL
    end
    
    Note over Frontend,DB: Profile Update Process
    
    Frontend->>API: PUT /api/students/:userId
    Note right of API: Authorization: Bearer <token>
    Note right of API: {firstName, lastName, skills, bio, ...}
    
    API->>Auth: Verify JWT token
    Auth-->>API: User authenticated
    
    API->>API: Validate ownership
    Note right of API: token.userId === params.userId
    
    alt Unauthorized access
        API-->>Frontend: 403 Forbidden
    else Authorized access
        API->>API: Validate profile data
        Note right of API: Required fields, data types
        
        API->>DB: Update student profile
        Note right of DB: student.update({userId, data})
        
        DB-->>API: Profile updated
        API-->>Frontend: 200 Success + updated profile
    end
```

### 4. Search & Filter System Workflow

```mermaid
sequenceDiagram
    participant Frontend as Frontend App
    participant API as Express API
    participant Cache as Redis Cache
    participant DB as MongoDB Atlas
    participant Search as Search Engine
    
    Note over Frontend,Search: Advanced Job Search Process
    
    Frontend->>API: GET /api/jobs/search
    Note right of API: ?q=software&type=INTERNSHIP&location=remote&page=1
    
    API->>API: Parse & validate query
    Note right of API: Extract search terms, filters, pagination
    
    API->>Cache: Check cache
    Note right of Cache: key: search_query_hash
    
    alt Cache hit
        Cache-->>API: Cached results
        API-->>Frontend: 200 Success + cached data
    else Cache miss
        Cache-->>API: No cached results
        
        API->>DB: Build complex query
        Note right of DB: {
        Note right of DB:   where: {
        Note right of DB:     OR: [
        Note right of DB:       {title: {contains: "software"}},
        Note right of DB:       {description: {contains: "software"}}
        Note right of DB:     ],
        Note right of DB:     type: "INTERNSHIP",
        Note right of DB:     location: {contains: "remote"},
        Note right of DB:     status: "ACTIVE"
        Note right of DB:   }
        Note right of DB: }
        
        DB-->>API: Search results
        
        API->>Search: Enhance with relevance scoring
        Note right of Search: Apply ML-based ranking
        
        Search-->>API: Ranked results
        
        API->>Cache: Store results
        Note right of Cache: TTL: 5 minutes
        
        API-->>Frontend: 200 Success + search results
    end
    
    Note over Frontend,Search: Filter & Sort Process
    
    Frontend->>API: GET /api/jobs
    Note right of API: ?sort=deadline&order=asc&cgpa_min=7.5&courses=CS,IT
    
    API->>DB: Apply filters & sorting
    Note right of DB: {
    Note right of DB:   where: {
    Note right of DB:     minCGPA: {lte: 7.5},
    Note right of DB:     eligibleCourses: {hasSome: ["CS", "IT"]},
    Note right of DB:     deadline: {gte: new Date()}
    Note right of DB:   },
    Note right of DB:   orderBy: {deadline: "asc"}
    Note right of DB: }
    
    DB-->>API: Filtered & sorted results
    API-->>Frontend: 200 Success + filtered jobs
```

### 5. Real-time Notification System Workflow

```mermaid
sequenceDiagram
    participant R as Recruiter
    participant S as Student
    participant API as Express API
    participant WS as WebSocket Server
    participant Queue as Job Queue
    participant Email as Email Service
    participant DB as MongoDB Atlas
    
    Note over R,DB: Real-time Notification Setup
    
    R->>WS: Connect WebSocket
    Note right of WS: ws://localhost:5000/notifications
    
    WS->>API: Authenticate WebSocket
    Note right of API: Verify JWT token from query
    
    API->>DB: Get user data
    DB-->>API: User data
    API-->>WS: User authenticated
    
    WS->>WS: Store connection
    Note right of WS: connections[userId] = websocket
    
    Note over R,DB: Notification Trigger Process
    
    S->>API: POST /api/jobs/:id/apply
    Note right of API: Student applies to job
    
    API->>DB: Create application
    DB-->>API: Application created
    
    API->>Queue: Add notification job
    Note right of Queue: {
    Note right of Queue:   type: 'NEW_APPLICATION',
    Note right of Queue:   recruiterId: 'recruiter_id',
    Note right of Queue:   studentId: 'student_id',
    Note right of Queue:   jobId: 'job_id'
    Note right of Queue: }
    
    Queue->>DB: Create notification record
    Note right of DB: notification.create({
    Note right of DB:   userId: recruiterId,
    Note right of DB:   type: 'NEW_APPLICATION',
    Note right of DB:   data: {studentName, jobTitle}
    Note right of DB: })
    
    DB-->>Queue: Notification created
    
    Queue->>WS: Send real-time notification
    Note right of WS: if (connections[recruiterId]) {
    Note right of WS:   send(notification)
    Note right of WS: }
    
    WS-->>R: Real-time notification
    
    Queue->>Email: Send email notification
    Note right of Email: Template: new_application.html
    
    Email-->>Queue: Email sent
    
    Note over R,DB: Notification Management
    
    R->>API: GET /api/notifications
    Note right of API: Authorization: Bearer <token>
    
    API->>DB: Fetch user notifications
    Note right of DB: notification.findMany({
    Note right of DB:   userId: recruiterId,
    Note right of DB:   orderBy: {createdAt: 'desc'}
    Note right of DB: })
    
    DB-->>API: Notifications list
    API-->>R: 200 Success + notifications
    
    R->>API: PUT /api/notifications/:id/read
    Note right of API: Mark notification as read
    
    API->>DB: Update notification
    Note right of DB: notification.update({id, read: true})
    
    DB-->>API: Notification updated
    API-->>R: 200 Success
```

### 6. Error Handling & Logging Workflow

```mermaid
sequenceDiagram
    participant Client as Client App
    participant API as Express API
    participant Middleware as Error Middleware
    participant Logger as Winston Logger
    participant Monitor as Monitoring Service
    participant DB as MongoDB Atlas
    
    Note over Client,DB: Error Handling Process
    
    Client->>API: Request with invalid data
    Note right of API: POST /api/jobs (missing required fields)
    
    API->>API: Validation error occurs
    Note right of API: Joi validation fails
    
    API->>Middleware: Pass error to handler
    Note right of Middleware: Express error middleware
    
    Middleware->>Logger: Log error details
    Note right of Logger: {
    Note right of Logger:   level: 'error',
    Note right of Logger:   message: 'Validation failed',
    Note right of Logger:   stack: error.stack,
    Note right of Logger:   userId: req.user?.id,
    Note right of Logger:   endpoint: req.path,
    Note right of Logger:   timestamp: new Date()
    Note right of Logger: }
    
    Logger->>Monitor: Send error metrics
    Note right of Monitor: Error rate, response time
    
    Middleware->>DB: Store error log
    Note right of DB: errorLog.create({
    Note right of DB:   error: error.message,
    Note right of DB:   stack: error.stack,
    Note right of DB:   userId: req.user?.id
    Note right of DB: })
    
    Middleware-->>Client: 400 Bad Request
    Note right of Client: {
    Note right of Client:   error: 'Validation failed',
    Note right of Client:   details: [...],
    Note right of Client:   timestamp: '2025-07-10T...'
    Note right of Client: }
    
    Note over Client,DB: Critical Error Handling
    
    Client->>API: Request causes server error
    Note right of API: Database connection failure
    
    API->>API: Unexpected error occurs
    Note right of API: MongoDB Atlas connection timeout
    
    API->>Middleware: Pass error to handler
    
    Middleware->>Logger: Log critical error
    Note right of Logger: level: 'critical'
    
    Logger->>Monitor: Send alert
    Note right of Monitor: Immediate notification to dev team
    
    Middleware->>DB: Store error (if possible)
    Note right of DB: May fail if DB is down
    
    Middleware-->>Client: 500 Internal Server Error
    Note right of Client: {
    Note right of Client:   error: 'Something went wrong',
    Note right of Client:   requestId: 'req_123456'
    Note right of Client: }
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── lib/
│   │   ├── prisma.ts              # Prisma client instance & connection
│   │   ├── jwt.ts                 # JWT utility functions
│   │   ├── email.ts               # Email service configuration
│   │   ├── upload.ts              # File upload utilities
│   │   └── validation.ts          # Data validation schemas
│   ├── middleware/
│   │   ├── auth.ts                # JWT authentication middleware
│   │   ├── upload.ts              # File upload middleware (Multer)
│   │   ├── rateLimit.ts           # Rate limiting middleware
│   │   ├── validation.ts          # Request validation middleware
│   │   └── errorHandler.ts        # Global error handling middleware
│   ├── routes/
│   │   ├── auth.ts                # Authentication endpoints
│   │   ├── students.ts            # Student profile endpoints
│   │   ├── recruiters.ts          # Recruiter profile endpoints
│   │   ├── jobs.ts                # Job posting & search endpoints
│   │   ├── applications.ts        # Application management endpoints
│   │   ├── upload.ts              # File upload endpoints
│   │   └── notifications.ts       # Notification endpoints
│   ├── controllers/
│   │   ├── authController.ts      # Authentication business logic
│   │   ├── jobController.ts       # Job-related business logic
│   │   ├── applicationController.ts # Application business logic
│   │   └── notificationController.ts # Notification business logic
│   ├── services/
│   │   ├── emailService.ts        # Email sending service
│   │   ├── searchService.ts       # Search & filtering service
│   │   ├── matchingService.ts     # Job-student matching algorithm
│   │   └── analyticsService.ts    # Analytics & reporting service
│   ├── types/
│   │   ├── auth.ts                # Authentication types
│   │   ├── job.ts                 # Job-related types
│   │   ├── application.ts         # Application types
│   │   └── api.ts                 # API request/response types
│   ├── utils/
│   │   ├── constants.ts           # Application constants
│   │   ├── helpers.ts             # Utility functions
│   │   ├── logger.ts              # Logging configuration
│   │   └── security.ts            # Security utilities
│   └── server.ts                  # Main server file & configuration
├── prisma/
│   ├── schema.prisma              # Database schema definition
│   └── migrations/                # Database migration files
├── uploads/                       # Local file storage directory
│   ├── resumes/                   # Resume files
│   ├── profiles/                  # Profile pictures
│   └── documents/                 # Other documents
├── tests/                         # Test files
│   ├── unit/                      # Unit tests
│   ├── integration/               # Integration tests
│   └── e2e/                       # End-to-end tests
├── docs/                          # Documentation
│   ├── api.md                     # API documentation
│   ├── deployment.md              # Deployment guide
│   └── troubleshooting.md         # Common issues & solutions
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── .gitignore                     # Git ignore rules
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
├── docker-compose.yml             # Docker setup
├── Dockerfile                     # Container definition
└── README.md                      # This file
```

## 🔄 API Request/Response Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API Request Flow                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    Client Request
         │
         ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                        Express.js Middleware Stack                      │
    │                                                                         │
    │  1. CORS Middleware           ┌──────────────────────────────────────┐  │
    │     └─ Allow cross-origin     │     Headers Added:                   │  │
    │        requests               │     • Access-Control-Allow-Origin     │  │
    │                               │     • Access-Control-Allow-Methods    │  │
    │                               │     • Access-Control-Allow-Headers    │  │
    │                               └──────────────────────────────────────┘  │
    │                                           │                             │
    │  2. Security Middleware       ┌──────────▼──────────────────────────┐  │
    │     └─ Helmet.js              │     Security Headers Added:          │  │
    │        security headers       │     • X-Frame-Options: DENY          │  │
    │                               │     • X-Content-Type-Options: nosniff │  │
    │                               │     • X-XSS-Protection: 1; mode=block │  │
    │                               └──────────────────────────────────────┘  │
    │                                           │                             │
    │  3. Logging Middleware        ┌──────────▼──────────────────────────┐  │
    │     └─ Morgan HTTP logger     │     Log Format:                      │  │
    │                               │     POST /api/auth/login 200 12ms    │  │
    │                               │     - IP, User-Agent, Timestamp       │  │
    │                               └──────────────────────────────────────┘  │
    │                                           │                             │
    │  4. Body Parser              ┌──────────▼──────────────────────────┐  │
    │     └─ JSON & URL-encoded    │     Parses request body:             │  │
    │        request parsing       │     • application/json → req.body     │  │
    │                              │     • multipart/form-data → req.files │  │
    │                              └──────────────────────────────────────┘  │
    │                                           │                             │
    │  5. Rate Limiting            ┌──────────▼──────────────────────────┐  │
    │     └─ Prevent abuse         │     Limits per IP:                   │  │
    │        & DDoS protection     │     • 100 requests per 15 minutes    │  │
    │                              │     • 5 login attempts per hour      │  │
    │                              └──────────────────────────────────────┘  │
    └─────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                           Route Matching                                │
    │                                                                         │
    │  Express Router analyzes request:                                       │
    │  • Method: GET, POST, PUT, DELETE                                       │
    │  • Path: /api/jobs, /api/auth/login, etc.                             │
    │  • Parameters: /:id, query strings                                     │
    │                                                                         │
    │  Route Examples:                                                        │
    │  POST /api/auth/login     → authRoutes                                 │
    │  GET  /api/jobs           → jobRoutes                                  │
    │  POST /api/jobs/:id/apply → jobRoutes (with middleware)               │
    └─────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                     Authentication Middleware                           │
    │                                                                         │
    │  For protected routes:                                                  │
    │  1. Extract JWT token from Authorization header                         │
    │  2. Verify token signature using JWT_SECRET                            │
    │  3. Check token expiration                                             │
    │  4. Fetch user data from database                                      │
    │  5. Attach user to request object (req.user)                          │
    │                                                                         │
    │  If authentication fails:                                              │
    │  • Return 401 Unauthorized                                             │
    │  • Log security event                                                  │
    │  • End request processing                                              │
    └─────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                      Request Validation                                 │
    │                                                                         │
    │  Validate request data:                                                 │
    │  • Required fields presence                                            │
    │  • Data type validation                                                │
    │  • Format validation (email, phone, etc.)                             │
    │  • Business rule validation                                            │
    │                                                                         │
    │  Using Joi schemas:                                                     │
    │  const schema = Joi.object({                                           │
    │    email: Joi.string().email().required(),                            │
    │    password: Joi.string().min(8).required()                           │
    │  })                                                                    │
    │                                                                         │
    │  If validation fails:                                                  │
    │  • Return 400 Bad Request with error details                          │
    │  • Log validation error                                                │
    └─────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                      Business Logic Processing                          │
    │                                                                         │
    │  Controller functions handle:                                           │
    │  • Data transformation                                                  │
    │  • Business rule enforcement                                            │
    │  • Service layer calls                                                  │
    │  • External API integrations                                            │
    │                                                                         │
    │  Example: Job Application Process                                       │
    │  1. Check if student already applied                                    │
    │  2. Validate job is still active                                        │
    │  3. Check student eligibility                                           │
    │  4. Create application record                                           │
    │  5. Send notification to recruiter                                      │
    │  6. Update job application count                                        │
    └─────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                       Database Operations                               │
    │                                                                         │
    │  Prisma ORM handles:                                                    │
    │  • Query construction                                                   │
    │  • Type safety                                                          │
    │  • Relationship loading                                                 │
    │  • Transaction management                                               │
    │  • Connection pooling                                                   │
    │                                                                         │
    │  Example complex query:                                                 │
    │  const jobs = await prisma.job.findMany({                             │
    │    where: {                                                            │
    │      status: 'ACTIVE',                                                 │
    │      deadline: { gte: new Date() },                                    │
    │      OR: [                                                             │
    │        { title: { contains: searchTerm } },                            │
    │        { description: { contains: searchTerm } }                       │
    │      ]                                                                 │
    │    },                                                                  │
    │    include: {                                                          │
    │      recruiter: { select: { company: true } },                        │
    │      _count: { select: { applications: true } }                       │
    │    },                                                                  │
    │    orderBy: { createdAt: 'desc' },                                    │
    │    skip: (page - 1) * limit,                                          │
    │    take: limit                                                         │
    │  })                                                                    │
    └─────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                      Response Formation                                 │
    │                                                                         │
    │  Format standardized response:                                          │
    │  {                                                                      │
    │    "success": true,                                                     │
    │    "data": {                                                            │
    │      "jobs": [...],                                                     │
    │      "pagination": {                                                    │
    │        "page": 1,                                                       │
    │        "limit": 10,                                                     │
    │        "total": 25,                                                     │
    │        "pages": 3                                                       │
    │      }                                                                  │
    │    },                                                                   │
    │    "message": "Jobs retrieved successfully",                           │
    │    "timestamp": "2025-07-10T12:00:00Z"                                │
    │  }                                                                      │
    │                                                                         │
    │  Error response format:                                                 │
    │  {                                                                      │
    │    "success": false,                                                    │
    │    "error": "Validation failed",                                        │
    │    "details": [...],                                                    │
    │    "timestamp": "2025-07-10T12:00:00Z"                                │
    │  }                                                                      │
    └─────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
    ┌─────────────────────────────────────────────────────────────────────────┐
    │                      Response Middleware                                │
    │                                                                         │
    │  Final processing:                                                      │
    │  • Add response headers                                                 │
    │  • Set HTTP status codes                                                │
    │  • Compress response if needed                                          │
    │  • Log response details                                                 │
    │                                                                         │
    │  Security headers added:                                                │
    │  • Cache-Control: no-store (for sensitive data)                        │
    │  • X-Request-ID: unique identifier                                      │
    │  • X-Response-Time: processing time                                     │
    └─────────────────────────────────────────────────────────────────────────┘
                                           │
                                           ▼
                                     Client Response
```

## 🗄️ Database Architecture & Design

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Database Schema Design                            │
└─────────────────────────────────────────────────────────────────────────────┘

          ┌─────────────────────────────────────────────────────────────────┐
          │                           User                                  │
          │  ┌─────────────────────────────────────────────────────────────┤
          │  │ id: String (ObjectId, Primary Key)                         │
          │  │ email: String (Unique, Indexed)                            │
          │  │ password: String (Hashed with bcrypt)                      │
          │  │ role: Enum [STUDENT, RECRUITER]                            │
          │  │ emailVerified: Boolean (default: false)                    │
          │  │ emailVerificationToken: String?                            │
          │  │ passwordResetToken: String?                                │
          │  │ passwordResetExpires: DateTime?                            │
          │  │ lastLogin: DateTime?                                       │
          │  │ isActive: Boolean (default: true)                          │
          │  │ createdAt: DateTime                                         │
          │  │ updatedAt: DateTime                                         │
          │  └─────────────────────────────────────────────────────────────┤
          └─────────────────────────────────────────────────────────────────┘
                                        │
                   ┌────────────────────┴───────────────────┐
                   │                                        │
                   ▼                                        ▼
    ┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
    │            Student                  │    │           Recruiter                 │
    │  ┌─────────────────────────────────┤    │  ┌─────────────────────────────────┤
    │  │ id: String (ObjectId, PK)       │    │  │ id: String (ObjectId, PK)       │
    │  │ userId: String (FK → User.id)   │    │  │ userId: String (FK → User.id)   │
    │  │ firstName: String               │    │  │ firstName: String               │
    │  │ lastName: String                │    │  │ lastName: String                │
    │  │ phone: String                   │    │  │ phone: String                   │
    │  │ college: String                 │    │  │ company: String                 │
    │  │ course: String                  │    │  │ jobTitle: String                │
    │  │ year: Enum [1st, 2nd, 3rd, 4th]│    │  │ website: String?                │
    │  │ cgpa: Float                     │    │  │ companySize: Enum               │
    │  │ location: String?               │    │  │ industry: String                │
    │  │ dateOfBirth: DateTime?          │    │  │ description: String?            │
    │  │ bio: String?                    │    │  │ linkedinUrl: String?            │
    │  │ githubUrl: String?              │    │  │ twitterUrl: String?             │
    │  │ linkedinUrl: String?            │    │  │ verified: Boolean (default: false)│
    │  │ portfolioUrl: String?           │    │  │ verificationDocument: String?   │
    │  │ achievements: String[]          │    │  │ createdAt: DateTime             │
    │  │ certifications: String[]        │    │  │ updatedAt: DateTime             │
    │  │ hobbies: String[]               │    │  └─────────────────────────────────┤
    │  │ availability: Enum              │    └─────────────────────────────────────┘
    │  │ │ - IMMEDIATELY                 │                          │
    │  │ │ - WITHIN_MONTH                │                          │
    │  │ │ - WITHIN_3_MONTHS             │                          ▼
    │  │ │ - AFTER_GRADUATION            │                ┌─────────────────────────────────────┐
    │  │ expectedSalary: Float?          │                │              Job                    │
    │  │ preferredLocations: String[]    │                │  ┌─────────────────────────────────┤
    │  │ workPreference: Enum            │                │  │ id: String (ObjectId, PK)       │
    │  │ │ - REMOTE                      │                │  │ recruiterId: String (FK)        │
    │  │ │ - ONSITE                      │                │  │ title: String                   │
    │  │ │ - HYBRID                      │                │  │ slug: String (Unique, Indexed)  │
    │  │ createdAt: DateTime             │                │  │ type: Enum [INTERNSHIP, etc.]   │
    │  │ updatedAt: DateTime             │                │  │ │ - INTERNSHIP                  │
    │  │  └─────────────────────────────────┤                │  │ │ - FULL_TIME                   │
    └─────────────────────────────────────┘                │  │ │ - PART_TIME                   │
                      │                                     │  │ │ - CONTRACT                    │
                      │                                     │  │ │ - FREELANCE                   │
                      │                                     │  │ workMode: Enum [REMOTE, etc.]   │
                      │                                     │  │ │ - REMOTE                      │
                      │                                     │  │ │ - ONSITE                      │
                      │                                     │  │ │ - HYBRID                      │
                      │                                     │  │ location: String                │
                      │                                     │  │ department: String?             │
                      │                                     │  │ experienceLevel: Enum          │
                      │                                     │  │ │ - ENTRY_LEVEL                 │
                      │                                     │  │ │ - MID_LEVEL                   │
                      │                                     │  │ │ - SENIOR_LEVEL                │
                      │                                     │  │ │ - EXECUTIVE                   │
                      │                                     │  │ stipend: String?                │
                      │                                     │  │ salary: String?                 │
                      │                                     │  │ currency: String (default: USD)│
                      │                                     │  │ description: String             │
                      │                                     │  │ requirements: String            │
                      │                                     │  │ responsibilities: String?       │
                      │                                     │  │ benefits: String?               │
                      │                                     │  │ perks: String[]                 │
                      │                                     │  │ eligibleCourses: String[]       │
                      │                                     │  │ eligibleYears: String[]         │
                      │                                     │  │ minCGPA: Float?                 │
                      │                                     │  │ maxCGPA: Float?                 │
                      │                                     │  │ requiredSkills: String[]        │
                      │                                     │  │ preferredSkills: String[]       │
                      │                                     │  │ applicationDeadline: DateTime   │
                      │                                     │  │ startDate: DateTime?            │
                      │                                     │  │ duration: String?               │
                      │                                     │  │ numberOfPositions: Int          │
                      │                                     │  │ applicationCount: Int (default: 0)│
                      │                                     │  │ viewCount: Int (default: 0)     │
                      │                                     │  │ status: Enum [DRAFT, ACTIVE]    │
                      │                                     │  │ │ - DRAFT                       │
                      │                                     │  │ │ - ACTIVE                      │
                      │                                     │  │ │ - PAUSED                      │
                      │                                     │  │ │ - CLOSED                      │
                      │                                     │  │ │ - EXPIRED                     │
                      │                                     │  │ isRemote: Boolean               │
                      │                                     │  │ isUrgent: Boolean               │
                      │                                     │  │ isFeatured: Boolean             │
                      │                                     │  │ tags: String[]                  │
                      │                                     │  │ applicationInstructions: String?│
                      │                                     │  │ contactEmail: String?           │
                      │                                     │  │ contactPhone: String?           │
                      │                                     │  │ externalApplicationUrl: String? │
                      │                                     │  │ createdAt: DateTime             │
                      │                                     │  │ updatedAt: DateTime             │
                      │                                     │  └─────────────────────────────────┤
                      │                                     └─────────────────────────────────────┘
                      │                                                       │
                      │                                                       │
                      │                ┌──────────────────────────────────────┴──────────────────────────────────────┐
                      │                │                                                                               │
                      │                ▼                                                                               │
                      │  ┌─────────────────────────────────────┐                                                     │
                      │  │           Application               │                                                     │
                      │  │  ┌─────────────────────────────────┤                                                     │
                      │  │  │ id: String (ObjectId, PK)       │                                                     │
                      │  │  │ studentId: String (FK)          │◄────────────────────────────────────────────────────┘
                      │  │  │ jobId: String (FK)              │
                      │  │  │ applicationNumber: String (Auto-generated, Unique)                                     │
                      │  │  │ status: Enum [PENDING, etc.]    │
                      │  │  │ │ - PENDING                      │
                      │  │  │ │ - REVIEWING                    │
                      │  │  │ │ - SHORTLISTED                  │
                      │  │  │ │ - INTERVIEW_SCHEDULED          │
                      │  │  │ │ - INTERVIEWED                  │
                      │  │  │ │ - ACCEPTED                     │
                      │  │  │ │ - REJECTED                     │
                      │  │  │ │ - WITHDRAWN                    │
                      │  │  │ coverLetter: String?            │
                      │  │  │ resumeUrl: String?              │
                      │  │  │ portfolioUrl: String?           │
                      │  │  │ additionalDocuments: String[]   │
                      │  │  │ expectedSalary: Float?          │
                      │  │  │ availableFrom: DateTime?        │
                      │  │  │ answers: Json? (Custom Q&A)     │
                      │  │  │ priority: Enum [LOW, MEDIUM, HIGH] │
                      │  │  │ source: Enum [DIRECT, REFERRAL, etc.] │
                      │  │  │ referralCode: String?           │
                      │  │  │ notes: String? (Internal notes) │
                      │  │  │ rejectionReason: String?        │
                      │  │  │ reviewedBy: String? (Recruiter ID) │
                      │  │  │ reviewedAt: DateTime?           │
                      │  │  │ interviewScheduledAt: DateTime? │
                      │  │  │ interviewFeedback: String?      │
                      │  │  │ rating: Int? (1-5)              │
                      │  │  │ appliedAt: DateTime             │
                      │  │  │ updatedAt: DateTime             │
                      │  │  └─────────────────────────────────┤
                      │  └─────────────────────────────────────┘
                      │
                      └────────────────────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
    │                                     Additional Supporting Tables                                                    │
    └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
    │           Notification              │    │            AuditLog                 │    │           FileUpload                │
    │  ┌─────────────────────────────────┤    │  ┌─────────────────────────────────┤    │  ┌─────────────────────────────────┤
    │  │ id: String (ObjectId, PK)       │    │  │ id: String (ObjectId, PK)       │    │  │ id: String (ObjectId, PK)       │
    │  │ userId: String (FK → User.id)   │    │  │ userId: String (FK → User.id)   │    │  │ userId: String (FK → User.id)   │
    │  │ type: Enum [JOB_APPLIED, etc.]  │    │  │ action: String                  │    │  │ filename: String                │
    │  │ title: String                   │    │  │ resource: String                │    │  │ originalName: String            │
    │  │ message: String                 │    │  │ resourceId: String              │    │  │ mimetype: String                │
    │  │ data: Json?                     │    │  │ changes: Json?                  │    │  │ size: Int                       │
    │  │ read: Boolean (default: false)  │    │  │ ipAddress: String               │    │  │ path: String                    │
    │  │ priority: Enum [LOW, HIGH]      │    │  │ userAgent: String               │    │  │ url: String                     │
    │  │ channel: Enum [EMAIL, PUSH]     │    │  │ timestamp: DateTime             │    │  │ category: Enum [RESUME, etc.]   │
    │  │ createdAt: DateTime             │    │  └─────────────────────────────────┤    │  │ status: Enum [UPLOADED, etc.]   │
    │  │ readAt: DateTime?               │    └─────────────────────────────────────┘    │  │ createdAt: DateTime             │
    │  └─────────────────────────────────┤                                               │  └─────────────────────────────────┤
    └─────────────────────────────────────┘                                               └─────────────────────────────────────┘

    ┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐    ┌─────────────────────────────────────┐
    │           SavedJob                  │    │          InterviewSlot              │    │           JobView                   │
    │  ┌─────────────────────────────────┤    │  ┌─────────────────────────────────┤    │  ┌─────────────────────────────────┤
    │  │ id: String (ObjectId, PK)       │    │  │ id: String (ObjectId, PK)       │    │  │ id: String (ObjectId, PK)       │
    │  │ studentId: String (FK)          │    │  │ applicationId: String (FK)      │    │  │ jobId: String (FK)              │
    │  │ jobId: String (FK)              │    │  │ scheduledAt: DateTime           │    │  │ userId: String (FK)             │
    │  │ createdAt: DateTime             │    │  │ duration: Int (minutes)         │    │  │ ipAddress: String               │
    │  └─────────────────────────────────┤    │  │ meetingLink: String?            │    │  │ userAgent: String               │
    └─────────────────────────────────────┘    │  │ location: String?               │    │  │ referrer: String?               │
                                               │  │ interviewType: Enum             │    │  │ viewedAt: DateTime              │
                                               │  │ notes: String?                  │    │  └─────────────────────────────────┤
                                               │  │ status: Enum [SCHEDULED, etc.]  │    └─────────────────────────────────────┘
                                               │  │ createdAt: DateTime             │
                                               │  └─────────────────────────────────┤
                                               └─────────────────────────────────────┘
```

### Database Indexing Strategy for MongoDB Atlas

```javascript
// MongoDB Atlas Indexes for Optimal Performance
// These indexes are automatically created when using Prisma with MongoDB Atlas

// User Collection Indexes
db.User.createIndex({ "email": 1 }, { unique: true })
db.User.createIndex({ "role": 1 })
db.User.createIndex({ "emailVerified": 1 })
db.User.createIndex({ "isActive": 1 })
db.User.createIndex({ "createdAt": -1 })

// Student Collection Indexes
db.Student.createIndex({ "userId": 1 }, { unique: true })
db.Student.createIndex({ "college": 1 })
db.Student.createIndex({ "course": 1 })
db.Student.createIndex({ "year": 1 })
db.Student.createIndex({ "cgpa": -1 })
db.Student.createIndex({ "skills": 1 })
db.Student.createIndex({ "location": 1 })
db.Student.createIndex({ "availability": 1 })

// Recruiter Collection Indexes
db.Recruiter.createIndex({ "userId": 1 }, { unique: true })
db.Recruiter.createIndex({ "company": 1 })
db.Recruiter.createIndex({ "industry": 1 })
db.Recruiter.createIndex({ "verified": 1 })
db.Recruiter.createIndex({ "companySize": 1 })

// Job Collection Indexes
db.Job.createIndex({ "recruiterId": 1 })
db.Job.createIndex({ "status": 1 })
db.Job.createIndex({ "type": 1 })
db.Job.createIndex({ "workMode": 1 })
db.Job.createIndex({ "location": 1 })
db.Job.createIndex({ "applicationDeadline": 1 })
db.Job.createIndex({ "createdAt": -1 })
db.Job.createIndex({ "slug": 1 }, { unique: true })
db.Job.createIndex({ "isRemote": 1 })
db.Job.createIndex({ "isFeatured": 1 })
db.Job.createIndex({ "tags": 1 })
db.Job.createIndex({ "requiredSkills": 1 })
db.Job.createIndex({ "eligibleCourses": 1 })
db.Job.createIndex({ "eligibleYears": 1 })
db.Job.createIndex({ "minCGPA": 1 })

// Text Search Index for Job Search (MongoDB Atlas Search)
db.Job.createIndex({
  "title": "text",
  "description": "text",
  "requirements": "text",
  "tags": "text"
}, {
  name: "job_search_index",
  weights: {
    "title": 10,
    "tags": 5,
    "description": 2,
    "requirements": 1
  }
})

// Application Collection Indexes
db.Application.createIndex({ "studentId": 1 })
db.Application.createIndex({ "jobId": 1 })
db.Application.createIndex({ "status": 1 })
db.Application.createIndex({ "appliedAt": -1 })
db.Application.createIndex({ "priority": 1 })
db.Application.createIndex({ "reviewedBy": 1 })
db.Application.createIndex({ "applicationNumber": 1 }, { unique: true })

// Compound Indexes for Complex Queries
db.Application.createIndex({ "studentId": 1, "jobId": 1 }, { unique: true })
db.Application.createIndex({ "jobId": 1, "status": 1 })
db.Application.createIndex({ "studentId": 1, "status": 1 })
db.Application.createIndex({ "jobId": 1, "appliedAt": -1 })

// Notification Collection Indexes
db.Notification.createIndex({ "userId": 1 })
db.Notification.createIndex({ "read": 1 })
db.Notification.createIndex({ "type": 1 })
db.Notification.createIndex({ "createdAt": -1 })
db.Notification.createIndex({ "priority": 1 })

// Job View Collection Indexes (for analytics)
db.JobView.createIndex({ "jobId": 1 })
db.JobView.createIndex({ "userId": 1 })
db.JobView.createIndex({ "viewedAt": -1 })
db.JobView.createIndex({ "ipAddress": 1 })

// Audit Log Collection Indexes
db.AuditLog.createIndex({ "userId": 1 })
db.AuditLog.createIndex({ "action": 1 })
db.AuditLog.createIndex({ "resource": 1 })
db.AuditLog.createIndex({ "timestamp": -1 })

// TTL Index for temporary data (90 days retention)
db.AuditLog.createIndex({ "timestamp": 1 }, { expireAfterSeconds: 7776000 })

// Note: Prisma automatically manages most of these indexes
// You can also create custom indexes in MongoDB Atlas dashboard
```

### MongoDB Atlas Configuration Tips

**Optimizing Performance:**
1. **Connection Pooling:** Atlas handles this automatically
2. **Read Preferences:** Use `readPreference: "secondaryPreferred"` for read-heavy operations
3. **Write Concerns:** Use appropriate write concerns for data consistency
4. **Compression:** Enable network compression for better performance

**Monitoring in Atlas:**
- Use **Atlas Performance Advisor** for index recommendations
- Monitor **Real-time Performance Panel** for slow queries
- Set up **Alerts** for database metrics
- Use **Profiler** to analyze query performance

### Data Relationships & Constraints

```typescript
// Prisma Schema Relationships

model User {
  id                     String    @id @default(auto()) @map("_id") @db.ObjectId
  email                  String    @unique
  password               String
  role                   Role
  emailVerified          Boolean   @default(false)
  emailVerificationToken String?
  passwordResetToken     String?
  passwordResetExpires   DateTime?
  lastLogin              DateTime?
  isActive               Boolean   @default(true)
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt

  // Relationships
  student      Student?     @relation("UserStudent")
  recruiter    Recruiter?   @relation("UserRecruiter")
  notifications Notification[]
  auditLogs    AuditLog[]
  fileUploads  FileUpload[]
  jobViews     JobView[]

  @@map("users")
}

model Student {
  id                   String    @id @default(auto()) @map("_id") @db.ObjectId
  userId               String    @unique @db.ObjectId
  firstName            String
  lastName             String
  phone                String
  college              String
  course               String
  year                 Year
  cgpa                 Float
  location             String?
  dateOfBirth          DateTime?
  bio                  String?
  profilePic           String?
  resumeUrl            String?
  skills               String[]
  languages            String[]
  githubUrl            String?
  linkedinUrl          String?
  portfolioUrl         String?
  achievements         String[]
  certifications       String[]
  hobbies              String[]
  availability         Availability
  expectedSalary       Float?
  preferredLocations   String[]
  workPreference       WorkMode
  createdAt            DateTime  @default(now())
  updatedAt            DateTime  @updatedAt

  // Relationships
  user         User          @relation("UserStudent", fields: [userId], references: [id], onDelete: Cascade)
  applications Application[]
  savedJobs    SavedJob[]

  @@map("students")
}

model Recruiter {
  id                   String      @id @default(auto()) @map("_id") @db.ObjectId
  userId               String      @unique @db.ObjectId
  firstName            String
  lastName             String
  phone                String
  company              String
  jobTitle             String
  website              String?
  companySize          CompanySize
  industry             String
  description          String?
  linkedinUrl          String?
  twitterUrl           String?
  verified             Boolean     @default(false)
  verificationDocument String?
  createdAt            DateTime    @default(now())
  updatedAt            DateTime    @updatedAt

  // Relationships
  user User @relation("UserRecruiter", fields: [userId], references: [id], onDelete: Cascade)
  jobs Job[]

  @@map("recruiters")
}

model Job {
  id                      String            @id @default(auto()) @map("_id") @db.ObjectId
  recruiterId             String            @db.ObjectId
  title                   String
  slug                    String            @unique
  type                    JobType
  workMode                WorkMode
  location                String
  department              String?
  experienceLevel         ExperienceLevel
  stipend                 String?
  salary                  String?
  currency                String            @default("USD")
  description             String
  requirements            String
  responsibilities        String?
  benefits                String?
  perks                   String[]
  eligibleCourses         String[]
  eligibleYears           String[]
  minCGPA                 Float?
  maxCGPA                 Float?
  requiredSkills          String[]
  preferredSkills         String[]
  applicationDeadline     DateTime
  startDate               DateTime?
  duration                String?
  numberOfPositions       Int               @default(1)
  applicationCount        Int               @default(0)
  viewCount               Int               @default(0)
  status                  JobStatus
  isRemote                Boolean           @default(false)
  isUrgent                Boolean           @default(false)
  isFeatured              Boolean           @default(false)
  tags                    String[]
  applicationInstructions String?
  contactEmail            String?
  contactPhone            String?
  externalApplicationUrl  String?
  createdAt               DateTime          @default(now())
  updatedAt               DateTime          @updatedAt

  // Relationships
  recruiter    Recruiter     @relation(fields: [recruiterId], references: [id], onDelete: Cascade)
  applications Application[]
  savedJobs    SavedJob[]
  jobViews     JobView[]

  @@map("jobs")
}

model Application {
  id                    String              @id @default(auto()) @map("_id") @db.ObjectId
  studentId             String              @db.ObjectId
  jobId                 String              @db.ObjectId
  applicationNumber     String              @unique
  status                ApplicationStatus
  coverLetter           String?
  resumeUrl             String?
  portfolioUrl          String?
  additionalDocuments   String[]
  expectedSalary        Float?
  availableFrom         DateTime?
  answers               Json?
  priority              Priority            @default(MEDIUM)
  source                ApplicationSource   @default(DIRECT)
  referralCode          String?
  notes                 String?
  rejectionReason       String?
  reviewedBy            String?
  reviewedAt            DateTime?
  interviewScheduledAt  DateTime?
  interviewFeedback     String?
  rating                Int?
  appliedAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relationships
  student        Student         @relation(fields: [studentId], references: [id], onDelete: Cascade)
  job            Job             @relation(fields: [jobId], references: [id], onDelete: Cascade)
  interviewSlots InterviewSlot[]

  @@unique([studentId, jobId])
  @@map("applications")
}

// Enums
enum Role {
  STUDENT
  RECRUITER
}

enum Year {
  FIRST_YEAR
  SECOND_YEAR
  THIRD_YEAR
  FOURTH_YEAR
  GRADUATE
}

enum Availability {
  IMMEDIATELY
  WITHIN_MONTH
  WITHIN_3_MONTHS
  AFTER_GRADUATION
}

enum WorkMode {
  REMOTE
  ONSITE
  HYBRID
}

enum CompanySize {
  STARTUP
  SMALL
  MEDIUM
  LARGE
}

enum JobType {
  INTERNSHIP
  FULL_TIME
  PART_TIME
  CONTRACT
  FREELANCE
}

enum ExperienceLevel {
  ENTRY_LEVEL
  MID_LEVEL
  SENIOR_LEVEL
  EXECUTIVE
}

enum JobStatus {
  DRAFT
  ACTIVE
  PAUSED
  CLOSED
  EXPIRED
}

enum ApplicationStatus {
  PENDING
  REVIEWING
  SHORTLISTED
  INTERVIEW_SCHEDULED
  INTERVIEWED
  ACCEPTED
  REJECTED
  WITHDRAWN
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

enum ApplicationSource {
  DIRECT
  REFERRAL
  SOCIAL_MEDIA
  JOB_BOARD
  CAMPUS_DRIVE
}
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
   
   # Push schema to database (MongoDB Atlas)
   npx prisma db push
   
   # Verify connection and view data
   npx prisma studio
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

## 🗄️ Database Management with Prisma

### MongoDB Atlas Connection

This backend uses **MongoDB Atlas** (cloud MongoDB) as the database with **Prisma ORM** for type-safe database operations.

**Why MongoDB Atlas + Prisma?**
- **Serverless & Scalable:** MongoDB Atlas handles scaling automatically
- **Type Safety:** Prisma generates TypeScript types from your schema
- **Developer Experience:** Excellent tooling with Prisma Studio
- **Performance:** Built-in connection pooling and query optimization
- **Security:** Enterprise-grade security features in Atlas

### Database Schema Management

```bash
# Generate Prisma Client (after schema changes)
npx prisma generate

# Push schema changes to database
npx prisma db push

# Reset database (development only)
npx prisma db push --force-reset

# Validate schema
npx prisma validate

# Format schema file
npx prisma format
```

### Prisma Studio - Visual Database Browser

**Quick Start:**
```bash
# Start Prisma Studio
npm run db:studio
# OR
npx prisma studio

# Access at: http://localhost:5555
```

**Studio Features:**
- 📊 **Visual Data Browser:** See all your collections and relationships
- ✏️ **Edit Data:** Add, update, delete records with validation
- 🔍 **Advanced Filtering:** Filter by any field with complex conditions
- 🔗 **Relationship Navigation:** Click through related records easily
- 📋 **Export Data:** Export filtered data as JSON or CSV
- 🔄 **Real-time Updates:** See changes immediately as they happen

**Studio Interface Guide:**
```
┌─────────────────────────────────────────────────────────────────┐
│                     Prisma Studio Interface                     │
├─────────────────────────────────────────────────────────────────┤
│ Left Sidebar: Collections List                                 │
│ ├── 👤 User (Authentication records)                            │
│ ├── 🎓 Student (Student profiles)                               │
│ ├── 🏢 Recruiter (Company profiles)                             │
│ ├── 💼 Job (Job postings)                                       │
│ ├── 📄 Application (Job applications)                           │
│ └── 🔔 Notification (System notifications)                      │
│                                                                 │
│ Main Area: Data Grid                                            │
│ ├── 📋 Table view with sortable columns                         │
│ ├── 🔍 Search and filter controls                               │
│ ├── ➕ Add new record button                                     │
│ └── ⚙️ Bulk action controls                                      │
│                                                                 │
│ Right Panel: Record Details                                     │
│ ├── 📝 Edit form for selected record                            │
│ ├── 🔗 Related records navigation                               │
│ └── 📊 Field validation and constraints                         │
└─────────────────────────────────────────────────────────────────┘
```

### Common Operations

#### Viewing Data
- **Click on any collection** (User, Student, Job, etc.) from the sidebar
- **Browse records** in the main table view
- **Navigate relationships** by clicking on relation fields

#### Adding Records
1. Select a collection from the sidebar
2. Click the **"Add Record"** button
3. Fill in the form fields
4. Click **"Save"** to create the record

#### Editing Records
1. Click on any record in the table
2. Modify the fields in the edit form
3. Click **"Save"** to update

#### Filtering & Searching
- Use the **filter bar** at the top to search specific fields
- Apply **multiple filters** for complex queries
- Use **sorting** by clicking column headers

#### Relationship Navigation
- Click on **relation fields** (shown as links)
- Automatically navigate to related records
- View **foreign key relationships** visually

### Troubleshooting Prisma Studio

#### Studio Won't Start
```bash
# Check if Prisma client is generated
npx prisma generate

# Validate your schema
npx prisma validate

# Check database connection
npx prisma db push --preview-feature
```

#### Can't Connect to Database
1. **Check Environment Variables**: Ensure `DATABASE_URL` is correctly set
2. **Verify MongoDB Atlas**: Confirm your cluster is running
3. **Check Network**: Ensure your IP is whitelisted in MongoDB Atlas
4. **Test Connection**: Use `npx prisma db push` to test connectivity

#### Studio Shows No Data
1. **Check Collections**: Verify data exists in your MongoDB Atlas dashboard
2. **Refresh Schema**: Run `npx prisma generate` after schema changes
3. **Clear Cache**: Restart Studio if data isn't updating

### Best Practices

#### Development Workflow
1. **Use Studio for debugging** - quickly check if data is being saved correctly
2. **Test relationships** - verify foreign keys are properly linked
3. **Validate data integrity** - check for orphaned records or inconsistencies
4. **Prototype quickly** - add test data without writing code

#### Production Considerations
- **Never expose Studio** in production environments
- **Use Studio locally** for development and debugging only
- **Backup before bulk operations** - Studio operations are permanent
- **Monitor performance** - large datasets may load slowly

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add new record | `Ctrl + N` |
| Save changes | `Ctrl + S` |
| Refresh data | `Ctrl + R` |
| Search/Filter | `Ctrl + F` |
| Navigate collections | `↑/↓` arrows |

### Integration with Development

#### Using Studio with Development Server
```bash
# Terminal 1: Start your backend server
npm run dev

# Terminal 2: Start Prisma Studio
npm run db:studio

# Now you can:
# - Make API calls to your backend
# - Immediately see changes in Studio
# - Debug data issues in real-time
```

#### Debugging Application Issues
1. **API returns unexpected data** → Check collection records in Studio
2. **Authentication fails** → Verify user exists in User collection
3. **Relationships broken** → Check foreign key fields in Studio
4. **Data validation errors** → Inspect field values and types

This comprehensive guide should help you effectively use Prisma Studio for database management and debugging!
