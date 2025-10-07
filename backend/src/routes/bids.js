import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { submitBid, getMyBids } from '../controllers/gmController.js';

const router = express.Router();

router.post('/', protect, authorize('freelancer'), [
  body('jobId').isMongoId(),
  body('quotation').optional().isString().isLength({ max: 2000 }),
  body('proposal').optional().isString().isLength({ max: 5000 }),
  body('bidFeePaid').isFloat({ gt: 0 })
], submitBid);

router.get('/my', protect, authorize('freelancer'), getMyBids);

export default router;


