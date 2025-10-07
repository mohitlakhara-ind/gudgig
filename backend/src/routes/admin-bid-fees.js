import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { getBidFees, setBidFees } from '../controllers/jobController.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), getBidFees);
router.post('/', protect, authorize('admin'), [
  body('fees').isArray({ min: 1 }),
  body('active').optional().isNumeric()
], setBidFees);

export default router;


