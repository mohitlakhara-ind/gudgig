import express from 'express';
import { param, body, query } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification
} from '../controllers/notificationController.js';

const router = express.Router();

// Validation rules
const notificationValidation = [
  body('user')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Notification type is required'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object')
];

const getNotificationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('read')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Read must be true or false')
];

const notificationIdValidation = [
  param('notificationId')
    .isMongoId()
    .withMessage('Invalid notification ID')
];

// Protected routes
router.use(protect);

// Get user's notifications
router.get('/',
  getNotificationsValidation,
  getNotifications
);

// Get unread notifications count
router.get('/unread-count',
  getUnreadCount
);

// Mark notification as read
router.put('/:notificationId/read',
  notificationIdValidation,
  markAsRead
);

// Mark all notifications as read
router.put('/read-all',
  markAllAsRead
);

// Delete notification
router.delete('/:notificationId',
  notificationIdValidation,
  deleteNotification
);

// Create notification (for admin or internal use)
router.post('/',
  notificationValidation,
  createNotification
);

export default router;



