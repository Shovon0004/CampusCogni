import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma';
import { uploadToImageKit, getImageKitAuthParams, isImageKitAvailable } from '../lib/imagekit';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

// Configure multer for memory storage
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get ImageKit authentication parameters
router.get('/auth', authenticateToken, (req: Request, res: Response) => {
  try {
    if (!isImageKitAvailable()) {
      res.status(503).json({ 
        error: 'ImageKit service is currently unavailable',
        message: 'Profile picture upload is disabled' 
      });
      return;
    }
    
    const authParams = getImageKitAuthParams();
    res.json(authParams);
  } catch (error) {
    console.error('Error getting ImageKit auth params:', error);
    res.status(500).json({ error: 'Failed to get authentication parameters' });
  }
});

// Upload profile picture for student
router.post('/student/profile-picture', authenticateToken, upload.single('profilePic'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isImageKitAvailable()) {
      res.status(503).json({
        error: 'Profile picture upload is currently unavailable',
        message: 'ImageKit service not configured'
      });
      return;
    }

    const userId = (req as any).user.id;
    
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Find student
    const student = await prisma.student.findUnique({
      where: { userId }
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    // Upload to ImageKit
    const fileName = `student_${student.id}_${Date.now()}.${req.file.originalname.split('.').pop()}`;
    const imageUrl = await uploadToImageKit(req.file.buffer, fileName, 'students');

    // Update student profile with new image URL
    const updatedStudent = await prisma.student.update({
      where: { userId },
      data: { profilePic: imageUrl }
    });

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePic: imageUrl,
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error uploading student profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Upload profile picture for recruiter
router.post('/recruiter/profile-picture', authenticateToken, upload.single('profilePic'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!isImageKitAvailable()) {
      res.status(503).json({
        error: 'Profile picture upload is currently unavailable',
        message: 'ImageKit service not configured'
      });
      return;
    }

    const userId = (req as any).user.id;
    
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // Find recruiter
    const recruiter = await prisma.recruiter.findUnique({
      where: { userId }
    });

    if (!recruiter) {
      res.status(404).json({ error: 'Recruiter profile not found' });
      return;
    }

    // Upload to ImageKit
    const fileName = `recruiter_${recruiter.id}_${Date.now()}.${req.file.originalname.split('.').pop()}`;
    const imageUrl = await uploadToImageKit(req.file.buffer, fileName, 'recruiters');

    // Update recruiter profile with new image URL
    const updatedRecruiter = await prisma.recruiter.update({
      where: { userId },
      data: { 
        // profilePic: imageUrl  // TODO: Fix this after Prisma types are updated
      }
    });

    res.json({
      message: 'Profile picture uploaded successfully',
      profilePic: imageUrl,
      recruiter: updatedRecruiter
    });

  } catch (error) {
    console.error('Error uploading recruiter profile picture:', error);
    res.status(500).json({ error: 'Failed to upload profile picture' });
  }
});

// Delete profile picture for student
router.delete('/student/profile-picture', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!isImageKitAvailable()) {
      res.status(503).json({
        error: 'Profile picture service is currently unavailable',
        message: 'ImageKit service not configured'
      });
      return;
    }

    const userId = (req as any).user.id;

    // Update student profile to remove profile picture
    const updatedStudent = await prisma.student.update({
      where: { userId },
      data: { profilePic: null }
    });

    res.json({
      message: 'Profile picture removed successfully',
      student: updatedStudent
    });

  } catch (error) {
    console.error('Error removing student profile picture:', error);
    res.status(500).json({ error: 'Failed to remove profile picture' });
  }
});

// Delete profile picture for recruiter
router.delete('/recruiter/profile-picture', authenticateToken, async (req: Request, res: Response) => {
  try {
    if (!isImageKitAvailable()) {
      res.status(503).json({
        error: 'Profile picture service is currently unavailable',
        message: 'ImageKit service not configured'
      });
      return;
    }

    const userId = (req as any).user.id;

    // Update recruiter profile to remove profile picture
    const updatedRecruiter = await prisma.recruiter.update({
      where: { userId },
      data: { 
        // profilePic: null  // TODO: Fix this after Prisma types are updated
      }
    });

    res.json({
      message: 'Profile picture removed successfully',
      recruiter: updatedRecruiter
    });

  } catch (error) {
    console.error('Error removing recruiter profile picture:', error);
    res.status(500).json({ error: 'Failed to remove profile picture' });
  }
});

export default router;
