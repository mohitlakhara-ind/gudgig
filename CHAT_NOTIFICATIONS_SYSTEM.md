# Chat Notifications System

This document describes the chat notifications system implemented for the job portal backend. This system provides real-time notifications for chat messages that are separate from the main notification feed.

## Overview

The chat notifications system provides:
- **Real-time chat notifications** when users receive new messages
- **Separate from main notifications** - chat notifications don't appear in the regular notification feed
- **Socket.io integration** for instant delivery
- **User preferences** for enabling/disabling chat notifications
- **Comprehensive API** for managing chat notifications

## Architecture

### Models

#### ChatNotification Model
- Stores chat-specific notifications separately from regular notifications
- Includes conversation context, sender information, and message metadata
- Optimized for chat-specific queries and operations

#### User Model Updates
- Added `notificationPreferences.chatNotifications` field
- Defaults to `true` for all users
- Can be disabled per user preference

### Services

#### ChatNotificationService
- Handles creation, retrieval, and management of chat notifications
- Integrates with Socket.io for real-time delivery
- Provides methods for marking as read, deleting, and cleanup

### Controllers

#### ChatNotificationController
- RESTful API endpoints for chat notification management
- Validation and error handling
- User authentication and authorization

### Routes

#### Chat Notifications API Routes
- `GET /api/chat-notifications` - Get user's chat notifications
- `GET /api/chat-notifications/unread-count` - Get unread count
- `GET /api/chat-notifications/stats` - Get notification statistics
- `GET /api/chat-notifications/recent` - Get recent notifications
- `PUT /api/chat-notifications/:id/read` - Mark notification as read
- `PUT /api/chat-notifications/conversation/:conversationId/read` - Mark conversation as read
- `PUT /api/chat-notifications/read-all` - Mark all as read
- `DELETE /api/chat-notifications/:id` - Delete notification
- `POST /api/chat-notifications/cleanup` - Clean up old notifications (admin only)

## Features

### Real-time Notifications
- Instant delivery via Socket.io
- Separate event types: `chat:notification` and `notification:chat`
- User-specific rooms for targeted delivery

### Message Context
- Includes sender information (name, email, avatar)
- Conversation details and metadata
- Message content (truncated for display)
- Attachment information

### User Preferences
- Chat notifications can be enabled/disabled per user
- Respects user's notification preferences
- Defaults to enabled for all users

### Performance Optimizations
- Compound database indexes for efficient queries
- Content truncation for long messages
- Pagination support for large notification lists
- Cleanup functionality for old notifications

## API Usage

### Get Chat Notifications
```javascript
GET /api/chat-notifications?page=1&limit=20&conversationId=123&read=false
```

### Get Unread Count
```javascript
GET /api/chat-notifications/unread-count
```

### Mark as Read
```javascript
PUT /api/chat-notifications/notificationId/read
```

### Mark Conversation as Read
```javascript
PUT /api/chat-notifications/conversation/conversationId/read
```

## Socket.io Events

### Client-side Events to Listen For

#### `chat:notification`
Emitted when a new chat notification is received:
```javascript
socket.on('chat:notification', (notification) => {
  console.log('New chat notification:', notification);
  // notification.isChatNotification = true (indicates it's a chat notification)
});
```

#### `notification:chat`
Alternative event for chat notifications:
```javascript
socket.on('notification:chat', (notification) => {
  console.log('Chat notification:', notification);
});
```

#### `chat:notification:read`
Emitted when a notification is marked as read:
```javascript
socket.on('chat:notification:read', (data) => {
  console.log('Notification marked as read:', data);
});
```

#### `chat:conversation:read`
Emitted when all notifications in a conversation are marked as read:
```javascript
socket.on('chat:conversation:read', (data) => {
  console.log('Conversation marked as read:', data);
});
```

#### `chat:all:read`
Emitted when all chat notifications are marked as read:
```javascript
socket.on('chat:all:read', (data) => {
  console.log('All notifications marked as read:', data);
});
```

#### `chat:notification:deleted`
Emitted when a notification is deleted:
```javascript
socket.on('chat:notification:deleted', (data) => {
  console.log('Notification deleted:', data);
});
```

