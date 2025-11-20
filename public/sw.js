// Service Worker for Push Notifications
// This service worker handles push notifications and background sync

const CACHE_NAME = 'gigs-mint-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'Gigs Mint',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'gigs-mint-notification',
    requireInteraction: false,
    vibrate: [200, 100, 200],
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/favicon.ico'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/favicon.ico'
      }
    ],
    data: {
      url: '/notifications',
      timestamp: Date.now()
    }
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      console.log('Push data received:', pushData);
      notificationData = {
        ...notificationData,
        ...pushData,
        data: {
          ...notificationData.data,
          ...pushData.data
        }
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
      // Try to get text data if JSON parsing fails
      if (event.data.text) {
        notificationData.body = event.data.text();
      }
    }
  }

  console.log('Showing notification with data:', notificationData);

  event.waitUntil((async () => {
    try {
      await self.registration.showNotification(
        notificationData.title,
        notificationData
      );
    } finally {
      await broadcastMessageToClients({
        type: 'PUSH_NOTIFICATION',
        payload: notificationData
      });
    }
  })());
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  if (event.action === 'dismiss') {
    // Just close the notification
    return;
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/notifications';
  
  event.waitUntil((async () => {
    try {
      const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          await client.focus();
          return;
        }
      }

      if (clients.openWindow) {
        await clients.openWindow(urlToOpen);
      }
    } catch (error) {
      console.error('Error handling notification click:', error);
    } finally {
      await broadcastMessageToClients({ type: 'NOTIFICATION_REFRESH' });
    }
  })());
});

// Background sync event (for future use)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Handle background sync for notifications
      syncNotifications()
    );
  }
});

// Helper function for background sync
async function syncNotifications() {
  try {
    // This would typically sync notification data with the server
    console.log('Syncing notifications in background...');
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function broadcastMessageToClients(message) {
  try {
    const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientList) {
      client.postMessage(message);
    }
  } catch (error) {
    console.error('Failed to broadcast message to clients:', error);
  }
}

// Message event - handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});


