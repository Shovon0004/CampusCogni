# CampusCogni Backend

Backend API for the CampusCogni campus recruitment platform built with Node.js, Express, TypeScript, Prisma, and MongoDB.

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM
- **MongoDB Atlas** - Cloud database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File uploads

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account

### Installation

1. Clone the repository and navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the environment variables with your values

4. Generate Prisma client:
   ```bash
   npm run db:generate
   ```

5. Push database schema:
   ```bash
   npm run db:push
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify JWT token

### Students
- `GET /api/students/:id` - Get student profile
- `PUT /api/students/:id` - Update student profile

### Recruiters
- `GET /api/recruiters/:id/jobs` - Get recruiter's jobs

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job details
- `POST /api/jobs/:id/apply` - Apply to job

### Applications
- `GET /api/applications` - Get applications (filtered by user)
- `PUT /api/applications/:id/status` - Update application status

### File Upload
- `POST /api/upload` - Upload files

### Notifications
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read

## Database Schema

The application uses MongoDB with the following main collections:
- Users (students and recruiters)
- Students (student profiles)
- Recruiters (recruiter profiles)
- Jobs (job postings)
- Applications (job applications)
- Projects (student projects)
- Experiences (student work experience)
- Certifications (student certifications)
- Notifications (system notifications)

## Environment Variables

```env
# Database
DATABASE_URL="your-mongodb-connection-string"

# JWT
JWT_SECRET="your-jwt-secret"

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# File Storage (optional)
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"

# Email Service (optional)
RESEND_API_KEY="your-resend-api-key"
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## Deployment

### Option 1: Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Option 2: Railway
1. Connect your GitHub repository to Railway
2. Set environment variables
3. Deploy

### Option 3: Heroku
1. Create Heroku app
2. Set environment variables
3. Deploy with Git

## Production Considerations

- Set strong JWT secret
- Configure CORS properly
- Set up rate limiting
- Add input validation
- Set up monitoring and logging
- Configure database indexes
- Set up backup strategy

## License

MIT
