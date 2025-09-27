import asyncHandler from '../middleware/asyncHandler.js';
import Notification from '../models/Notification.js';
import NotificationService from '../services/notificationService.js';
import User from '../models/User.js';

// @desc    Get notifications for authenticated user
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const read = req.query.read;
  const type = req.query.type;

  const query = { user: req.user._id };
  
  if (read !== undefined) {
    query.read = read === 'true';
  }
  
  if (type) {
    query.type = type;
  }

  const skip = (page - 1) * limit;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email');

  const total = await Notification.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// @desc    Update notification preferences
// @route   PUT /api/notifications/preferences
// @access  Private
const updatePreferences = asyncHandler(async (req, res) => {
  const { email, push, sms, inApp } = req.body;

  const preferences = await NotificationService.updateUserPreferences(req.user._id, {
    email: email !== undefined ? email : true,
    push: push !== undefined ? push : true,
    sms: sms !== undefined ? sms : false,
    inApp: inApp !== undefined ? inApp : true
  });

  res.status(200).json({
    success: true,
    data: preferences
  });
});

// @desc    Get notification preferences
// @route   GET /api/notifications/preferences
// @access  Private
const getPreferences = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('notificationPreferences');
  
  const preferences = user.notificationPreferences || {
    email: true,
    push: true,
    sms: false,
    inApp: true
  };

  res.status(200).json({
    success: true,
    data: preferences
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  notification.read = true;
  notification.readAt = new Date();
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, read: false },
    { 
      read: true, 
      readAt: new Date() 
    }
  );

  res.status(200).json({
    success: true,
    data: {
      modifiedCount: result.modifiedCount
    }
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: 'Notification not found'
    });
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Notification deleted successfully'
  });
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    read: false
  });

  res.status(200).json({
    success: true,
    data: {
      count
    }
  });
});

export {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  updatePreferences,
  getPreferences
};