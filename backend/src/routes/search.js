import express from 'express';
import {
  searchJobs,
  getSuggestions,
  saveSearch,
  getSavedSearches,
  updateSavedSearch,
  deleteSavedSearch,
  getSearchAnalytics,
  getTrendingSearches
} from '../controllers/searchController.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for search endpoints
const searchRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 search requests per windowMs
  message: {
    success: false,
    message: 'Too many search requests, please try again later'
  }
});

const suggestionRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 suggestion requests per minute
  message: {
    success: false,
    message: 'Too many suggestion requests, please try again later'
  }
});

// Validation middleware
const validateSearchParams = [
  query('q').optional().isLength({ min: 1, max: 200 }).withMessage('Query must be between 1 and 200 characters'),
  query('location').optional().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  query('category').optional().isLength({ max: 50 }).withMessage('Category must be less than 50 characters'),
  query('jobType').optional().isIn(['full-time', 'part-time', 'contract', 'freelance', 'internship']).withMessage('Invalid job type'),
  query('experienceLevel').optional().isIn(['entry', 'mid', 'senior', 'executive']).withMessage('Invalid experience level'),
  query('salaryMin').optional().isInt({ min: 0 }).withMessage('Minimum salary must be a positive number'),
  query('salaryMax').optional().isInt({ min: 0 }).withMessage('Maximum salary must be a positive number'),
  query('remote').optional().isBoolean().withMessage('Remote must be a boolean'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
];

const validateSuggestionParams = [
  query('q').isLength({ min: 2, max: 100 }).withMessage('Query must be between 2 and 100 characters'),
  query('type').optional().isIn(['all', 'jobs', 'locations', 'skills', 'companies']).withMessage('Invalid suggestion type')
];

const validateSaveSearch = [
  body('name').isLength({ min: 1, max: 100 }).withMessage('Search name must be between 1 and 100 characters'),
  body('query').isLength({ min: 1, max: 200 }).withMessage('Query must be between 1 and 200 characters'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  body('alertFrequency').optional().isIn(['daily', 'weekly', 'monthly']).withMessage('Invalid alert frequency')
];

const validateSearchId = [
  param('id').isMongoId().withMessage('Invalid search ID')
];

// @route   GET /api/search/jobs
// @desc    Search jobs with advanced filtering
// @access  Public (with optional auth for personalization)
router.get('/jobs', searchRateLimit, optionalAuth, validateSearchParams, searchJobs);

// @route   GET /api/search/suggestions
// @desc    Get search suggestions for autocomplete
// @access  Public
router.get('/suggestions', suggestionRateLimit, validateSuggestionParams, getSuggestions);

// @route   GET /api/search/trending
// @desc    Get popular searches and trending keywords
// @access  Public
router.get('/trending', getTrendingSearches);

// Protected routes (require authentication)
router.use(protect);

// @route   POST /api/search/save
// @desc    Save search criteria for alerts
// @access  Private
router.post('/save', validateSaveSearch, saveSearch);

// @route   GET /api/search/saved
// @desc    Get user's saved searches
// @access  Private
router.get('/saved', getSavedSearches);

// @route   PUT /api/search/saved/:id
// @desc    Update saved search
// @access  Private
router.put('/saved/:id', validateSearchId, validateSaveSearch, updateSavedSearch);

// @route   DELETE /api/search/saved/:id
// @desc    Delete saved search
// @access  Private
router.delete('/saved/:id', validateSearchId, deleteSavedSearch);

// @route   GET /api/search/analytics
// @desc    Get search analytics for user
// @access  Private
router.get('/analytics', getSearchAnalytics);

export default router;