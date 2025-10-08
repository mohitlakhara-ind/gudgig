import mongoose from 'mongoose';
import ChatNotification from '../models/ChatNotification.js';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';

class ChatNotificationService {
  constructor() {
    this.io = null;
  }

  // Set the Socket.io instance
  setSocketIO(io) {
    this.io = io;
  }

  /**
   * Create a chat notification when a new message is received
   * @param {string} conversationId - The conversation ID
   * @param {string} senderId - The sender's user ID
   * @param {string} messageId - The message ID
   * @param {string} content - The message content
   * @param {Object} metadata - Additional message metadata
   */
  async createChatNotification(conversationId, senderId, messageId, content, metadata = {}) {
    try {
      // Get conversation details
      const conversation = await Conversation.findById(conversationId)
        .populate('participants', '_id name email')
        .exec();

      if (!conversation) {
        throw new Error('Conversation not found');
      }

      // Get sender details
      const sender = await User.findById(senderId).select('name email avatar').exec();
      if (!sender) {
        throw new Error('Sender not found');
      }

      // Create notifications for all participants except the sender
      const notifications = [];
      const recipients = conversation.participants.filter(
        participant => participant._id.toString() !== senderId
      );

      for (const recipient of recipients) {
        // Check if user has chat notifications enabled
        const user = await User.findById(recipient._id).select('notificationPreferences').exec();
        const chatNotificationsEnabled = user?.notificationPreferences?.chatNotifications !== false;

        if (chatNotificationsEnabled) {
          const notification = new ChatNotification({
            user: recipient._id,
            conversation: conversationId,
            sender: senderId,
            messageId,
            content: this.truncateContent(content),
            metadata: {
              messageType: metadata.messageType || 'text',
              attachmentCount: metadata.attachmentCount || 0,
              isGroupChat: conversation.participants.length > 2
            }
          });

          await notification.save();
          notifications.push(notification);

          // Emit real-time notification via Socket.io
          await this.emitChatNotification(recipient._id, notification, sender, conversation);
        }
      }

      return notifications;
    } catch (error) {
      console.error('Error creating chat notification:', error);
      throw error;
    }
  }

  /**
   * Emit chat notification via Socket.io
   * @param {string} userId - The recipient's user ID
   * @param {Object} notification - The notification object
   * @param {Object} sender - The sender's details
   * @param {Object} conversation - The conversation details
   */
  async emitChatNotification(userId, notification, sender, conversation) {
    if (!this.io) {
      console.warn('Socket.io not available for chat notifications');
      return;
    }

    try {
      const notificationData = {
        id: notification._id,
        type: 'chat_message',
        conversationId: conversation._id,
        sender: {
          id: sender._id,
          name: sender.name,
          email: sender.email,
          avatar: sender.avatar
        },
        content: notification.content,
        messageId: notification.messageId,
        metadata: notification.metadata,
        read: notification.read,
        createdAt: notification.createdAt,
        // Don't include in regular notification feed
        isChatNotification: true
      };

      // Emit to user's personal room
      this.io.to(`user:${userId}`).emit('chat:notification', notificationData);

      // Also emit a general notification event for chat-specific handling
      this.io.to(`user:${userId}`).emit('notification:chat', notificationData);

      console.log(`Chat notification emitted to user ${userId}`);
    } catch (error) {
      console.error('Error emitting chat notification:', error);
    }
  }

  /**
   * Get chat notifications for a user
   * @param {string} userId - The user ID
   * @param {Object} options - Query options
   */
  async getUserChatNotifications(userId, options = {}) {
    try {
      return await ChatNotification.getUserNotifications(userId, options);
    } catch (error) {
      console.error('Error getting user chat notifications:', error);
      throw error;
    }
  }

  /**
   * Get unread chat notification count for a user
   * @param {string} userId - The user ID
   */
  async getUnreadCount(userId) {
    try {
      return await ChatNotification.getUnreadCount(userId);
    } catch (error) {
      console.error('Error getting unread chat count:', error);
      throw error;
    }
  }

