import express from 'express';
import { body } from 'express-validator';
import {
  applyForJob,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  withdrawApplication,
  getApplicationStats,
  getEmployerApplications,
  getEmployerApplicationStats
} from '../controllers/applicationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { attachSubscription, requireActiveSubscription, checkApplicationAccess, trackApplicationUsageSuccess } from '../middleware/subscription.js';
import Application from '../models/Application.js';

const router = express.Router();

// Validation rules
const applyValidation = [
  body('job')
    .isMongoId()
    .withMessage('Valid job ID is required'),
  body('coverLetter')
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Cover letter must be between 50 and 1000 characters'),
  body('additionalInfo')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Additional info cannot be more than 500 characters')
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'reviewing', 'shortlisted', 'interviewed', 'rejected', 'accepted', 'withdrawn'])
    .withMessage('Invalid application status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Notes must be between 10 and 500 characters'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('interviewDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid interview date format'),
  body('interviewFeedback')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Interview feedback cannot be more than 1000 characters')
];

// All routes require authentication
router.use(protect);
router.use(attachSubscription);

// Jobseeker routes
router.post('/', authorize('jobseeker'), requireActiveSubscription, checkApplicationAccess(), applyValidation, trackApplicationUsageSuccess, applyForJob);
router.get('/', getMyApplications);
router.put('/:id/withdraw', withdrawApplication);

// Employer and Admin routes
router.get('/employer', authorize('employer', 'admin'), getEmployerApplications);
router.get('/stats/employer', authorize('employer', 'admin'), getEmployerApplicationStats);
router.get('/:jobId', authorize('employer', 'admin'), getJobApplications);
router.put('/:id/status', authorize('employer', 'admin'), updateStatusValidation, updateApplicationStatus);

// Bulk actions
router.post('/bulk', authorize('employer', 'admin'), async (req, res, next) => {
  try {
    const { applicationIds, action } = req.body;
    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({ success: false, message: 'applicationIds array is required' });
    }

    // Ensure employer owns the applications unless admin
    const match = {
      _id: { $in: applicationIds },
      ...(req.user.role === 'admin' ? {} : { employer: req.user._id })
    };

    const applications = await Application.find(match);
    if (applications.length !== applicationIds.length) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify all specified applications' });
    }

    let updatedCount = 0;
    if (action === 'accept' || action === 'reject' || action === 'reviewing' || action === 'shortlist') {
      const statusMap = {
        accept: 'accepted',
        reject: 'rejected',
        reviewing: 'reviewing',
        shortlist: 'shortlisted'
      };
      const newStatus = statusMap[action];
      const result = await Application.updateMany(match, { status: newStatus, reviewedAt: new Date(), reviewedBy: req.user._id });
      updatedCount = result.modifiedCount || result.nModified || 0;
    } else if (action === 'delete') {
      const result = await Application.deleteMany(match);
      updatedCount = result.deletedCount || 0;
    } else {
      return res.status(400).json({ success: false, message: 'Unsupported action' });
    }

    res.json({ success: true, message: `Bulk ${action} completed`, data: { affected: updatedCount } });
  } catch (err) {
    next(err);
  }
});

// Admin only routes
router.get('/stats/overview', authorize('admin'), getApplicationStats);

export default router;
