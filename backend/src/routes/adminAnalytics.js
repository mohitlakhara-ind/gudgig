import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import metricsService from '../services/metricsService.js';

const router = express.Router();

// Protect all routes, admin only
router.use(protect, authorize('admin'));

router.get('/metrics/today', (req, res) => {
  const data = metricsService.getTodayMetrics();
  res.status(200).json({ success: true, data });
});

router.get('/metrics/recent', (req, res) => {
  const days = Math.min(parseInt(req.query.days || '7', 10), 30);
  const data = metricsService.getRecentMetrics(days);
  res.status(200).json({ success: true, data });
});

export default router;


