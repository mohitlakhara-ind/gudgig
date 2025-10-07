import express from 'express';
import { protect } from '../middleware/auth.js';
import SavedJob from '../models/SavedJob.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Get saved jobs for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { search, type, location, urgent, remote, limit = 50, page = 1 } = req.query;

    // Build query
    const query = { userId };
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { 'job.title': { $regex: search, $options: 'i' } },
        { 'job.description': { $regex: search, $options: 'i' } },
        { 'job.company': { $regex: search, $options: 'i' } }
      ];
    }

    // Add filters
    if (type) query['job.type'] = type;
    if (location) query['job.location'] = { $regex: location, $options: 'i' };
    if (urgent === 'true') query['job.urgent'] = true;
    if (remote === 'true') query['job.remote'] = true;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get saved jobs with populated job data
    const savedJobs = await SavedJob.find(query)
      .populate('jobId', 'title description company location type salary urgent remote createdAt budget skills tags employer')
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await SavedJob.countDocuments(query);

    res.status(200).json({
      success: true,
      data: savedJobs,
      count: savedJobs.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved jobs'
    });
  }
});

// Save a job
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.body;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
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

    // Create new saved job
    const savedJob = new SavedJob({
      userId,
      jobId,
      savedAt: new Date()
    });

    await savedJob.save();

    // Populate job data
    await savedJob.populate('jobId', 'title description company location type salary urgent remote createdAt budget skills tags employer');

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob
    });
  } catch (error) {
    console.error('Error saving job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save job'
    });
  }
});

// Remove a saved job
router.delete('/:jobId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    const deletedJob = await SavedJob.findOneAndDelete({ userId, jobId });
    
    if (!deletedJob) {
      return res.status(404).json({
        success: false,
        message: 'Saved job not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Job removed from saved jobs'
    });
  } catch (error) {
    console.error('Error removing saved job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove saved job'
    });
  }
});

// Check if a job is saved
router.get('/check/:jobId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOne({ userId, jobId });
    
    res.status(200).json({
      success: true,
      data: { saved: !!savedJob }
    });
  } catch (error) {
    console.error('Error checking saved job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check saved job status'
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
      data: { count }
    });
  } catch (error) {
    console.error('Error fetching saved jobs count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch saved jobs count'
    });
  }
});

export default router;
