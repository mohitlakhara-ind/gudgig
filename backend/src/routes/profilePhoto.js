import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import {
  uploadProfilePhoto,
  deleteProfilePhoto,
  getProfilePhoto
} from '../controllers/profilePhotoController.js';

const router = express.Router();

// Configure multer for memory storage with file size limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Only one file at a time
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Apply authentication middleware to all routes
router.use(protect);

// @route   GET /api/profile/photo
// @desc    Get current profile photo info
// @access  Private
router.get('/', getProfilePhoto);

// @route   POST /api/profile/photo
// @desc    Upload profile photo
// @access  Private
router.post('/', upload.single('photo'), uploadProfilePhoto);

// @route   DELETE /api/profile/photo
// @desc    Delete profile photo
// @access  Private
router.delete('/', deleteProfilePhoto);

export default router;
