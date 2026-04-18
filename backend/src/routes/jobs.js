import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { adminCreateJob, listJobs, getJobById, getBidsForJob, updateJob, deleteJob, getAdminStats, getBidCountForJob, toggleJobVisibility } from '../controllers/gmController.js';

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
  body('requirements').optional().isArray(),
  body('price').optional().isFloat({ min: 0 }),
  body('contactDetails').optional().isObject(),
  body('contactDetails.email').optional().isEmail(),
  body('contactDetails.phone').optional().isString(),
  body('contactDetails.name').optional().isString(),
  body('maxBids').optional({ nullable: true }).custom((value) => {
    if (value === null) return true;
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return true;
    throw new Error('maxBids must be null (unlimited) or an integer >= 0');
  })
], adminCreateJob);

router.put('/:jobId', protect, authorize('admin'), [
  body('title').optional().isString().isLength({ min: 3, max: 120 }),
  body('category').optional().isIn(['website development','graphic design','content writing','social media management','SEO','app development','game development']),
  body('description').optional().isString().isLength({ min: 10, max: 5000 }),
  body('requirements').optional().isArray(),
  body('price').optional().isFloat({ min: 0 }),
  body('contactDetails').optional().isObject(),
  body('maxBids').optional({ nullable: true }).custom((value) => {
    if (value === null) return true;
    if (typeof value === 'number' && Number.isInteger(value) && value >= 0) return true;
    throw new Error('maxBids must be null (unlimited) or an integer >= 0');
  })
], updateJob);

router.delete('/:jobId', protect, authorize('admin'), deleteJob);
router.get('/:jobId/bids', protect, authorize('admin'), getBidsForJob);
router.patch('/:jobId/visibility', protect, authorize('admin'), [
  body('isHidden').isBoolean().withMessage('isHidden must be a boolean value')
], toggleJobVisibility);
// Note: Admin stats route moved to /api/admin/stats (see routes/admin.js)

export default router;


