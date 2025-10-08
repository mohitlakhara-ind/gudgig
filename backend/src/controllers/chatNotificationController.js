import { validationResult } from 'express-validator';
import chatNotificationService from '../services/chatNotificationService.js';

// Get user's chat notifications with pagination and filtering
export const getChatNotifications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const userId = req.user.id;
    const {
      page = 1,
      limit = 20,
      conversationId = null,
      read = null
    } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      conversationId,
      read: read !== null ? read === 'true' : null
    };

    const notifications = await chatNotificationService.getUserChatNotifications(userId, options);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          page: options.page,
          limit: options.limit
        }
      }
    });

  } catch (error) {
    console.error('Error fetching chat notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat notifications'
    });
  }
};

// Get unread chat notifications count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await chatNotificationService.getUnreadCount(userId);

    res.status(200).json({
      success: true,
      data: { count }
    });

  } catch (error) {
    console.error('Error fetching unread chat count:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count'
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await chatNotificationService.getNotificationStats(userId);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching chat notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notification stats'
    });
  }
};

// Get recent notifications
export const getRecentNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await chatNotificationService.getRecentNotifications(userId);

    res.status(200).json({
      success: true,
      data: notifications
    });

  } catch (error) {
    console.error('Error fetching recent chat notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recent notifications'
    });
  }
};

// Mark chat notification as read
export const markAsRead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const notification = await chatNotificationService.markAsRead(id, userId);

    res.status(200).json({
      success: true,
      data: notification,
      message: 'Chat notification marked as read'
    });

  } catch (error) {
    console.error('Error marking chat notification as read:', error);
    if (error.message === 'Chat notification not found') {
      return res.status(404).json({
        success: false,
        message: 'Chat notification not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating chat notification'
    });
  }
};

// Mark all notifications in a conversation as read
export const markConversationAsRead = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { conversationId } = req.params;
    const userId = req.user.id;

    const result = await chatNotificationService.markConversationAsRead(userId, conversationId);

    res.status(200).json({
      success: true,
      data: {
        conversationId,
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} chat notifications marked as read`
    });

  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating conversation notifications'
    });
  }
};

// Mark all chat notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await chatNotificationService.markAllAsRead(userId);

    res.status(200).json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount
      },
      message: `${result.modifiedCount} chat notifications marked as read`
    });

  } catch (error) {
    console.error('Error marking all chat notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating chat notifications'
    });
  }
};

// Delete chat notification
export const deleteNotification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.id;

    const notification = await chatNotificationService.deleteNotification(id, userId);

    res.status(200).json({
      success: true,
      message: 'Chat notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting chat notification:', error);
    if (error.message === 'Chat notification not found') {
      return res.status(404).json({
        success: false,
        message: 'Chat notification not found'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error while deleting chat notification'
    });
  }
};

// Clean up old notifications (admin only)
export const cleanupOldNotifications = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array()
      });
    }

    const { daysOld = 30 } = req.body;

    const result = await chatNotificationService.cleanupOldNotifications(daysOld);

    res.status(200).json({
      success: true,
      data: {
        deletedCount: result.deletedCount
      },
      message: `Cleaned up ${result.deletedCount} old chat notifications`
    });

  } catch (error) {
    console.error('Error cleaning up old chat notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cleaning up notifications'
    });
  }
};

export default {
  getChatNotifications,
  getUnreadCount,
  getNotificationStats,
  getRecentNotifications,
  markAsRead,
  markConversationAsRead,
  markAllAsRead,
  deleteNotification,
  cleanupOldNotifications
};


