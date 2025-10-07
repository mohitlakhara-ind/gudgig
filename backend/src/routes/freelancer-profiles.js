import express from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import {
  getFreelancerProfile,
  getMyFreelancerProfile,
  createFreelancerProfile,
  updateFreelancerProfile,
  deleteFreelancerProfile,
  uploadPortfolioImages,
  getFreelancerStats
} from '../controllers/freelancerProfileController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Validation middleware
const profileValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Bio must be between 50 and 1000 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*.name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Skill name must be between 1 and 50 characters'),
  body('skills.*.level')
    .optional()
    .isIn(['beginner', 'intermediate', 'expert'])
    .withMessage('Skill level must be beginner, intermediate, or expert'),
  body('hourlyRate.min')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Minimum hourly rate must be at least $1'),
  body('hourlyRate.max')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Maximum hourly rate must be at least $1'),
  body('availability.status')
    .optional()
    .isIn(['available', 'busy', 'unavailable'])
    .withMessage('Availability status must be available, busy, or unavailable'),
  body('languages')
    .optional()
    .isArray()
    .withMessage('Languages must be an array'),
  body('languages.*.proficiency')
    .optional()
    .isIn(['basic', 'conversational', 'fluent', 'native'])
    .withMessage('Language proficiency must be basic, conversational, fluent, or native')
];

// Protected routes (register before public dynamic route to avoid conflicts like /my)
router.use(protect);

// Freelancer routes
router.get('/my/profile',
  authorize('freelancer'),
  getMyFreelancerProfile
);

// Alternative route for frontend compatibility
router.get('/my',
  authorize('freelancer'),
  getMyFreelancerProfile
);

router.get('/my/stats',
  authorize('freelancer'),
  getFreelancerStats
);

router.post('/',
  authorize('freelancer'),
  profileValidation,
  createFreelancerProfile
);

router.put('/my',
  authorize('freelancer'),
  profileValidation,
  updateFreelancerProfile
);

router.delete('/my',
  authorize('freelancer'),
  deleteFreelancerProfile
);

// Portfolio image upload
router.post('/my/portfolio/:portfolioId/images',
  authorize('freelancer'),
  param('portfolioId').isMongoId().withMessage('Invalid portfolio ID'),
  upload.array('images', 10),
  uploadPortfolioImages
);

// Public route (placed after protected routes to prevent capturing "/my")
router.get('/:userId',
  param('userId').isMongoId().withMessage('Invalid user ID'),
  getFreelancerProfile
);

export default router;
