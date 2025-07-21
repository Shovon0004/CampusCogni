import express, { Request, Response } from 'express'
import multer from 'multer'

const router: express.Router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ 
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
    ]
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  }
})

// Upload file endpoint - Fix the TypeScript error by using proper typing
router.post('/', (req: Request, res: Response) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err)
      return res.status(400).json({ error: err.message })
    }

    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' })
      }

      // For now, just return a mock URL
      // In production, you would upload to Vercel Blob or AWS S3
      const mockUrl = `https://example.com/uploads/${Date.now()}-${req.file.originalname}`
      
      res.json({ 
        url: mockUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      })
    } catch (error) {
      console.error('Upload error:', error)
      res.status(500).json({ error: 'Upload failed' })
    }
  })
})

export default router
