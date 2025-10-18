import express from 'express';
import { protect } from '../middleware/auth.js';
import JobAlert from '../models/JobAlert.js';
import Job from '../models/Job.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Get all job alerts for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { active, limit = 50, page = 1 } = req.query;

    console.log('📋 Fetching job alerts for user:', userId);

    // Build query
    const query = { userId };
    if (active !== undefined) {
      query.isActive = active === 'true';
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Get alerts
    const alerts = await JobAlert.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count
    const totalAlerts = await JobAlert.countDocuments(query);

    console.log(`✅ Found ${alerts.length} job alerts`);

    res.status(200).json({
      success: true,
      data: { alerts },
      count: alerts.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalAlerts,
        pages: Math.ceil(totalAlerts / limitNum)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching job alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job alerts',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Create a new job alert
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, keyword, category, location, gigType, salaryMin, salaryMax, frequency, isActive } = req.body;

    console.log('💾 Creating job alert:', { userId, name, keyword, category, location });

    // Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Alert name is required'
      });
    }

    // Validate that at least one search criteria is provided
    if (!keyword && !category && !location) {
      return res.status(400).json({
        success: false,
        message: 'At least one search criteria (keyword, category, or location) is required'
      });
    }

    // Validate salary range
    if (salaryMin && salaryMax && salaryMin > salaryMax) {
      return res.status(400).json({
        success: false,
        message: 'Minimum salary cannot be greater than maximum salary'
      });
    }

    // Create new job alert
    const jobAlert = new JobAlert({
      userId,
      name: name.trim(),
      keyword: keyword?.trim(),
      category,
      location: location?.trim(),
      gigType: gigType || 'all',
      salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
      salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
      frequency: frequency || 'daily',
      isActive: isActive !== false
    });

    await jobAlert.save();

    console.log('✅ Job alert created successfully:', jobAlert._id);

    res.status(201).json({
      success: true,
      message: 'Job alert created successfully',
      data: jobAlert
    });
  } catch (error) {
    console.error('❌ Error creating job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get a specific job alert
router.get('/:alertId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { alertId } = req.params;

    if (!isValidObjectId(alertId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID format'
      });
    }

    const alert = await JobAlert.findOne({ _id: alertId, userId });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('❌ Error fetching job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update a job alert
router.put('/:alertId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { alertId } = req.params;
    const updateData = req.body;

    if (!isValidObjectId(alertId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID format'
      });
    }

    // Validate salary range if provided
    if (updateData.salaryMin && updateData.salaryMax && updateData.salaryMin > updateData.salaryMax) {
      return res.status(400).json({
        success: false,
        message: 'Minimum salary cannot be greater than maximum salary'
      });
    }

    const alert = await JobAlert.findOneAndUpdate(
      { _id: alertId, userId },
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    console.log('✅ Job alert updated successfully:', alert._id);

    res.status(200).json({
      success: true,
      message: 'Job alert updated successfully',
      data: alert
    });
  } catch (error) {
    console.error('❌ Error updating job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete a job alert
router.delete('/:alertId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { alertId } = req.params;

    if (!isValidObjectId(alertId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID format'
      });
    }

    const deletedAlert = await JobAlert.findOneAndDelete({ _id: alertId, userId });
    
    if (!deletedAlert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    console.log('✅ Job alert deleted successfully:', deletedAlert._id);

    res.status(200).json({
      success: true,
      message: 'Job alert deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Toggle alert active status
router.patch('/:alertId/toggle', async (req, res) => {
  try {
    const userId = req.user._id;
    const { alertId } = req.params;

    if (!isValidObjectId(alertId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID format'
      });
    }

    const alert = await JobAlert.findOne({ _id: alertId, userId });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    alert.isActive = !alert.isActive;
    await alert.save();

    console.log('✅ Job alert status toggled:', alert._id, 'Active:', alert.isActive);

    res.status(200).json({
      success: true,
      message: `Job alert ${alert.isActive ? 'activated' : 'deactivated'} successfully`,
      data: alert
    });
  } catch (error) {
    console.error('❌ Error toggling job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle job alert status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Test alert by finding matching jobs
router.get('/:alertId/test', async (req, res) => {
  try {
    const userId = req.user._id;
    const { alertId } = req.params;
    const { limit = 10 } = req.query;

    if (!isValidObjectId(alertId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert ID format'
      });
    }

    const alert = await JobAlert.findOne({ _id: alertId, userId });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Job alert not found'
      });
    }

    // Build job search query based on alert criteria
    const jobQuery = { status: 'active' };
    
    if (alert.keyword) {
      jobQuery.$or = [
        { title: { $regex: alert.keyword, $options: 'i' } },
        { description: { $regex: alert.keyword, $options: 'i' } },
        { skills: { $in: [new RegExp(alert.keyword, 'i')] } }
      ];
    }
    
    if (alert.category) {
      jobQuery.category = alert.category;
    }
    
    if (alert.location) {
      jobQuery.location = { $regex: alert.location, $options: 'i' };
    }
    
    if (alert.gigType && alert.gigType !== 'all') {
      jobQuery.category = alert.gigType;
    }
    
    if (alert.salaryMin || alert.salaryMax) {
      jobQuery.budget = {};
      if (alert.salaryMin) jobQuery.budget.$gte = alert.salaryMin;
      if (alert.salaryMax) jobQuery.budget.$lte = alert.salaryMax;
    }

    // Find matching jobs
    const matchingJobs = await Job.find(jobQuery)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .select('title description category location budget createdAt')
      .lean();

    console.log(`🔍 Found ${matchingJobs.length} matching jobs for alert:`, alert._id);

    res.status(200).json({
      success: true,
      data: {
        alert: alert,
        matchingJobs: matchingJobs,
        matchCount: matchingJobs.length
      }
    });
  } catch (error) {
    console.error('❌ Error testing job alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test job alert',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;




