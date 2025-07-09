"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, role, ...profileData } = req.body;
        // Validate required fields
        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Email, password, and role are required' });
        }
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role,
            }
        });
        // Create profile based on role
        if (role === 'USER') {
            await prisma_1.prisma.student.create({
                data: {
                    userId: user.id,
                    firstName: profileData.firstName || '',
                    lastName: profileData.lastName || '',
                    phone: profileData.phone || '',
                    college: profileData.college || '',
                    course: profileData.course || '',
                    year: profileData.year || '',
                    cgpa: profileData.cgpa || 0,
                    location: profileData.location || null,
                    bio: profileData.bio || null,
                    profilePic: profileData.profilePic || null,
                    resumeUrl: profileData.resumeUrl || null,
                    skills: profileData.skills || [],
                }
            });
        }
        else if (role === 'RECRUITER') {
            await prisma_1.prisma.recruiter.create({
                data: {
                    userId: user.id,
                    firstName: profileData.firstName || '',
                    lastName: profileData.lastName || '',
                    phone: profileData.phone || '',
                    company: profileData.company || '',
                    jobTitle: profileData.jobTitle || '',
                    website: profileData.website || null,
                    companySize: profileData.companySize || 'STARTUP',
                    industry: profileData.industry || '',
                    description: profileData.description || null,
                }
            });
        }
        // Generate JWT token for automatic login
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        // Find user
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: {
                student: true,
                recruiter: true,
            }
        });
        if (!user || !user.password) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Check password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: user.student || user.recruiter,
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Verify token
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                student: true,
                recruiter: true,
            }
        });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        res.json({
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: user.student || user.recruiter,
            }
        });
    }
    catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
});
// Demo login for development - creates user if doesn't exist
router.post('/demo-login', async (req, res) => {
    try {
        const { email, role = 'USER' } = req.body;
        console.log('DEBUG: Demo login request for email:', email, 'role:', role);
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        // Find or create user
        let user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: { student: true, recruiter: true }
        });
        console.log('DEBUG: Found existing user:', user ? { id: user.id, email: user.email, role: user.role } : 'null');
        if (!user) {
            // Create new user
            user = await prisma_1.prisma.user.create({
                data: {
                    email,
                    password: '', // Demo users don't need passwords
                    role: role,
                },
                include: { student: true, recruiter: true }
            });
            console.log('DEBUG: Created new user:', { id: user.id, email: user.email, role: user.role });
            // Create profile based on role
            if (role === 'USER') {
                await prisma_1.prisma.student.create({
                    data: {
                        userId: user.id,
                        firstName: email.split('@')[0] || 'User',
                        lastName: 'Demo',
                        phone: '',
                        college: 'Demo College',
                        course: 'Computer Science',
                        year: '3rd Year',
                        cgpa: 7.0,
                        skills: []
                    }
                });
            }
            else if (role === 'RECRUITER') {
                await prisma_1.prisma.recruiter.create({
                    data: {
                        userId: user.id,
                        firstName: email.split('@')[0] || 'Recruiter',
                        lastName: 'Demo',
                        phone: '',
                        company: 'Demo Company',
                        jobTitle: 'HR Manager',
                        companySize: 'MEDIUM',
                        industry: 'Technology'
                    }
                });
            }
            // Refetch user with profile data
            user = await prisma_1.prisma.user.findUnique({
                where: { email },
                include: { student: true, recruiter: true }
            });
        }
        console.log('DEBUG: Generating JWT for user ID:', user.id);
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'demo-secret', { expiresIn: '24h' });
        console.log('DEBUG: Generated token payload:', { userId: user.id, email: user.email, role: user.role });
        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                profile: user.student || user.recruiter
            }
        });
    }
    catch (error) {
        console.error('Demo login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Upgrade user to recruiter
router.post('/upgrade-to-recruiter', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'demo-secret');
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { student: true, recruiter: true }
        });
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }
        if (user.role === 'RECRUITER') {
            return res.status(400).json({ error: 'User is already a recruiter' });
        }
        // Update user role
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: { role: 'RECRUITER' }
        });
        // Create recruiter profile
        const recruiterData = req.body;
        await prisma_1.prisma.recruiter.create({
            data: {
                userId: user.id,
                firstName: recruiterData.firstName || user.student?.firstName || 'Recruiter',
                lastName: recruiterData.lastName || user.student?.lastName || 'Demo',
                phone: recruiterData.phone || user.student?.phone || '',
                company: recruiterData.company || 'Demo Company',
                jobTitle: recruiterData.jobTitle || 'HR Manager',
                website: recruiterData.website || null,
                companySize: recruiterData.companySize || 'MEDIUM',
                industry: recruiterData.industry || 'Technology',
                description: recruiterData.description || null,
            }
        });
        // Fetch updated user with recruiter profile
        const updatedUser = await prisma_1.prisma.user.findUnique({
            where: { id: user.id },
            include: { student: true, recruiter: true }
        });
        res.json({
            message: 'User upgraded to recruiter successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                role: updatedUser.role,
                profile: updatedUser.recruiter
            }
        });
    }
    catch (error) {
        console.error('Upgrade to recruiter error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map