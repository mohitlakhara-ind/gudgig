import express from 'express';
import { body } from 'express-validator';
import {
  getCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyBySlug,
  toggleFollow,
  getCompanyStats,
  verifyCompany
} from '../controllers/companyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Validation rules for company creation/update
const companyValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Company description must be between 50 and 1000 characters'),
  body('website')
    .optional()
    .isURL()
    .withMessage('Please provide a valid website URL'),
  body('industry')
    .isIn(['Technology', 'Healthcare', 'Finance', 'Education', 'Marketing', 'Sales', 'Human Resources', 'Operations', 'Design', 'Engineering', 'Other'])
    .withMessage('Please select a valid industry'),
  body('size')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .withMessage('Please select a valid company size'),
  body('founded')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Founded year must be between 1800 and current year'),
  body('headquarters')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Headquarters must be between 2 and 100 characters'),
  body('locations')
    .optional()
    .isArray()
    .withMessage('Locations must be an array'),
  body('socialLinks.linkedin')
    .optional()
    .isURL()
    .withMessage('LinkedIn URL must be valid'),
  body('socialLinks.twitter')
    .optional()
    .isURL()
    .withMessage('Twitter URL must be valid'),
  body('socialLinks.facebook')
    .optional()
    .isURL()
    .withMessage('Facebook URL must be valid'),
  body('socialLinks.instagram')
    .optional()
    .isURL()
    .withMessage('Instagram URL must be valid')
];

// Public routes
router.get('/', getCompanies);
router.get('/:id', getCompany);
router.get('/slug/:slug', getCompanyBySlug);

// Protected routes
router.use(protect);

// User routes
router.post('/:id/follow', toggleFollow);

// Employer and Admin routes
router.post('/', authorize('employer', 'admin'), companyValidation, createCompany);
router.put('/:id', authorize('employer', 'admin'), companyValidation, updateCompany);
router.delete('/:id', authorize('admin'), deleteCompany);

// Stats route (Company owner or Admin only)
router.get('/stats/overview', getCompanyStats);

// Admin only route - Company verification
router.put('/:id/verify', authorize('admin'), verifyCompany);

export default router;
