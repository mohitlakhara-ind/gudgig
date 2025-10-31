import express from 'express';
import jobsRoutes from './jobs.js';
import { protect } from '../middleware/auth.js';
import { getBidContacts } from '../controllers/gmController.js';

// Alias router to expose /api/gigs as the same as /api/jobs
const router = express.Router();

// Add specific route for contact details before forwarding to jobs routes
router.get('/:gigId/bids/:bidId/contacts', protect, getBidContacts);

router.use('/', jobsRoutes);

export default router;


