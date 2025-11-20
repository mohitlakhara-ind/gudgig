import webpush from 'web-push';

type VapidState = {
  publicKey: string;
  privateKey: string;
  configured: boolean;
  source: 'env' | 'generated' | 'invalid';
};

declare global {
  // eslint-disable-next-line no-var
  var __GIGSMINT_VAPID_STATE__?: VapidState;
}

const PLACEHOLDER_SNIPPETS = ['...', 'abc', 'xyz', 'yourdomain'];
const SUBJECT =
  process.env.VAPID_SUBJECT ||
  (process.env.VAPID_EMAIL ? `mailto:${process.env.VAPID_EMAIL}` : undefined) ||
  'mailto:admin@yourdomain.com';

const sanitize = (value?: string | null) => (value || '').trim();
const looksLikePlaceholder = (value: string) =>
  !value ||
  PLACEHOLDER_SNIPPETS.some(snippet => value.includes(snippet)) ||
  /^bp\.\.\./i.test(value) ||
  /^kz\.\.\./i.test(value);

const isValidVapidKey = (value: string) =>
  !!value &&
  value.length >= 40 &&
  /^[A-Za-z0-9_\-=]+$/.test(value) &&
  !looksLikePlaceholder(value);

function bootstrapVapidState(): VapidState {
  if (globalThis.__GIGSMINT_VAPID_STATE__) {
    return globalThis.__GIGSMINT_VAPID_STATE__;
  }

  let publicKey = sanitize(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) || sanitize(process.env.VAPID_PUBLIC_KEY);
  let privateKey = sanitize(process.env.VAPID_PRIVATE_KEY);
  let source: VapidState['source'] = 'env';

  const haveEnvKeys = isValidVapidKey(publicKey) && isValidVapidKey(privateKey);

  if (!haveEnvKeys) {
    try {
      const generated = webpush.generateVAPIDKeys();
      publicKey = generated.publicKey;
      privateKey = generated.privateKey;
      source = 'generated';
      console.warn('[webpush] VAPID keys missing or invalid. Generated temporary keys for this runtime session.');
    } catch (error) {
      console.error('[webpush] Failed to generate fallback VAPID keys:', error);
      const invalidState: VapidState = {
        publicKey: '',
        privateKey: '',
        configured: false,
        source: 'invalid',
      };
      globalThis.__GIGSMINT_VAPID_STATE__ = invalidState;
      return invalidState;
    }
  }

  const configured = isValidVapidKey(publicKey) && isValidVapidKey(privateKey);

  if (configured) {
    try {
      webpush.setVapidDetails(SUBJECT, publicKey, privateKey);
      console.log(
        `[webpush] VAPID keys configured from ${source === 'env' ? 'environment variables' : 'runtime generation'}`
      );
    } catch (error) {
      console.error('[webpush] Failed to configure VAPID keys:', error);
      const invalidState: VapidState = {
        publicKey: '',
        privateKey: '',
        configured: false,
        source: 'invalid',
      };
      globalThis.__GIGSMINT_VAPID_STATE__ = invalidState;
      return invalidState;
    }
  } else {
    console.warn(
      '[webpush] VAPID keys not configured. Provide NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables.'
    );
  }

  const state: VapidState = {
    publicKey,
    privateKey,
    configured,
    source: configured ? source : 'invalid',
  };

  globalThis.__GIGSMINT_VAPID_STATE__ = state;
  return state;
}

const vapidState = bootstrapVapidState();

// In-memory store for demo; replace with DB in production
type PushSubscription = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

const userIdToSubscriptions = new Map<string, PushSubscription[]>();

export function getVapidPublicKey(): string | null {
  return vapidState.configured ? vapidState.publicKey : null;
}

export function isPushConfigured(): boolean {
  return vapidState.configured;
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
  if (!isPushConfigured()) {
    console.warn('Push notifications are disabled because VAPID keys are not configured.');
    return { sent: 0, failed: 0 };
  }
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



