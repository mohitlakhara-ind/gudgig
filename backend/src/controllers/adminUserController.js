import User from '../models/User.js';
import Job from '../models/Job.js';
import Bid from '../models/Bid.js';
import { validationResult } from 'express-validator';

/**
 * @desc    Get all users with pagination and filtering
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const listUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sort = '-createdAt'
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const total = await User.countDocuments(filter);
    const pages = Math.ceil(total / limitNum);

    // Fetch users with pagination
    const users = await User.find(filter)
      .select('-password -otp -refreshToken -resetPasswordToken -resetPasswordExpire')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      users,
      total,
      page: pageNum,
      pages,
      limit: limitNum
    });
  } catch (error) {
    console.error('Error in listUsers:', error);
    next(error);
  }
};

/**
 * @desc    Get single user by ID
 * @route   GET /api/admin/users/:userId
 * @access  Private/Admin
 */
const getUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-password -otp -refreshToken -resetPasswordToken -resetPasswordExpire')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error in getUser:', error);
    next(error);
  }
};

/**
 * @desc    Update user information
 * @route   PUT /api/admin/users/:userId
 * @access  Private/Admin
 */
const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { name, email, role, isActive } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check email uniqueness if email is being updated
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Validate role if provided
    if (role && !['freelancer', 'employer', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be freelancer, employer, or admin'
      });
    }

    // Update user fields
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (role !== undefined) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true, runValidators: true }
    ).select('-password -otp -refreshToken -resetPasswordToken -resetPasswordExpire');

    // Log admin action for audit trail
    console.log(`Admin ${req.user._id} updated user ${userId}:`, updateFields);

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    next(error);
  }
};

/**
 * @desc    Toggle user active/inactive status
 * @route   PUT /api/admin/users/:userId/status
 * @access  Private/Admin
 */
const toggleStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { userId } = req.params;
    const { isActive, durationMinutes, until } = req.body;

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === userId && !isActive) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Compute deactivation window if requested
    if (isActive === false) {
      let deactivatedUntil = null;
      if (typeof durationMinutes === 'number' && durationMinutes > 0) {
        deactivatedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
      } else if (until) {
        const dt = new Date(until);
        if (!isNaN(dt.getTime())) {
          deactivatedUntil = dt;
        }
      }
      user.isActive = false;
      user.deactivatedUntil = deactivatedUntil;
    } else {
      user.isActive = true;
      user.deactivatedUntil = null;
    }
    await user.save();

    // Log admin action for audit trail
    console.log(`Admin ${req.user._id} ${isActive ? 'activated' : 'deactivated'} user ${userId}`);

    res.status(200).json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        deactivatedUntil: user.deactivatedUntil
      }
    });
  } catch (error) {
    console.error('Error in toggleStatus:', error);
    next(error);
  }
};

/**
 * @desc    Delete user (soft delete)
 * @route   DELETE /api/admin/users/:userId
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Implement soft delete by setting isActive to false and adding deletedAt timestamp
    user.isActive = false;
    user.deletedAt = new Date();
    await user.save();

    // Handle cascading operations - deactivate user's jobs and bids
    await Job.updateMany(
      { userId: userId },
      { isActive: false }
    );

    await Bid.updateMany(
      { userId: userId },
      { isActive: false }
    );

    // Log admin action for audit trail
    console.log(`Admin ${req.user._id} deleted user ${userId}`);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    next(error);
  }
};

export {
  listUsers,
  getUser,
  updateUser,
  toggleStatus,
  deleteUser
};
