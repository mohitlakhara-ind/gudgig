import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  updatePreferences,
  getPreferences
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { body, param, query } from 'express-validator';
import { validate } from '../middleware/validation.js';

const router = express.Router();

// Validation middleware
const validateNotificationId = [
  param('id').isMongoId().withMessage('Invalid notification ID')
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('read').optional().isBoolean().withMessage('Read must be a boolean'),
  query('type').optional().isIn(['application_status', 'job_match', 'interview', 'offer', 'message', 'job_new_application']).withMessage('Invalid notification type')
];

const validatePreferences = [
  body('email').optional().isBoolean().withMessage('Email preference must be a boolean'),
  body('push').optional().isBoolean().withMessage('Push preference must be a boolean'),
  body('sms').optional().isBoolean().withMessage('SMS preference must be a boolean'),
  body('inApp').optional().isBoolean().withMessage('In-app preference must be a boolean')
];

// All routes require authentication
router.use(protect);

// @route   GET /api/notifications
// @desc    Get notifications for authenticated user
// @access  Private
router.get('/', validate(validatePagination), getNotifications);

// @route   GET /api/notifications/unread-count
// @desc    Get unread notifications count
// @access  Private
router.get('/unread-count', getUnreadCount);

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', markAllAsRead);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', validate(validateNotificationId), markAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private
router.delete('/:id', validate(validateNotificationId), deleteNotification);

// @route   GET /api/notifications/preferences
// @desc    Get notification preferences
// @access  Private
router.get('/preferences', getPreferences);

// @route   PUT /api/notifications/preferences
// @desc    Update notification preferences
// @access  Private
router.put('/preferences', validate(validatePreferences), updatePreferences);

export default router;