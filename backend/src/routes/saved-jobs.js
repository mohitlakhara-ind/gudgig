import express from 'express';
import { protect } from '../middleware/auth.js';
import SavedJob from '../models/SavedJob.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Get saved jobs for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { search, type, location, urgent, remote, limit = 50, page = 1 } = req.query;

    console.log('📋 Fetching saved jobs for user:', userId);
    console.log('🔍 Query params:', { search, type, location, urgent, remote, limit, page });

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Build base query
    const baseQuery = { userId };
    
    // Get saved jobs with populated job data
    let savedJobs = await SavedJob.find(baseQuery)
      .populate({
        path: 'jobId',
        select: 'title description category location budget requirements skills createdBy createdAt status tags applicationsCount views',
        model: 'Job'
      })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(); // Use lean() for better performance

    console.log(`📊 Found ${savedJobs.length} saved jobs`);

    // Filter out saved jobs where the referenced job no longer exists
    savedJobs = savedJobs.filter(savedJob => {
      if (!savedJob.jobId) {
        console.log('⚠️ Found saved job with null jobId:', savedJob._id);
        return false;
      }
      return true;
    });

    // Apply search and filters
    if (search) {
      const searchLower = search.toLowerCase();
      savedJobs = savedJobs.filter(savedJob => {
        const job = savedJob.jobId;
        if (!job) return false;
        return (
          job.title?.toLowerCase().includes(searchLower) ||
          job.description?.toLowerCase().includes(searchLower) ||
          job.category?.toLowerCase().includes(searchLower) ||
          job.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });
    }

    if (type && type !== 'all') {
      savedJobs = savedJobs.filter(savedJob => {
        const job = savedJob.jobId;
        return job && job.category === type;
      });
    }

    if (location && location !== 'all') {
      savedJobs = savedJobs.filter(savedJob => {
        const job = savedJob.jobId;
        return job && job.location?.toLowerCase().includes(location.toLowerCase());
      });
    }

    // Get total count for pagination
    const totalSavedJobs = await SavedJob.countDocuments(baseQuery);
    
    console.log(`✅ Returning ${savedJobs.length} filtered saved jobs`);

    res.status(200).json({
      success: true,
      data: savedJobs,
      count: savedJobs.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalSavedJobs,
        pages: Math.ceil(totalSavedJobs / limitNum)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved jobs',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Save a job
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.body;

    console.log('💾 Saving job request:', { userId, jobId });

    // Validate input
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format'
      });
    }

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if job is already saved
    const existingSavedJob = await SavedJob.findOne({ userId, jobId });
    if (existingSavedJob) {
      return res.status(400).json({
        success: false,
        message: 'Job is already saved'
      });
    }

    // Create new saved job with metadata
    const savedJob = new SavedJob({
      userId,
      jobId,
      savedAt: new Date(),
      metadata: {
        source: 'gigs_listing',
        category: job.category,
        budget: job.budget
      }
    });

    await savedJob.save();

    // Populate job data for response
    await savedJob.populate({
      path: 'jobId',
      select: 'title description category location budget requirements skills createdBy createdAt status tags',
      model: 'Job'
    });

    console.log('✅ Job saved successfully:', savedJob._id);

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob
    });
  } catch (error) {
    console.error('❌ Error saving job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Remove a saved job
router.delete('/:jobId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    console.log('🗑️ Removing saved job:', { userId, jobId });

    // Validate jobId format
    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format'
      });
    }

    const deletedJob = await SavedJob.findOneAndDelete({ userId, jobId });
    
    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }

    console.log('✅ Saved job removed successfully:', deletedJob._id);

    res.status(200).json({
      success: true,
      message: 'Job removed from saved jobs'
    });
  } catch (error) {
    console.error('❌ Error removing saved job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved job',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Check if a job is saved
router.get('/check/:jobId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    if (!isValidObjectId(jobId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Job ID format'
      });
    }

    const savedJob = await SavedJob.findOne({ userId, jobId });
    
    res.status(200).json({
      success: true,
      isSaved: !!savedJob,
      savedAt: savedJob?.savedAt || null
    });
  } catch (error) {
    console.error('❌ Error checking saved job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check saved job status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get saved jobs count
router.get('/count', async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await SavedJob.countDocuments({ userId });
    
    res.status(200).json({
      success: true,
      count
    });
  } catch (error) {
    console.error('❌ Error getting saved jobs count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get saved jobs count',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
