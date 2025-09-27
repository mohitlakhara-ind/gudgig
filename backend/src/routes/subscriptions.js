import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMySubscription, upsertSubscription, createCheckout, stripeWebhook, cancelAtPeriodEnd, resumeAutoRenew, getUsage, razorpayWebhook, paypalWebhook, portal } from '../controllers/subscriptionController.js';
import { subscriptionPlans } from '../config/subscriptionPlans.js';
import Subscription from '../models/Subscription.js';
import { createCustomerPortalSession } from '../services/paymentService.js';

const router = express.Router();

// Stripe webhook is public; must receive raw body in server config
// Legacy path
router.post('/webhooks/stripe', stripeWebhook);
router.post('/webhooks/razorpay', razorpayWebhook);
router.post('/webhooks/paypal', paypalWebhook);
// New path per API spec
router.post('/webhook', stripeWebhook);

router.use(protect);

// Legacy path
router.get('/me', getMySubscription);
// New path per API spec
router.get('/my', getMySubscription);
router.put('/me', upsertSubscription);
router.post('/checkout', createCheckout);
// Legacy verbs kept for backward compatibility
router.post('/cancel', cancelAtPeriodEnd);
router.post('/resume', resumeAutoRenew);
// New verbs per API spec
router.put('/cancel', cancelAtPeriodEnd);
router.put('/resume', resumeAutoRenew);
router.get('/usage', getUsage);

// Plans listing (public to authenticated users)
router.get('/plans', (req, res) => {
  res.status(200).json({ success: true, data: subscriptionPlans });
});

// Stripe Customer Portal session creation
router.post('/portal', portal);

export default router;


