import express from 'express';
import jobsRoutes from './jobs.js';

// Alias router to expose /api/gigs as the same as /api/jobs
const router = express.Router();

router.use('/', jobsRoutes);

export default router;


