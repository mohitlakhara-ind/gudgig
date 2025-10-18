import express from 'express';
import { param, query, body } from 'express-validator';
import Service from '../models/Service.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

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

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const updateData = req.body;

    console.log('📝 Updating profile for user:', userId);

    // Remove sensitive fields that shouldn't be updated through this route
    const { password, role, isActive, ...allowedUpdates } = updateData;

    // Validate required fields
    if (allowedUpdates.email) {
      const existingUser = await User.findOne({ email: allowedUpdates.email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { ...allowedUpdates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ Profile updated successfully for user:', userId);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    console.log('🔐 Changing password for user:', userId);

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    user.password = hashedPassword;
    await user.save();

    console.log('✅ Password changed successfully for user:', userId);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('❌ Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

router.put(
  '/profile',
  protect,
  body('name').optional().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location must be less than 100 characters'),
  body('website').optional().isURL().withMessage('Invalid website URL'),
  body('timezone').optional().isLength({ max: 50 }).withMessage('Timezone must be less than 50 characters'),
  updateProfile
);

router.put(
  '/change-password',
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long'),
  changePassword
);

export default router;
