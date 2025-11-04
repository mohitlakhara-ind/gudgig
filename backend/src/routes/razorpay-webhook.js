import express from 'express';
import crypto from 'crypto';
import { handlePaymentWebhook } from '../services/paymentService.js';

const router = express.Router();

// Use raw body to compute signature
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (process.env.ENABLE_RAZORPAY !== 'true') {
      return res.status(400).send('Razorpay not enabled');
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).send('Webhook secret not configured');
    }

    const signature = req.get('x-razorpay-signature') || '';
    const rawBody = req.body instanceof Buffer ? req.body : Buffer.from(req.body || '');

    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expected !== signature) {
      return res.status(400).send('Invalid signature');
    }

    const event = JSON.parse(rawBody.toString('utf8'));
    await handlePaymentWebhook(event, 'razorpay');

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[razorpay] webhook error', err);
    return res.status(500).send('Webhook handler error');
  }
});

export default router;