## Integration with Existing Chat System

### Automatic Notification Creation
- Notifications are automatically created when messages are sent
- Integrated into the existing `sendMessage` controller
- Non-blocking - message sending continues even if notification creation fails

### Conversation Context
- Notifications include conversation ID for easy filtering
- Support for both 1-on-1 and group conversations
- Metadata includes group chat indicators

## Database Schema

### ChatNotification Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId, // Recipient user ID
  conversation: ObjectId, // Conversation ID
  sender: ObjectId, // Sender user ID
  messageId: String, // Message identifier
  content: String, // Message content (truncated)
  read: Boolean, // Read status
  readAt: Date, // When marked as read
  metadata: {
    messageType: String, // 'text', 'attachment', 'system'
    attachmentCount: Number, // Number of attachments
    isGroupChat: Boolean // Whether it's a group conversation
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `{ user: 1, read: 1, createdAt: -1 }` - For user notifications with read status
- `{ conversation: 1, user: 1 }` - For conversation-specific queries
- `{ user: 1, createdAt: -1 }` - For user's notification history

## Configuration

### Environment Variables
No additional environment variables required - uses existing Socket.io and database configuration.

### User Preferences
Users can control chat notifications through their notification preferences:
```javascript
{
  notificationPreferences: {
    chatNotifications: true, // Enable/disable chat notifications
    // ... other notification preferences
  }
}
```

## Security Considerations

### User Authorization
- All API endpoints require authentication
- Users can only access their own notifications
- Admin-only cleanup endpoint

### Data Validation
- Input validation on all API endpoints
- Content truncation to prevent abuse
- Rate limiting through existing middleware

## Performance Considerations

### Database Optimization
- Compound indexes for efficient queries
- Pagination for large result sets
- Cleanup job for old notifications

### Memory Management
- Content truncation for long messages
- Efficient Socket.io room management
- Non-blocking notification creation

## Monitoring and Maintenance

### Cleanup
- Admin endpoint for cleaning up old notifications
- Configurable retention period (default: 30 days)
- Only removes read notifications

### Statistics
- Unread count tracking
- Notification statistics per user
- Performance metrics through existing monitoring

## Error Handling

### Graceful Degradation
- Message sending continues even if notification creation fails
- Socket.io errors are logged but don't affect core functionality
- Database errors are properly handled and logged

### Logging
- All errors are logged with context
- Performance metrics for notification creation
- Socket.io connection and disconnection events

## Future Enhancements

### Potential Improvements
1. **Rich Notifications**: Support for images and file previews
2. **Notification Templates**: Customizable notification formats
3. **Push Notifications**: Mobile push notification support
4. **Notification Scheduling**: Delayed notification delivery
5. **Advanced Filtering**: Filter by conversation, sender, or message type
6. **Notification Analytics**: Track notification engagement and effectiveness

### Scalability Considerations
1. **Redis Integration**: Use Redis for real-time notification caching
2. **Message Queues**: Implement queue system for high-volume notifications
3. **Database Sharding**: Partition notifications by user for large scale
4. **CDN Integration**: Serve notification assets through CDN

## Testing

### Unit Tests
- Test notification creation and retrieval
- Test user preference handling
- Test Socket.io event emission

### Integration Tests
- Test API endpoints with authentication
- Test real-time notification delivery
- Test database operations and indexing

### Load Testing
- Test notification creation under high message volume
- Test Socket.io performance with many concurrent users
- Test database performance with large notification datasets

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check user's chat notification preferences
   - Verify Socket.io connection
   - Check database connectivity

2. **Performance issues**
   - Monitor database indexes
   - Check Socket.io room management
   - Review notification cleanup frequency

3. **Missing notifications**
   - Check notification service initialization
   - Verify message sending integration
   - Review error logs for notification creation failures

### Debug Mode
Enable debug logging by checking console output for:
- Chat notification creation logs
- Socket.io event emission logs
- Database operation logs
- User preference validation logs

This chat notifications system provides a robust, scalable solution for real-time chat notifications that integrates seamlessly with the existing job portal infrastructure while maintaining separation from the main notification feed.


