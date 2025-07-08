"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
// Get student profile
router.get('/:id', async (req, res) => {
    try {
        const student = await prisma_1.prisma.student.findUnique({
            where: { id: req.params.id },
            include: {
                user: true,
                projects: true,
                experiences: true,
                certifications: true,
                applications: {
                    include: {
                        job: {
                            include: {
                                recruiter: true,
                            },
                        },
                    },
                },
            },
        });
        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }
        res.json(student);
    }
    catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Update student profile
router.put('/:id', async (req, res) => {
    try {
        const { projects, experiences, certifications, ...updateData } = req.body;
        // Update student profile
        const updatedStudent = await prisma_1.prisma.student.update({
            where: { id: req.params.id },
            data: updateData,
        });
        // Update projects if provided
        if (projects) {
            await prisma_1.prisma.project.deleteMany({
                where: { studentId: req.params.id },
            });
            if (projects.length > 0) {
                await prisma_1.prisma.project.createMany({
                    data: projects.map((project) => ({
                        ...project,
                        studentId: req.params.id,
                    })),
                });
            }
        }
        // Update experiences if provided
        if (experiences) {
            await prisma_1.prisma.experience.deleteMany({
                where: { studentId: req.params.id },
            });
            if (experiences.length > 0) {
                await prisma_1.prisma.experience.createMany({
                    data: experiences.map((exp) => ({
                        ...exp,
                        studentId: req.params.id,
                    })),
                });
            }
        }
        // Update certifications if provided
        if (certifications) {
            await prisma_1.prisma.certification.deleteMany({
                where: { studentId: req.params.id },
            });
            if (certifications.length > 0) {
                await prisma_1.prisma.certification.createMany({
                    data: certifications.map((cert) => ({
                        ...cert,
                        studentId: req.params.id,
                    })),
                });
            }
        }
        res.json(updatedStudent);
    }
    catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=students.js.map