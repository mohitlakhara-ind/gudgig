import express from 'express';
import { body, param, query } from 'express-validator';
import multer from 'multer';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getMyServices,
  uploadServiceGallery,
  deleteServiceGalleryImage,
  getServiceAnalytics,
  adminGetServices,
  getServiceCategories
} from '../controllers/serviceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Allow images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});

// Validation middleware
const serviceValidation = [
  body('title')
    .trim()
    .isLength({ min: 10, max: 120 })
    .withMessage('Title must be between 10 and 120 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required'),
  body('packages.basic.title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Basic package title is required'),
  body('packages.basic.description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Basic package description is required'),
  body('packages.basic.price')
    .isFloat({ min: 1 })
    .withMessage('Basic package price must be at least $1'),
  body('packages.basic.deliveryTime')
    .isInt({ min: 1, max: 365 })
    .withMessage('Delivery time must be between 1 and 365 days'),
  body('packages.basic.revisions')
    .isInt({ min: 0, max: 10 })
    .withMessage('Revisions must be between 0 and 10')
];

const serviceUpdateValidation = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 10, max: 120 })
    .withMessage('Title must be between 10 and 120 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty'),
  body('status')
    .optional()
    .isIn(['draft', 'active', 'paused'])
    .withMessage('Status must be draft, active, or paused')
];

// Public routes
router.get('/', getServices);
router.get('/categories', getServiceCategories);
router.get('/:serviceId', 
  param('serviceId').isMongoId().withMessage('Invalid service ID'),
  getServiceById
);

// Protected routes (freelancers and admin)
router.use(protect);

// Freelancer routes
router.post('/', 
  authorize('freelancer'),
  serviceValidation,
  createService
);

router.get('/my/services', 
  authorize('freelancer'),
  getMyServices
);

// Alternative route for frontend compatibility
router.get('/my', 
  authorize('freelancer'),
  getMyServices
);

router.put('/:serviceId',
  param('serviceId').isMongoId().withMessage('Invalid service ID'),
  serviceUpdateValidation,
  updateService
);

router.delete('/:serviceId',
  param('serviceId').isMongoId().withMessage('Invalid service ID'),
  deleteService
);

// File upload routes
router.post('/:serviceId/gallery',
  param('serviceId').isMongoId().withMessage('Invalid service ID'),
  upload.array('images', 5),
  uploadServiceGallery
);

router.delete('/:serviceId/gallery/:imageId',
  param('serviceId').isMongoId().withMessage('Invalid service ID'),
  param('imageId').isMongoId().withMessage('Invalid image ID'),
  deleteServiceGalleryImage
);

// Analytics route
router.get('/:serviceId/analytics',
  param('serviceId').isMongoId().withMessage('Invalid service ID'),
  getServiceAnalytics
);

// Admin routes
router.get('/admin/all',
  authorize('admin'),
  adminGetServices
);

export default router;

