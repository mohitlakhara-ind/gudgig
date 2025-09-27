import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createPromotionCheckout, applyPromotion, getPromotionAnalytics } from '../controllers/promotionController.js';

const router = express.Router();

router.use(protect);
router.post('/checkout', authorize('employer', 'admin'), createPromotionCheckout);
router.post('/apply', authorize('employer', 'admin'), applyPromotion);
router.get('/analytics', authorize('employer', 'admin'), getPromotionAnalytics);

export default router;


