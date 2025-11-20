import express from 'express';
import { getPublicTestimonials, submitTestimonial } from '../controllers/testimonialsController.js';
const router = express.Router();

// Public read-only endpoint for approved testimonials
router.get('/public', getPublicTestimonials);

// Public submission endpoint — testimonials are created unapproved
router.post('/', submitTestimonial);

export default router;
