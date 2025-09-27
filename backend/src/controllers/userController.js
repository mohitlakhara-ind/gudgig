import User from '../models/User.js';
import { validationResult } from 'express-validator';

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      search,
      isActive
    } = req.query;

    // Build query
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password')
      .populate('company', 'name logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('company', 'name logo description')
      .populate('applicationsCount')
      .populate('jobsPostedCount');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user can view this profile
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this profile'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this user'
      });
    }

    // Don't allow role change unless admin
    if (req.body.role && req.user.role !== 'admin') {
      delete req.body.role;
    }

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    if (req.user.id !== req.params.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this user'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile (public)
// @route   GET /api/users/profile/:id
// @access  Public
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('name avatar bio skills experience location company')
      .populate('company', 'name logo description')
      .populate('jobsPostedCount');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload resume
// @route   PUT /api/users/upload-resume
// @access  Private
export const uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { resume: req.file.path },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats/overview
// @access  Private
export const getUserStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('applicationsCount')
      .populate('jobsPostedCount');

    const stats = {
      profileCompleteness: calculateProfileCompleteness(user),
      applicationsCount: user.applicationsCount || 0,
      jobsPostedCount: user.jobsPostedCount || 0,
      accountAge: Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)), // days
      lastLogin: user.lastLogin
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate profile completeness
const calculateProfileCompleteness = (user) => {
  let score = 0;
  let total = 6; // Total fields to check

  if (user.name) score++;
  if (user.email) score++;
  if (user.phone) score++;
  if (user.location) score++;
  if (user.bio) score++;
  if (user.skills && user.skills.length > 0) score++;

  return Math.round((score / total) * 100);
};
