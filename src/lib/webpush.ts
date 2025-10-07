import webpush from 'web-push';

// In production, set these in environment variables
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  try {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  } catch {
    // no-op: misconfig should not crash import
  }
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

export async function sendPushToUser(userId: string, payload: any): Promise<{ sent: number; failed: number }>{
  const subs = userIdToSubscriptions.get(userId) || [];
  let sent = 0;
  let failed = 0;
  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(sub as any, JSON.stringify(payload));
        sent += 1;
      } catch {
        failed += 1;
      }
    })
  );
  return { sent, failed };
}



