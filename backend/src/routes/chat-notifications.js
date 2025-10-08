import express from 'express';
import { body, param, query } from 'express-validator';
import { protect } from '../middleware/auth.js';
import chatNotificationController from '../controllers/chatNotificationController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/chat-notifications - Get user's chat notifications
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('conversationId').optional().isMongoId().withMessage('Invalid conversation ID'),
  query('read').optional().isBoolean().withMessage('Read must be a boolean')
], chatNotificationController.getChatNotifications);

// GET /api/chat-notifications/unread-count - Get unread count
router.get('/unread-count', chatNotificationController.getUnreadCount);

// GET /api/chat-notifications/stats - Get notification statistics
router.get('/stats', chatNotificationController.getNotificationStats);

// GET /api/chat-notifications/recent - Get recent notifications
router.get('/recent', chatNotificationController.getRecentNotifications);

// PUT /api/chat-notifications/:id/read - Mark notification as read
router.put('/:id/read', [
  param('id').isMongoId().withMessage('Invalid notification ID')
], chatNotificationController.markAsRead);

// PUT /api/chat-notifications/conversation/:conversationId/read - Mark all notifications in conversation as read
router.put('/conversation/:conversationId/read', [
  param('conversationId').isMongoId().withMessage('Invalid conversation ID')
], chatNotificationController.markConversationAsRead);

// PUT /api/chat-notifications/read-all - Mark all notifications as read
router.put('/read-all', chatNotificationController.markAllAsRead);

// DELETE /api/chat-notifications/:id - Delete notification
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid notification ID')
], chatNotificationController.deleteNotification);

// POST /api/chat-notifications/cleanup - Clean up old notifications (admin only)
router.post('/cleanup', [
  body('daysOld').optional().isInt({ min: 1, max: 365 }).withMessage('Days old must be between 1 and 365')
], chatNotificationController.cleanupOldNotifications);

export default router;


