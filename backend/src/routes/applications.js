import express from 'express';
import { param, body, query } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import {
  submitApplication,
  getUserApplications,
  getJobApplications,
  getApplication,
  updateApplicationStatus,
  addEmployerNote,
  withdrawApplication,
  getApplicationStats,
  getAllApplications
} from '../controllers/applicationController.js';

const router = express.Router();

// Validation rules
const applicationValidation = [
  body('job')
    .isMongoId()
    .withMessage('Valid job ID is required'),
  body('coverLetter')
    .optional()
    .isLength({ max: 2000 })
    .withMessage('Cover letter cannot exceed 2000 characters'),
  body('expectedSalary.min')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum salary must be a positive number'),
  body('expectedSalary.max')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum salary must be a positive number'),
  body('availability')
    .optional()
    .isIn(['immediate', '2-weeks', '1-month', '2-months', 'negotiable'])
    .withMessage('Invalid availability option'),
  body('questionnaire')
    .optional()
    .isArray()
    .withMessage('Questionnaire must be an array'),
  body('questionnaire.*.question')
    .if(body('questionnaire').exists())
    .notEmpty()
    .withMessage('Question is required'),
  body('questionnaire.*.answer')
    .if(body('questionnaire').exists())
    .isLength({ min: 1, max: 1000 })
    .withMessage('Answer must be between 1 and 1000 characters'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('experience.years')
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage('Experience years must be between 0 and 50'),
  body('experience.level')
    .optional()
    .isIn(['entry', 'junior', 'mid', 'senior', 'lead', 'architect'])
    .withMessage('Invalid experience level'),
  body('source')
    .optional()
    .isIn(['direct', 'referral', 'job-board', 'social-media', 'company-website'])
    .withMessage('Invalid application source'),
  body('referredBy')
    .optional()
    .isMongoId()
    .withMessage('Invalid referrer ID')
];

const statusUpdateValidation = [
  body('status')
    .isIn(['pending', 'reviewing', 'shortlisted', 'interviewing', 'rejected', 'accepted'])
    .withMessage('Invalid status'),
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

const noteValidation = [
  body('note')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Note must be between 1 and 1000 characters'),
  body('isPrivate')
    .optional()
    .isBoolean()
    .withMessage('isPrivate must be a boolean')
];

const withdrawValidation = [
  body('reason')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters')
];

const getApplicationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['all', 'pending', 'reviewing', 'shortlisted', 'interviewing', 'rejected', 'accepted', 'withdrawn'])
    .withMessage('Invalid status filter'),
  query('sortBy')
    .optional()
    .isIn(['newest', 'oldest', 'status', 'job-title', 'name'])
    .withMessage('Invalid sort option')
];

const applicationIdValidation = [
  param('applicationId')
    .isMongoId()
    .withMessage('Invalid application ID')
];

const jobIdValidation = [
  param('jobId')
    .isMongoId()
    .withMessage('Invalid job ID')
];

// Protected routes
router.use(protect);

// Submit new application
router.post('/',
  applicationValidation,
  submitApplication
);

// Get user's applications (for job seekers)
router.get('/my-applications',
  getApplicationsValidation,
  getUserApplications
);

// Get applications for a specific job (for employers)
router.get('/job/:jobId',
  jobIdValidation,
  getApplicationsValidation,
  getJobApplications
);

// Get application statistics
router.get('/stats',
  getApplicationStats
);

// Get single application details
router.get('/:applicationId',
  applicationIdValidation,
  getApplication
);

// Update application status (for employers)
router.put('/:applicationId/status',
  applicationIdValidation,
  statusUpdateValidation,
  updateApplicationStatus
);

// Add employer note to application
router.post('/:applicationId/notes',
  applicationIdValidation,
  noteValidation,
  addEmployerNote
);

// Withdraw application (for job seekers)
router.put('/:applicationId/withdraw',
  applicationIdValidation,
  withdrawValidation,
  withdrawApplication
);

// Admin routes
router.get('/admin/all',
  authorize('admin'),
  getApplicationsValidation,
  query('jobId').optional().isMongoId().withMessage('Invalid job ID'),
  query('applicantId').optional().isMongoId().withMessage('Invalid applicant ID'),
  getAllApplications
);

export default router;



