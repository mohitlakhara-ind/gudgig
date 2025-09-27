import crypto from 'crypto';

let RazorpaySDK = null;

export function isRazorpayEnabled() {
  return process.env.ENABLE_RAZORPAY === 'true' && !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET;
}

export function getRazorpayClient() {
  if (!isRazorpayEnabled()) return null;
  if (!RazorpaySDK) {
    // Lazy import to avoid dependency unless enabled
    // eslint-disable-next-line global-require
    RazorpaySDK = require('razorpay');
  }
  return new RazorpaySDK({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
}

export async function createOrder(amountInPaise, currency = 'INR', receipt = undefined, notes = {}) {
  const client = getRazorpayClient();
  if (!client) throw new Error('Razorpay is not enabled');
  const order = await client.orders.create({ amount: amountInPaise, currency, receipt, notes });
  return order;
}

export function verifySignature({ orderId, paymentId, signature }) {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expected === signature;
}

export function verifyWebhookSignature(rawBody, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  return expected === signature;
}


