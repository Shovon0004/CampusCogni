"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Allow common file types
        const allowedMimeTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/jpg'
        ];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type'));
        }
    }
});
// Upload file endpoint - Fix the TypeScript error by using proper typing
router.post('/', (req, res) => {
    upload.single('file')(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            return res.status(400).json({ error: err.message });
        }
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            // For now, just return a mock URL
            // In production, you would upload to Vercel Blob or AWS S3
            const mockUrl = `https://example.com/uploads/${Date.now()}-${req.file.originalname}`;
            res.json({
                url: mockUrl,
                filename: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype
            });
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Upload failed' });
        }
    });
});
exports.default = router;
//# sourceMappingURL=upload.js.map