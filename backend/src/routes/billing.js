import express from 'express';
import { protect } from '../middleware/auth.js';
import { createCheckoutSession, stripeWebhook, razorpayCreateOrder, razorpayVerifyPayment, paypalCreateOrder, paypalCaptureOrder } from '../controllers/billingController.js';

const router = express.Router();

router.post('/stripe/checkout', protect, createCheckoutSession);

// Stripe requires raw body for webhook signature verification
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Razorpay
router.post('/razorpay/order', protect, express.json(), razorpayCreateOrder);
router.post('/razorpay/verify', protect, express.json(), razorpayVerifyPayment);

// PayPal
router.post('/paypal/order', protect, express.json(), paypalCreateOrder);
router.post('/paypal/capture', protect, express.json(), paypalCaptureOrder);

export default router;


