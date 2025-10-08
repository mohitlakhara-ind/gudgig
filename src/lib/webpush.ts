import webpush from 'web-push';

// In production, set these in environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BP...abc...';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'kz...xyz...';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@yourdomain.com';

// Validate VAPID keys
const isValidVapidKey = (key: string): boolean => {
  return !!key && key.length > 0 && !key.includes('...') && !key.includes('abc') && !key.includes('xyz');
};

if (isValidVapidKey(VAPID_PUBLIC_KEY) && isValidVapidKey(VAPID_PRIVATE_KEY)) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
    console.log('VAPID keys configured successfully');
  } catch (error) {
    console.error('Failed to configure VAPID keys:', error);
  }
} else {
  console.warn('VAPID keys not properly configured. Please check your environment variables.');
}

// In-memory store for demo; replace with DB in production
type PushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

const userIdToSubscriptions = new Map<string, PushSubscription[]>();

export function getVapidPublicKey(): string {
  return VAPID_PUBLIC_KEY;
}

export function saveSubscription(userId: string, subscription: PushSubscription): void {
  const existing = userIdToSubscriptions.get(userId) || [];
  const already = existing.find((s) => s.endpoint === subscription.endpoint);
  if (!already) {
    existing.push(subscription);
    userIdToSubscriptions.set(userId, existing);
  }
}

export function removeSubscription(userId: string, endpoint: string): boolean {
  const existing = userIdToSubscriptions.get(userId) || [];
  if (existing.length === 0) {
    return false;
  }
  const filtered = existing.filter((s) => s.endpoint !== endpoint);
  if (filtered.length === existing.length) {
    // No change; endpoint not found
    return false;
  }
  if (filtered.length === 0) {
    userIdToSubscriptions.delete(userId);
  } else {
    userIdToSubscriptions.set(userId, filtered);
  }
  return true;
}

export async function sendPushToUser(userId: string, payload: any): Promise<{ sent: number; failed: number }>{
  const subs = userIdToSubscriptions.get(userId) || [];
  let sent = 0;
  let failed = 0;
  
  if (subs.length === 0) {
    console.warn(`No subscriptions found for user ${userId}`);
    return { sent: 0, failed: 0 };
  }

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as any, JSON.stringify(payload));
        console.log(`Push notification sent successfully to user ${userId}`);
        sent += 1;
      } catch (error) {
        console.error(`Failed to send push notification to user ${userId}:`, error);
        failed += 1;
      }
    })
  );
  return { sent, failed };
}



