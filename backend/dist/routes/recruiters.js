"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prisma_1 = require("../lib/prisma");
const router = express_1.default.Router();
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
exports.default = router;
//# sourceMappingURL=recruiters.js.map