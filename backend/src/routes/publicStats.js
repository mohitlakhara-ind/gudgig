import express from 'express';
import { getPublicStats } from '../controllers/publicStatsController.js';

const router = express.Router();

// Public, read-only stats for marketing/landing pages
router.get('/', getPublicStats);

export default router;





