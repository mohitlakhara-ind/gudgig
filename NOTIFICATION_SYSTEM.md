# Push Notification System Implementation

This document describes the complete push notification system implemented for the Gigs Mint job portal.

## Overview

The notification system provides:
- **Push Notifications**: Real-time browser notifications
- **In-App Notifications**: Notification center with filtering and management
- **Email Notifications**: Email-based notifications (backend integration)
- **SMS Notifications**: SMS notifications (future implementation)
- **Notification Settings**: User-configurable notification preferences

## Architecture

### Frontend Components

1. **Service Worker** (`/public/sw.js`)
   - Handles push notification events
   - Manages notification display and click actions
   - Provides offline caching capabilities

2. **Notification Hook** (`/src/hooks/usePushNotifications.ts`)
   - Manages push notification subscription
   - Handles permission requests
   - Provides subscription management methods

3. **Notification Context** (`/src/contexts/NotificationContext.tsx`)
   - Centralized notification state management
   - Integrates with API and push notifications
   - Provides notification CRUD operations

4. **UI Components**
   - `NotificationBell`: Header notification bell with popover
   - `NotificationCenter`: Full notification management interface
   - `NotificationSettings`: User notification preferences

### Backend Integration

1. **API Routes**
   - `/api/notifications/vapid-public-key`: Returns VAPID public key
   - `/api/notifications/subscribe`: Saves push subscription
   - `/api/notifications/unsubscribe`: Removes push subscription
   - `/api/notifications/test`: Sends test notification

2. **Web Push Library** (`/src/lib/webpush.ts`)
   - Manages VAPID keys
   - Handles push notification sending
   - Stores user subscriptions

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
# VAPID Keys for Push Notifications
VAPID_SUBJECT=mailto:admin@yourdomain.com
VAPID_PUBLIC_KEY=BP...abc...
VAPID_PRIVATE_KEY=kz...xyz...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BP...abc...
```

### 2. Generate VAPID Keys

To generate new VAPID keys, you can use the web-push library:

```bash
npx web-push generate-vapid-keys
```

### 3. Service Worker Registration

The service worker is automatically registered via the `ServiceWorkerRegistration` component in the app layout.

### 4. PWA Manifest

The app includes a web app manifest (`/public/manifest.json`) for PWA capabilities and better notification support.

## Usage

### Basic Notification Flow

1. **User subscribes** to push notifications via the notification bell or settings page
2. **Service worker** is registered and subscription is saved to the server
3. **Backend** sends push notifications using the stored subscription
4. **Service worker** receives and displays the notification
5. **User** can click notifications to navigate to relevant pages

### Notification Types

The system supports various notification types:
- `bid_accepted`: When a bid is accepted
- `bid_rejected`: When a bid is rejected
- `message_received`: New messages
- `payment_received`: Payment notifications
- `job_posted`: New job postings
- `system`: System notifications

### User Interface

#### Notification Bell (Header)
- Shows unread notification count
- Provides quick access to recent notifications
- Allows toggling push notifications on/off
- Links to notification settings

#### Notification Center
- Full notification history
- Filtering by type and read status
- Mark as read/delete actions
- Real-time updates via WebSocket

#### Notification Settings
- Push notification preferences
- Email notification settings
- SMS notification settings (future)
- Notification type preferences

## API Integration

### Frontend API Client

The notification system integrates with the existing API client (`/src/lib/api.ts`):

```typescript
// Get notifications
const response = await apiClient.getNotifications(params);

// Mark as read
await apiClient.markNotificationAsRead(notificationId);

// Mark all as read
await apiClient.markAllNotificationsAsRead();

// Delete notification
await apiClient.deleteNotification(notificationId);

// Get unread count
const count = await apiClient.getUnreadNotificationCount();
```

### Backend Endpoints

The system expects the following backend endpoints:

- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/unread-count` - Get unread count

## Security Considerations

1. **VAPID Keys**: Keep private keys secure and never expose them to the client
2. **Subscription Validation**: Validate subscription data on the server
3. **User Authorization**: Ensure users can only access their own notifications
4. **Rate Limiting**: Implement rate limiting for notification sending

## Browser Support

- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Limited support (iOS 16.4+)
- **Edge**: Full support

## Testing

### Test Push Notification

Use the test button in notification settings or call:

```typescript
await testPushNotification();
```

### Development Testing

1. Enable notifications in browser settings
2. Subscribe to push notifications
3. Use the test notification feature
4. Check browser developer tools for service worker logs

## Troubleshooting

### Common Issues

1. **Notifications not showing**
   - Check browser notification permissions
   - Verify VAPID keys are correctly configured
   - Check service worker registration

2. **Subscription fails**
   - Ensure HTTPS is enabled (required for push notifications)
   - Check VAPID public key format
   - Verify service worker is properly registered

3. **Notifications not clickable**
   - Check service worker event listeners
   - Verify notification data includes proper URLs

### Debug Mode

Enable debug logging by checking browser console for:
- Service worker registration logs
- Push subscription logs
- Notification event logs

## Future Enhancements

1. **Rich Notifications**: Add images and action buttons
2. **Notification Scheduling**: Schedule notifications for later
3. **Notification Templates**: Customizable notification templates
4. **Analytics**: Track notification engagement
5. **Multi-device Sync**: Sync notifications across devices
6. **Notification History**: Extended notification history
7. **Smart Notifications**: AI-powered notification timing

## Dependencies

- `web-push`: Push notification library
- `react-hot-toast`: Toast notifications
- `lucide-react`: Icons
- `@radix-ui/react-*`: UI components

## File Structure

```
src/
├── components/
│   └── notifications/
│       ├── NotificationBell.tsx
│       ├── NotificationCenter.tsx
│       └── NotificationSettings.tsx
├── contexts/
│   └── NotificationContext.tsx
├── hooks/
│   └── usePushNotifications.ts
├── lib/
│   └── webpush.ts
└── app/
    └── api/
        └── notifications/
            ├── vapid-public-key/
            ├── subscribe/
            ├── unsubscribe/
            └── test/

public/
├── sw.js
└── manifest.json
```

This notification system provides a comprehensive solution for real-time user engagement in the Gigs Mint platform.



