import express from 'express';
import { body, param } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import {
  listUsers,
  getUser,
  updateUser,
  toggleStatus,
  deleteUser
} from '../controllers/adminUserController.js';

const router = express.Router();

// Apply authentication and authorization middleware to all routes
router.use(protect, authorize('admin'));

// Validation rules
const validateUserId = [
  param('userId')
    .isMongoId()
    .withMessage('Invalid user ID format')
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['freelancer', 'employer', 'admin'])
    .withMessage('Role must be freelancer, employer, or admin'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value')
];

const validateStatusToggle = [
  body('isActive')
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  body('durationMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('durationMinutes must be a non-negative integer'),
  body('until')
    .optional()
    .isISO8601()
    .withMessage('until must be a valid ISO8601 date')
];

// Routes
/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Private/Admin
 * @query   page, limit, role, isActive, search, sort
 */
router.get('/', listUsers);

/**
 * @route   GET /api/admin/users/:userId
 * @desc    Get single user by ID
 * @access  Private/Admin
 */
router.get('/:userId', validateUserId, getUser);

/**
 * @route   PUT /api/admin/users/:userId
 * @desc    Update user information
 * @access  Private/Admin
 */
router.put('/:userId', [...validateUserId, ...validateUserUpdate], updateUser);

/**
 * @route   PUT /api/admin/users/:userId/status
 * @desc    Toggle user active/inactive status
 * @access  Private/Admin
 */
router.put('/:userId/status', [...validateUserId, ...validateStatusToggle], toggleStatus);

/**
 * @route   DELETE /api/admin/users/:userId
 * @desc    Delete user (soft delete)
 * @access  Private/Admin
 */
router.delete('/:userId', validateUserId, deleteUser);

export default router;
