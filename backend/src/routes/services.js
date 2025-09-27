import express from 'express';
import { body } from 'express-validator';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getServicesByUser,
  updateServiceStatus,
  getServiceStats
} from '../controllers/serviceController.js';

const router = express.Router();

const packageValidation = body('packages').isArray({ min: 1 }).withMessage('At least one package is required');

const baseValidation = [
  body('title').trim().isLength({ min: 5, max: 120 }).withMessage('Title must be 5-120 characters'),
  body('description').trim().isLength({ min: 50, max: 5000 }).withMessage('Description must be 50-5000 characters'),
  body('category').isString().withMessage('Category is required'),
  packageValidation
];

// Public
router.get('/', optionalAuth, getServices);
router.get('/:id', optionalAuth, getService);
router.get('/user/:id', getServicesByUser);

// Authenticated
router.use(protect);

router.post('/', authorize('jobseeker', 'admin'), baseValidation, createService);
router.put('/:id', authorize('jobseeker', 'admin'), baseValidation, updateService);
router.delete('/:id', authorize('jobseeker', 'admin'), deleteService);
router.put('/:id/status', authorize('jobseeker', 'admin'), updateServiceStatus);

// Stats
router.get('/stats/overview', authorize('jobseeker', 'admin'), getServiceStats);

export default router;


