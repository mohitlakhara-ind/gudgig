import express from 'express';
import { param, query } from 'express-validator';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's public services
// @route   GET /api/users/:userId/services
// @access  Public
export const getUserServices = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12, status = 'active' } = req.query;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const query = { 
      createdBy: userId,
      isActive: status === 'active' ? true : undefined 
    };

    const services = await Service.find(query)
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .exec();

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      data: services,
      count: services.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching user services:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user services'
    });
  }
};

// Get user's public services
router.get('/:userId/services',
  param('userId').isMongoId().withMessage('Invalid user ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['active', 'all']).withMessage('Status must be active or all'),
  getUserServices
);

export default router;
