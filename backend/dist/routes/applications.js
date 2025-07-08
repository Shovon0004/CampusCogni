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
        let applications;
        if (userId) {
            // Get student's applications
            const student = await prisma_1.prisma.student.findUnique({
                where: { userId },
            });
            if (!student) {
                return res.status(404).json({ error: 'Student not found' });
            }
            applications = await prisma_1.prisma.application.findMany({
                where: { studentId: student.id },
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
        console.error('Error fetching applications:', error);
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