import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'application_status',
      'job_match',
      'interview_scheduled',
      'interview_reminder',
      'interview_cancelled',
      'offer_received',
      'offer_accepted',
      'offer_declined',
      'message',
      'job_new_application',
      'job_expired',
      'job_promoted',
      'profile_viewed',
      'saved_search_match',
      'company_update',
      'system_maintenance',
      'account_security',
      'payment_reminder',
      'subscription_expiry',
      'feature_announcement'
    ],
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1 });

// Virtual for formatting
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return this.createdAt.toLocaleDateString();
});

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, type, title, message, data = {}) {
  return this.create({
    user: userId,
    type,
    title,
    message,
    data
  });
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

// Static method to mark all as read for user
notificationSchema.statics.markAllAsReadForUser = async function(userId) {
  return this.updateMany(
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

// Pre-save middleware to set readAt when marking as read
notificationSchema.pre('save', function(next) {
  if (this.isModified('read') && this.read && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// Ensure virtual fields are serialized
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

export default mongoose.model('Notification', notificationSchema);