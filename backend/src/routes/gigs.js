import express from 'express';
import { body } from 'express-validator';
import {
  getGigs,
  getGig,
  createGig,
  updateGig,
  deleteGig,
  getGigsBySeller,
  getGigStats
} from '../controllers/gigController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules (reuse job validation semantics)
const gigValidation = [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Gig title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 50, max: 2000 }).withMessage('Gig description must be between 50 and 2000 characters'),
  body('category').isString().withMessage('Please select a valid category'),
  body('type').isIn(['fixed-price', 'hourly', 'short-project', 'micro-task', 'freelance']).withMessage('Please select a valid gig type'),
];

// Public routes
router.get('/', getGigs);
router.get('/:id', getGig);
router.get('/seller/:sellerId', getGigsBySeller);

// Protected routes (require authentication)
router.use(protect);

// Seller and Admin routes
router.post('/', authorize('employer', 'admin'), gigValidation, createGig);
router.put('/:id', authorize('employer', 'admin'), gigValidation, updateGig);
router.delete('/:id', authorize('employer', 'admin'), deleteGig);

// Stats
router.get('/stats/overview', authorize('employer', 'admin'), getGigStats);

export default router;


