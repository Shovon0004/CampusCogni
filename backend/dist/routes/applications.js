"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get applications
router.get('/', async (req, res) => {
    try {
        const { userId, recruiterId } = req.query;
        console.log('DEBUG: Request received with userId:', userId, 'recruiterId:', recruiterId);
        let applications;
        if (userId) {
            // Validate userId format (MongoDB ObjectId)
            if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
                console.log('DEBUG: Invalid user ID format:', userId);
                return res.status(400).json({ error: 'Invalid user ID format' });
            }
            // Get user's applications (users with USER role)
            console.log('DEBUG: Looking for user with ID:', userId);
            let user = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
                include: { student: true }
            });
            console.log('DEBUG: Found user:', user ? { id: user.id, email: user.email, role: user.role } : 'null');
            if (!user) {
                console.log('DEBUG: User not found for ID:', userId);
                return res.status(404).json({ error: 'User not found' });
            }
            if (user.role !== 'USER') {
                console.log('DEBUG: User role mismatch - expected USER, got:', user.role);
                return res.status(400).json({ error: 'User is not a student' });
            }
            // If user doesn't have a student profile, create a basic one
            if (!user.student) {
                console.log('DEBUG: Creating student profile for user:', user.id);
                const newStudent = await prisma_1.prisma.student.create({
                    data: {
                        userId: user.id,
                        firstName: user.email.split('@')[0] || 'Unknown',
                        lastName: 'User',
                        college: 'Unknown College',
                        course: 'Computer Science',
                        year: '3rd Year',
                        cgpa: 7.0,
                        skills: []
                    }
                });
                console.log('DEBUG: Created student profile:', newStudent.id);
                // Refetch user with student data
                user = await prisma_1.prisma.user.findUnique({
                    where: { id: userId },
                    include: { student: true }
                });
            }
            console.log('DEBUG: Fetching applications for student:', user.student.id);
            applications = await prisma_1.prisma.application.findMany({
                where: { studentId: user.student.id },
                include: {
                    job: {
                        include: {
                            recruiter: {
                                select: {
                                    company: true,
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    },
                },
                orderBy: { appliedAt: 'desc' },
            });
            console.log('DEBUG: Found applications:', applications.length);
        }
        else if (recruiterId) {
            // Get recruiter's job applications
            applications = await prisma_1.prisma.application.findMany({
                where: {
                    job: {
                        recruiterId,
                    },
                },
                include: {
                    student: {
                        select: {
                            firstName: true,
                            lastName: true,
                            college: true,
                            course: true,
                            year: true,
                            cgpa: true,
                            resumeUrl: true,
                            skills: true,
                            profilePic: true,
                        },
                    },
                    job: {
                        select: {
                            title: true,
                            type: true,
                            location: true,
                            stipend: true,
                        },
                    },
                },
                orderBy: { appliedAt: 'desc' },
            });
        }
        res.json(applications);
    }
    catch (error) {
        console.error('Error in applications route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update application status
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedApplication = await prisma_1.prisma.application.update({
            where: { id: req.params.id },
            data: { status },
            include: {
                student: {
                    select: {
                        firstName: true,
                        lastName: true,
                        college: true,
                        course: true,
                        year: true,
                        cgpa: true,
                    },
                },
                job: {
                    select: {
                        title: true,
                        type: true,
                        location: true,
                        stipend: true,
                    },
                },
            },
        });
        res.json(updatedApplication);
    }
    catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=applications.js.map