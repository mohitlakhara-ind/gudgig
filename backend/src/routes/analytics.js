import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  getDashboardAnalytics, 
  getEarningsAnalytics, 
  getPerformanceAnalytics 
} from '../controllers/analyticsController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Analytics endpoints
router.get('/dashboard', getDashboardAnalytics);
router.get('/earnings', getEarningsAnalytics);
router.get('/performance', getPerformanceAnalytics);

export default router;
