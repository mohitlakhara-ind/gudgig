// Service Worker for Push Notifications
// This service worker handles push notifications and background sync

const CACHE_NAME = 'gudgig-v1';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Add each URL individually and catch errors to prevent cache.addAll from failing
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null; // Continue even if one fails
            })
          )
        );
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
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
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Don't cache API requests or external resources
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || 
      url.pathname.startsWith('/_next/') ||
      url.origin !== self.location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request).then((fetchResponse) => {
          // Cache successful responses
          if (fetchResponse && fetchResponse.status === 200) {
            const responseToCache = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache).catch(() => {
                // Ignore cache errors
              });
            });
          }
          return fetchResponse;
        }).catch(() => {
          // If network fails and no cache, return offline page if available
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'Gudgig',
    body: 'You have a new notification',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'gudgig-notification',
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


