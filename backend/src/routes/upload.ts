import express from 'express'
import multer from 'multer'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({ storage })

// Upload file endpoint
router.post('/', upload.single('file'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    // For now, just return a mock URL
    // In production, you would upload to Vercel Blob or AWS S3
    const mockUrl = `https://example.com/uploads/${Date.now()}-${req.file.originalname}`
    
    res.json({ url: mockUrl })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

export default router
