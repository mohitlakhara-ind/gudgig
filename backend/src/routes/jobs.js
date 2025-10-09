import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { adminCreateJob, listJobs, getJobById, getBidsForJob, updateJob, deleteJob, getAdminStats, getBidCountForJob } from '../controllers/gmController.js';

const router = express.Router();

// Public
router.get('/', listJobs);
router.get('/:jobId', getJobById);
router.get('/:jobId/bids/count', getBidCountForJob);

// Admin only
router.post('/', protect, authorize('admin'), [
  body('title').isString().isLength({ min: 3, max: 120 }),
  body('category').isIn(['website development','graphic design','content writing','social media management','SEO','app development','game development']),
  body('description').isString().isLength({ min: 10, max: 5000 }),
  body('requirements').optional().isArray()
], adminCreateJob);

router.put('/:jobId', protect, authorize('admin'), [
  body('title').optional().isString().isLength({ min: 3, max: 120 }),
  body('category').optional().isIn(['website development','graphic design','content writing','social media management','SEO','app development','game development']),
  body('description').optional().isString().isLength({ min: 10, max: 5000 }),
  body('requirements').optional().isArray()
], updateJob);

router.delete('/:jobId', protect, authorize('admin'), deleteJob);
router.get('/:jobId/bids', protect, authorize('admin'), getBidsForJob);
// Note: Admin stats route moved to /api/admin/stats (see routes/admin.js)

export default router;


