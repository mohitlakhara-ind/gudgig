import express from 'express';
import { body } from 'express-validator';
import path from 'path';
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProfile,
  uploadResume,
  getUserStats
} from '../controllers/userController.js';
import {
  uploadUserResume,
  uploadUserAvatar
} from '../controllers/uploadController.js';
import { protect, authorize } from '../middleware/auth.js';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp/'); // Temporary storage before Cloudinary upload
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf' ||
        file.mimetype === 'application/msword' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and Word documents are allowed'));
    }
  }
});

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/temp/');
  },
  filename: function (req, file, cb) {
    cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit for images
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const router = express.Router();

// Validation rules
const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot be more than 500 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('experience')
    .optional()
    .isIn(['fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years'])
    .withMessage('Invalid experience level'),
  body('role')
    .optional()
    .isIn(['jobseeker', 'employer', 'admin'])
    .withMessage('Invalid role')
];

// Public routes
router.get('/profile/:id', getUserProfile);

// Protected routes
router.use(protect);

// User routes
router.get('/me', (req, res) => res.json({ user: req.user }));

const setUserIdFromAuth = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
router.put('/me', updateUserValidation, setUserIdFromAuth, updateUser);

router.get('/stats/overview', getUserStats);

// New upload endpoints that frontend expects
router.post('/upload-resume', upload.single('resume'), uploadUserResume);
router.post('/upload-avatar', avatarUpload.single('avatar'), uploadUserAvatar);

// Legacy upload endpoint
router.post('/legacy-upload-resume', upload.single('resume'), uploadResume);

// Admin only routes
router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUser);
router.put('/:id', authorize('admin'), updateUserValidation, updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
