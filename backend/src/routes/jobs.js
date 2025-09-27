import express from 'express';
import { body } from 'express-validator';
import {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  getJobsByEmployer,
  getJobStats
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/auth.js';
import { attachSubscription, checkJobViewAccess, trackJobViewUsage } from '../middleware/subscription.js';
import { createPromotionCheckout, applyPromotion } from '../controllers/promotionController.js';

const router = express.Router();

// Validation rules for job creation/update
const jobValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Job title must be between 5 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Job description must be between 50 and 2000 characters'),
  body('category')
    .isIn(['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales', 'Human Resources', 'Operations', 'Design', 'Engineering', 'Writing', 'Data Entry', 'Research', 'Customer Service', 'Translation', 'Virtual Assistance', 'Social Media', 'Other'])
    .withMessage('Please select a valid category'),
  body('type')
    .isIn(['full-time', 'part-time', 'contract', 'internship', 'freelance', 'micro-task', 'short-project', 'hourly', 'fixed-price'])
    .withMessage('Please select a valid job type'),
  body('location')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Location must be between 2 and 100 characters'),
  body('experience')
    .isIn(['fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years'])
    .withMessage('Please select a valid experience level'),
  body('salary.min')
    .optional()
    .isNumeric()
    .withMessage('Minimum salary must be a number'),
  body('salary.max')
    .optional()
    .isNumeric()
    .withMessage('Maximum salary must be a number'),
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('benefits')
    .optional()
    .isArray()
    .withMessage('Benefits must be an array'),
  body('salary.period')
    .optional()
    .isIn(['hourly', 'daily', 'weekly', 'monthly', 'yearly', 'project'])
    .withMessage('Please select a valid salary period')
];

// Public routes
router.get('/', attachSubscription, getJobs);
router.get('/:id', attachSubscription, checkJobViewAccess(), trackJobViewUsage, getJob);
router.get('/employer/:employerId', getJobsByEmployer);

// Protected routes (require authentication)
router.use(protect);

// Employer and Admin only routes
router.post('/', authorize('employer', 'admin'), jobValidation, createJob);
// Promotion-related routes
router.post('/:id/promotions/checkout', authorize('employer', 'admin'), (req, res, next) => {
  req.body.jobId = req.params.id;
  return createPromotionCheckout(req, res, next);
});
router.post('/:id/promotions/apply', authorize('employer', 'admin'), (req, res, next) => {
  req.body.jobId = req.params.id;
  return applyPromotion(req, res, next);
});
router.put('/:id', authorize('employer', 'admin'), jobValidation, updateJob);
router.delete('/:id', authorize('employer', 'admin'), deleteJob);

// Stats route (Employer and Admin only)
router.get('/stats/overview', authorize('employer', 'admin'), getJobStats);

export default router;
