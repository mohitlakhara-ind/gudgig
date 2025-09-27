import express from 'express';
import { body } from 'express-validator';
import {
  getUserStats,
  getJobStats,
  getCompanyStats,
  getApplicationStats,
  getAllUsers,
  deleteUser,
  updateUserRole,
  getPendingJobs,
  approveJob,
  rejectJob,
  bulkModerateJobs
} from '../controllers/adminController.js';
import { protect, authorize } from '../middleware/auth.js';
import auditRouter from './adminAudit.js';

const router = express.Router();

// Validation rules
const updateRoleValidation = [
  body('role')
    .isIn(['jobseeker', 'employer', 'admin'])
    .withMessage('Role must be jobseeker, employer, or admin')
];

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Statistics routes
router.get('/stats/users', getUserStats);
router.get('/stats/jobs', getJobStats);
router.get('/stats/companies', getCompanyStats);
router.get('/stats/applications', getApplicationStats);

// User management routes
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateRoleValidation, updateUserRole);

// Job moderation routes
router.get('/jobs/pending', getPendingJobs);
router.put('/jobs/:id/approve', approveJob);
router.put('/jobs/:id/reject', [
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot be more than 500 characters')
], rejectJob);
router.put('/jobs/bulk-moderate', [
  body('jobIds').isArray({ min: 1 }).withMessage('jobIds array is required'),
  body('action').isIn(['approve', 'reject']).withMessage('action must be approve or reject'),
  body('reason').optional().isLength({ max: 500 })
], bulkModerateJobs);

// Audit routes
router.use('/audit', auditRouter);

export default router;
