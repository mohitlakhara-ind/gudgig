import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import metricsService from '../services/metricsService.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Protect all routes, admin only
router.use(protect, authorize('admin'));

router.get('/metrics/today', async (_req, res) => {
  try {
    const data = await metricsService.getTodayMetrics();
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error('admin_metrics_today_failed', { error: error?.message });
    res.status(500).json({ success: false, message: 'Failed to load analytics' });
  }
});

router.get('/metrics/recent', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days || '7', 10), 30);
    const data = await metricsService.getRecentMetrics(days);
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error('admin_metrics_recent_failed', { error: error?.message });
    res.status(500).json({ success: false, message: 'Failed to load analytics' });
  }
});

router.get('/metrics/ga/insights', async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days || '14', 10), 60);
    const data = await metricsService.getGaInsights(days);
    res.status(200).json({ success: true, data });
  } catch (error) {
    logger.error('admin_metrics_ga_insights_failed', { error: error?.message });
    res.status(500).json({ success: false, message: 'Failed to load GA insights' });
  }
});

export default router;


