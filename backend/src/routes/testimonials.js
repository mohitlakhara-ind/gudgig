import express from 'express';
import { getPublicTestimonials, submitTestimonial } from '../controllers/testimonialsController.js';
const router = express.Router();

// Public read-only endpoints for approved testimonials
router.get('/', getPublicTestimonials);
router.get('/public', getPublicTestimonials);

// Public submission endpoint — testimonials are created unapproved
router.post('/', submitTestimonial);

export default router;
