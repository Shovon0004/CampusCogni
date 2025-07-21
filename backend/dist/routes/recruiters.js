"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Recruiters route is working' });
});
// Get recruiter profile by user ID
router.get('/:userId', async (req, res) => {
    try {
        console.log('Fetching recruiter for userId:', req.params.userId);
        // First check if user exists
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: req.params.userId },
            include: {
                student: true,
                recruiter: true,
            },
        });
        if (!user) {
            console.log('User not found for ID:', req.params.userId);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('User found:', user.email, 'Role:', user.role);
        console.log('Has student profile:', !!user.student);
        console.log('Has recruiter profile:', !!user.recruiter);
        if (!user.recruiter) {
            console.log('No recruiter profile found for userId:', req.params.userId);
            return res.status(404).json({
                error: 'Recruiter profile not found',
                debug: {
                    userId: req.params.userId,
                    userExists: true,
                    userRole: user.role,
                    hasStudentProfile: !!user.student,
                    hasRecruiterProfile: !!user.recruiter
                }
            });
        }
        console.log('Returning recruiter data for:', user.recruiter.firstName, user.recruiter.lastName);
        res.json(user.recruiter);
    }
    catch (error) {
        console.error('Error fetching recruiter:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get recruiter jobs
router.get('/:id/jobs', async (req, res) => {
    try {
        const jobs = await prisma_1.prisma.job.findMany({
            where: { recruiterId: req.params.id },
            include: {
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(jobs);
    }
    catch (error) {
        console.error('Error fetching recruiter jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update recruiter profile
router.put('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;
        // Find the recruiter first
        const existingRecruiter = await prisma_1.prisma.recruiter.findUnique({
            where: { userId },
        });
        if (!existingRecruiter) {
            return res.status(404).json({ error: 'Recruiter not found' });
        }
        // Update the recruiter
        const updatedRecruiter = await prisma_1.prisma.recruiter.update({
            where: { userId },
            data: {
                firstName: updateData.firstName,
                lastName: updateData.lastName,
                phone: updateData.phone,
                company: updateData.company,
                jobTitle: updateData.jobTitle,
                website: updateData.website,
                companySize: updateData.companySize,
                industry: updateData.industry,
                description: updateData.description,
            },
            include: {
                user: true,
            },
        });
        res.json(updatedRecruiter);
    }
    catch (error) {
        console.error('Error updating recruiter:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Check and update user role based on profiles
router.post('/check-role/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        console.log('Checking role for userId:', userId);
        // Check if user has both student and recruiter profiles
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                student: true,
                recruiter: true,
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('User found:', user.email);
        console.log('Has student profile:', !!user.student);
        console.log('Has recruiter profile:', !!user.recruiter);
        console.log('Current role:', user.role);
        // Determine correct role
        let correctRole = user.role;
        if (user.student && user.recruiter) {
            correctRole = 'BOTH';
        }
        else if (user.student) {
            correctRole = 'USER';
        }
        else if (user.recruiter) {
            correctRole = 'RECRUITER';
        }
        console.log('Correct role should be:', correctRole);
        // Update role if needed
        if (user.role !== correctRole) {
            console.log('Updating role from', user.role, 'to', correctRole);
            const updatedUser = await prisma_1.prisma.user.update({
                where: { id: userId },
                data: { role: correctRole },
                include: {
                    student: true,
                    recruiter: true,
                },
            });
            res.json({
                roleUpdated: true,
                oldRole: user.role,
                newRole: correctRole,
                user: updatedUser
            });
        }
        else {
            res.json({
                roleUpdated: false,
                role: correctRole,
                user
            });
        }
    }
    catch (error) {
        console.error('Error checking/updating role:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=recruiters.js.map