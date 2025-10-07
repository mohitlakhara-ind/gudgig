import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getAdminStats } from '../controllers/gmController.js';

// Import sub-routers
import adminUsersRouter from './adminUsers.js';
import adminAnalyticsRouter from './adminAnalytics.js';

const router = express.Router();

// Apply global admin protection to all routes
router.use(protect, authorize('admin'));

// Mount sub-routes
router.use('/users', adminUsersRouter);
router.use('/analytics', adminAnalyticsRouter);

// Admin dashboard statistics
router.get('/stats', getAdminStats);

export default router;
