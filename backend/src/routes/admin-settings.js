import express from 'express';
import { body } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import { getSettings, updateSettings } from '../controllers/adminSettingsController.js';

const router = express.Router();

// All routes require admin auth
router.use(protect, authorize('admin'));

router.get('/', getSettings);

router.put('/',
  [
    body('bidFeesEnabled').optional().isBoolean(),
    body('bidFeeOptions').optional().isArray({ min: 1 }),
    body('bidFeeOptions.*').optional().isNumeric().custom(v => v > 0),
    body('currentBidFee').optional().isNumeric().custom(v => v > 0),
    body('minimumBidFeePaise').optional().isInt({ min: 1 }),
    body('maximumBidFeePaise').optional().isInt({ min: 1 }),
    body('paymentProvider').optional().isString(),
    body('razorpayKeyId').optional().isString(),
    body('razorpayKeySecret').optional().isString(),
    body('currency').optional().isString(),
    body('refundPolicy').optional().isString()
  ],
  updateSettings
);

export default router;


