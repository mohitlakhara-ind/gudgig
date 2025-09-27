import express from 'express';
import {
  getEmployerStats,
  getJobSeekerStats,
  getAdminStats
} from '../controllers/statsController.js';
import { protect, authorize } from '../middleware/auth.js';
import { query } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateTimeframe = [
  query('timeframe').optional().isIn(['7d', '30d', '90d']).withMessage('Timeframe must be 7d, 30d, or 90d')
];

// All routes require authentication
router.use(protect);

// @route   GET /api/stats/employer
// @desc    Get employer statistics
// @access  Private (Employer only)
router.get('/employer', authorize('employer'), validateTimeframe, getEmployerStats);

// @route   GET /api/stats/jobseeker
// @desc    Get job seeker statistics
// @access  Private (Job Seeker only)
router.get('/jobseeker', authorize('jobseeker'), validateTimeframe, getJobSeekerStats);

// @route   GET /api/stats/admin
// @desc    Get admin statistics
// @access  Private (Admin only)
router.get('/admin', authorize('admin'), validateTimeframe, getAdminStats);

export default router;