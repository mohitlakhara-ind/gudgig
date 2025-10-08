import mongoose from 'mongoose';

const chatNotificationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  conversation: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Conversation', 
    required: true,
    index: true
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  messageId: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 500 // Truncate long messages for notifications
  },
  read: { 
    type: Boolean, 
    default: false,
    index: true
  },
  readAt: { 
    type: Date 
  },
  // Chat-specific metadata
  metadata: {
    messageType: { 
      type: String, 
      enum: ['text', 'attachment', 'system'], 
      default: 'text' 
    },
    attachmentCount: { 
      type: Number, 
      default: 0 
    },
    isGroupChat: { 
      type: Boolean, 
      default: false 
    }
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
chatNotificationSchema.index({ user: 1, read: 1, createdAt: -1 });
chatNotificationSchema.index({ conversation: 1, user: 1 });
chatNotificationSchema.index({ user: 1, createdAt: -1 });

// Virtual for unread count
chatNotificationSchema.virtual('isUnread').get(function() {
  return !this.read;
});

// Method to mark as read
chatNotificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to get unread count for user
chatNotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

// Static method to get chat notifications for user
chatNotificationSchema.statics.getUserNotifications = function(userId, options = {}) {
  const {
    page = 1,
    limit = 20,
    conversationId = null,
    read = null
  } = options;

  const query = { user: userId };
  
  if (conversationId) {
    query.conversation = conversationId;
  }
  
  if (read !== null) {
    query.read = read;
  }

  const skip = (page - 1) * limit;

  return this.find(query)
    .populate('sender', 'name email avatar')
    .populate('conversation', 'participants lastMessageAt')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
};

// Static method to mark all as read for a conversation
chatNotificationSchema.statics.markConversationAsRead = function(userId, conversationId) {
  return this.updateMany(
    { user: userId, conversation: conversationId, read: false },
    { read: true, readAt: new Date() }
  );
};

// Static method to mark all as read for user
chatNotificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    { user: userId, read: false },
    { read: true, readAt: new Date() }
  );
};

// Pre-save middleware to truncate content if too long
chatNotificationSchema.pre('save', function(next) {
  if (this.content && this.content.length > 500) {
    this.content = this.content.substring(0, 497) + '...';
  }
  next();
});

export default mongoose.model('ChatNotification', chatNotificationSchema);


