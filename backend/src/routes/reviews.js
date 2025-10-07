import express from 'express';
import { body, param, query } from 'express-validator';
import {
  createReview,
  getReviews,
  getReview,
  updateReview,
  deleteReview,
  addReviewResponse,
  voteOnReview,
  flagReview,
  getUserReviews,
  moderateReview
} from '../controllers/reviewController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const reviewValidation = [
  body('targetType')
    .isIn(['service', 'freelancer', 'order'])
    .withMessage('Target type must be service, freelancer, or order'),
  body('targetId')
    .isMongoId()
    .withMessage('Valid target ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Valid order ID required'),
  body('aspectRatings.communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('aspectRatings.serviceAsDescribed')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Service as described rating must be between 1 and 5'),
  body('aspectRatings.recommendToFriend')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Recommend to friend rating must be between 1 and 5'),
  body('aspectRatings.deliveryTime')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Delivery time rating must be between 1 and 5'),
  body('aspectRatings.quality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality rating must be between 1 and 5')
];

const reviewUpdateValidation = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters')
];

const responseValidation = [
  body('comment')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Response must be between 10 and 500 characters')
];

const flagValidation = [
  body('reason')
    .isIn(['inappropriate', 'spam', 'fake', 'offensive', 'other'])
    .withMessage('Invalid flag reason'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

const moderationValidation = [
  body('status')
    .isIn(['pending', 'approved', 'rejected', 'flagged'])
    .withMessage('Invalid status'),
  body('moderationNotes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Moderation notes cannot exceed 1000 characters')
];

// Public routes
// Get reviews for a target (service, freelancer, etc.)
router.get('/:targetType/:targetId',
  param('targetType').isIn(['service', 'freelancer', 'order']).withMessage('Invalid target type'),
  param('targetId').isMongoId().withMessage('Invalid target ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['newest', 'oldest', 'rating-high', 'rating-low', 'helpful'])
    .withMessage('Invalid sort option'),
  query('minRating').optional().isInt({ min: 1, max: 5 }).withMessage('Min rating must be between 1 and 5'),
  query('maxRating').optional().isInt({ min: 1, max: 5 }).withMessage('Max rating must be between 1 and 5'),
  getReviews
);

// Get single review
router.get('/review/:reviewId',
  param('reviewId').isMongoId().withMessage('Invalid review ID'),
  getReview
);

// Protected routes
router.use(protect);

// Create review
router.post('/',
  reviewValidation,
  createReview
);

// Update review
router.put('/:reviewId',
  param('reviewId').isMongoId().withMessage('Invalid review ID'),
  reviewUpdateValidation,
  updateReview
);

// Delete review
router.delete('/:reviewId',
  param('reviewId').isMongoId().withMessage('Invalid review ID'),
  deleteReview
);

// Add response to review
router.post('/:reviewId/response',
  param('reviewId').isMongoId().withMessage('Invalid review ID'),
  responseValidation,
  addReviewResponse
);

// Alternative route for responding to reviews
router.post('/:reviewId/respond',
  param('reviewId').isMongoId().withMessage('Invalid review ID'),
  body('response').trim().isLength({ min: 10, max: 500 }).withMessage('Response must be between 10 and 500 characters'),
  addReviewResponse
);

// Vote on review helpfulness
router.post('/:reviewId/vote',
  param('reviewId').isMongoId().withMessage('Invalid review ID'),
  body('voteType').isIn(['up', 'down']).withMessage('Vote type must be up or down'),
  voteOnReview
);

// Flag review
router.post('/:reviewId/flag',
  param('reviewId').isMongoId().withMessage('Invalid review ID'),
  flagValidation,
  flagReview
);

// Get user's reviews (given or received)
router.get('/my/reviews',
  query('type').optional().isIn(['given', 'received']).withMessage('Type must be given or received'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['newest', 'oldest', 'rating-high', 'rating-low'])
    .withMessage('Invalid sort option'),
  getUserReviews
);

// Alternative route for frontend compatibility
router.get('/my',
  query('type').optional().isIn(['given', 'received']).withMessage('Type must be given or received'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('sortBy').optional().isIn(['newest', 'oldest', 'rating-high', 'rating-low'])
    .withMessage('Invalid sort option'),
  getUserReviews
);

// Admin routes
router.put('/admin/:reviewId/moderate',
  authorize('admin'),
  param('reviewId').isMongoId().withMessage('Invalid review ID'),
  moderationValidation,
  moderateReview
);

export default router;