  /**
   * Mark chat notification as read
   * @param {string} notificationId - The notification ID
   * @param {string} userId - The user ID (for security)
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await ChatNotification.findOne({
        _id: notificationId,
        user: userId
      });

      if (!notification) {
        throw new Error('Chat notification not found');
      }

      await notification.markAsRead();

      // Emit update via Socket.io
      if (this.io) {
        this.io.to(`user:${userId}`).emit('chat:notification:read', {
          id: notificationId,
          read: true,
          readAt: notification.readAt
        });
      }

      return notification;
    } catch (error) {
      console.error('Error marking chat notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all chat notifications as read for a conversation
   * @param {string} userId - The user ID
   * @param {string} conversationId - The conversation ID
   */
  async markConversationAsRead(userId, conversationId) {
    try {
      const result = await ChatNotification.markConversationAsRead(userId, conversationId);

      // Emit update via Socket.io
      if (this.io) {
        this.io.to(`user:${userId}`).emit('chat:conversation:read', {
          conversationId,
          modifiedCount: result.modifiedCount
        });
      }

      return result;
    } catch (error) {
      console.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  /**
   * Mark all chat notifications as read for a user
   * @param {string} userId - The user ID
   */
  async markAllAsRead(userId) {
    try {
      const result = await ChatNotification.markAllAsRead(userId);

      // Emit update via Socket.io
      if (this.io) {
        this.io.to(`user:${userId}`).emit('chat:all:read', {
          modifiedCount: result.modifiedCount
        });
      }

      return result;
    } catch (error) {
      console.error('Error marking all chat notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a chat notification
   * @param {string} notificationId - The notification ID
   * @param {string} userId - The user ID (for security)
   */
  async deleteNotification(notificationId, userId) {
    try {
      const notification = await ChatNotification.findOneAndDelete({
        _id: notificationId,
        user: userId
      });

      if (!notification) {
        throw new Error('Chat notification not found');
      }

      // Emit deletion via Socket.io
      if (this.io) {
        this.io.to(`user:${userId}`).emit('chat:notification:deleted', {
          id: notificationId
        });
      }

      return notification;
    } catch (error) {
      console.error('Error deleting chat notification:', error);
      throw error;
    }
  }

  /**
   * Clean up old chat notifications (for maintenance)
   * @param {number} daysOld - Number of days old to clean up
   */
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await ChatNotification.deleteMany({
        read: true,
        createdAt: { $lt: cutoffDate }
      });

      console.log(`Cleaned up ${result.deletedCount} old chat notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up old chat notifications:', error);
      throw error;
    }
  }

  /**
   * Get chat notification statistics for a user
   * @param {string} userId - The user ID
   */
  async getNotificationStats(userId) {
    try {
      const stats = await ChatNotification.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: ['$read', 0, 1] } },
            read: { $sum: { $cond: ['$read', 1, 0] } },
            thisWeek: {
              $sum: {
                $cond: [
                  { $gte: ['$createdAt', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)] },
                  1,
                  0
                ]
              }
            }
          }
        }
      ]);

      return stats[0] || { total: 0, unread: 0, read: 0, thisWeek: 0 };
    } catch (error) {
      console.error('Error getting chat notification stats:', error);
      throw error;
    }
  }

  /**
   * Truncate content for notification display
   * @param {string} content - The message content
   * @param {number} maxLength - Maximum length (default: 100)
   */
  truncateContent(content, maxLength = 100) {
    if (!content || content.length <= maxLength) {
      return content;
    }
    return content.substring(0, maxLength - 3) + '...';
  }

  /**
   * Check if user has unread chat notifications
   * @param {string} userId - The user ID
   */
  async hasUnreadNotifications(userId) {
    try {
      const count = await ChatNotification.countDocuments({
        user: userId,
        read: false
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking unread chat notifications:', error);
      return false;
    }
  }

  /**
   * Get recent chat notifications for a user (last 10)
   * @param {string} userId - The user ID
   */
  async getRecentNotifications(userId) {
    try {
      return await ChatNotification.find({ user: userId })
        .populate('sender', 'name email avatar')
        .populate('conversation', 'participants')
        .sort({ createdAt: -1 })
        .limit(10)
        .exec();
    } catch (error) {
      console.error('Error getting recent chat notifications:', error);
      throw error;
    }
  }
}

export default new ChatNotificationService();
