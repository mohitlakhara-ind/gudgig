import express from 'express';
import { protect } from '../middleware/auth.js';
import SavedGig from '../models/SavedGig.js';
import Gig from '../models/Gig.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Get saved gigs for the authenticated user
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { search, type, location, limit = 50, page = 1 } = req.query;

    // Validate pagination parameters
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Build base query
    const baseQuery = { userId };
    
    // Get saved gigs with populated gig data
    let savedGigs = await SavedGig.find(baseQuery)
      .populate({
        path: 'gigId',
        select: 'title description category location budget requirements skills createdBy createdAt status tags applicationsCount views',
        model: 'Gig'
      })
      .sort({ savedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Filter out saved gigs where the referenced gig no longer exists
    savedGigs = savedGigs.filter(savedGig => !!savedGig.gigId);

    // Apply search and filters
    if (search) {
      const searchLower = String(search).toLowerCase();
      savedGigs = savedGigs.filter(savedGig => {
        const gig = savedGig.gigId;
        if (!gig) return false;
        return (
          gig.title?.toLowerCase().includes(searchLower) ||
          gig.description?.toLowerCase().includes(searchLower) ||
          gig.category?.toLowerCase().includes(searchLower) ||
          gig.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        );
      });
    }

    if (type && type !== 'all') {
      savedGigs = savedGigs.filter(savedGig => {
        const gig = savedGig.gigId;
        return gig && gig.category === type;
      });
    }

    if (location && location !== 'all') {
      savedGigs = savedGigs.filter(savedGig => {
        const gig = savedGig.gigId;
        return gig && gig.location?.toLowerCase().includes(String(location).toLowerCase());
      });
    }

    // Get total count for pagination
    const totalSavedGigs = await SavedGig.countDocuments(baseQuery);
    
    res.status(200).json({
      success: true,
      data: savedGigs,
      count: savedGigs.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalSavedGigs,
        pages: Math.ceil(totalSavedGigs / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching saved gigs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch saved gigs' });
  }
});

// Save a gig
router.post('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { gigId } = req.body;

    if (!gigId) {
      return res.status(400).json({ success: false, message: 'Gig ID is required' });
    }

    if (!isValidObjectId(gigId)) {
      return res.status(400).json({ success: false, message: 'Invalid Gig ID format' });
    }

    // Check if the gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Check if gig is already saved
    const existing = await SavedGig.findOne({ userId, gigId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Gig is already saved' });
    }

    const savedGig = new SavedGig({
      userId,
      gigId,
      savedAt: new Date(),
      metadata: {
        source: 'gigs_listing',
        category: gig.category,
        budget: gig.budget
      }
    });

    await savedGig.save();

    await savedGig.populate({
      path: 'gigId',
      select: 'title description category location budget requirements skills createdBy createdAt status tags',
      model: 'Gig'
    });

    res.status(201).json({ success: true, message: 'Gig saved successfully', data: savedGig });
  } catch (error) {
    console.error('Error saving gig:', error);
    res.status(500).json({ success: false, message: 'Failed to save gig' });
  }
});

// Remove a saved gig
router.delete('/:gigId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { gigId } = req.params;

    if (!isValidObjectId(gigId)) {
      return res.status(400).json({ success: false, message: 'Invalid Gig ID format' });
    }

    const deleted = await SavedGig.findOneAndDelete({ userId, gigId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Saved gig not found' });
    }

    res.status(200).json({ success: true, message: 'Gig removed from saved gigs' });
  } catch (error) {
    console.error('Error removing saved gig:', error);
    res.status(500).json({ success: false, message: 'Failed to remove saved gig' });
  }
});

// Check if a gig is saved
router.get('/check/:gigId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { gigId } = req.params;

    if (!isValidObjectId(gigId)) {
      return res.status(400).json({ success: false, message: 'Invalid Gig ID format' });
    }

    const savedGig = await SavedGig.findOne({ userId, gigId });
    
    res.status(200).json({
      success: true,
      isSaved: !!savedGig,
      savedAt: savedGig?.savedAt || null
    });
  } catch (error) {
    console.error('Error checking saved gig:', error);
    res.status(500).json({ success: false, message: 'Failed to check saved gig status' });
  }
});

// Get saved gigs count
router.get('/count', async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await SavedGig.countDocuments({ userId });
    
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error getting saved gigs count:', error);
    res.status(500).json({ success: false, message: 'Failed to get saved gigs count' });
  }
});

export default router;





