import asyncHandler from '../middleware/asyncHandler.js';
import SearchService from '../services/searchService.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

// @desc    Search jobs with advanced filtering
// @route   GET /api/search/jobs
// @access  Public (with optional auth for personalization)
const searchJobs = asyncHandler(async (req, res) => {
  const {
    q: query,
    location,
    category,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    remote,
    companySize,
    skills,
    page = 1,
    limit = 20,
    sortBy = 'relevance'
  } = req.query;

  const searchParams = {
    query,
    location,
    category,
    jobType,
    experienceLevel,
    salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
    salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
    remote: remote === 'true',
    companySize,
    skills: skills ? skills.split(',').map(s => s.trim()) : undefined,
    page: parseInt(page),
    limit: Math.min(parseInt(limit), 50), // Max 50 results per page
    sortBy,
    userId: req.user?._id // For personalization if user is authenticated
  };

  const results = await SearchService.searchJobs(searchParams);

  // Track search analytics if user is authenticated
  if (req.user) {
    await SearchService.trackSearch(req.user._id, searchParams, results.total);
  }

  res.status(200).json({
    success: true,
    data: {
      jobs: results.jobs,
      pagination: {
        page: results.page,
        limit: results.limit,
        total: results.total,
        pages: Math.ceil(results.total / results.limit)
      },
      filters: results.appliedFilters,
      suggestions: results.suggestions
    }
  });
});

// @desc    Get search suggestions for autocomplete
// @route   GET /api/search/suggestions
// @access  Public
const getSuggestions = asyncHandler(async (req, res) => {
  const { q: query, type = 'all' } = req.query;

  if (!query || query.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'Query must be at least 2 characters long'
    });
  }

  const suggestions = await SearchService.getSuggestions(query, type);

  res.status(200).json({
    success: true,
    data: suggestions
  });
});

// @desc    Save search criteria for alerts
// @route   POST /api/search/save
// @access  Private
const saveSearch = asyncHandler(async (req, res) => {
  const {
    name,
    query,
    location,
    category,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    remote,
    skills,
    alertFrequency = 'daily'
  } = req.body;

  if (!name || !query) {
    return res.status(400).json({
      success: false,
      message: 'Search name and query are required'
    });
  }

  const searchCriteria = {
    userId: req.user._id,
    name,
    query,
    location,
    category,
    jobType,
    experienceLevel,
    salaryMin,
    salaryMax,
    remote,
    skills: skills ? skills.split(',').map(s => s.trim()) : [],
    alertFrequency,
    isActive: true
  };

  const savedSearch = await SearchService.saveSearch(searchCriteria);

  res.status(201).json({
    success: true,
    data: savedSearch
  });
});

// @desc    Get user's saved searches
// @route   GET /api/search/saved
// @access  Private
const getSavedSearches = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const savedSearches = await SearchService.getSavedSearches(
    req.user._id,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: savedSearches
  });
});

// @desc    Update saved search
// @route   PUT /api/search/saved/:id
// @access  Private
const updateSavedSearch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const updatedSearch = await SearchService.updateSavedSearch(
    id,
    req.user._id,
    updateData
  );

  if (!updatedSearch) {
    return res.status(404).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  res.status(200).json({
    success: true,
    data: updatedSearch
  });
});

// @desc    Delete saved search
// @route   DELETE /api/search/saved/:id
// @access  Private
const deleteSavedSearch = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await SearchService.deleteSavedSearch(id, req.user._id);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Saved search not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Saved search deleted successfully'
  });
});

// @desc    Get search analytics for user
// @route   GET /api/search/analytics
// @access  Private
const getSearchAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = '30d' } = req.query;

  const analytics = await SearchService.getSearchAnalytics(req.user._id, timeframe);

  res.status(200).json({
    success: true,
    data: analytics
  });
});

// @desc    Get popular searches and trending keywords
// @route   GET /api/search/trending
// @access  Public
const getTrendingSearches = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const trending = await SearchService.getTrendingSearches(parseInt(limit));

  res.status(200).json({
    success: true,
    data: trending
  });
});

export {
  searchJobs,
  getSuggestions,
  saveSearch,
  getSavedSearches,
  updateSavedSearch,
  deleteSavedSearch,
  getSearchAnalytics,
  getTrendingSearches
};