import Stripe from 'stripe';
import crypto from 'crypto';
import { subscriptionPlans, BILLING_CYCLES, PLAN_IDS } from '../config/subscriptionPlans.js';
import { createOrder as createRazorpayOrder, verifyWebhookSignature as verifyRazorpayWebhookSignature } from './payments/razorpay.js';
import { createOrder as createPaypalOrder, captureOrder as capturePaypalOrder, isPaypalEnabled } from './payments/paypal.js';

const STRIPE_API_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

let stripeClient = null;
if (STRIPE_API_KEY) {
	stripeClient = new Stripe(STRIPE_API_KEY, { apiVersion: '2023-10-16' });
}

export function getStripe() {
	if (!stripeClient) throw new Error('Stripe is not configured');
	return stripeClient;
}

export async function createSubscriptionCheckoutSession({
	customerId,
	priceId,
	successUrl,
	cancelUrl,
	mode = 'subscription',
	trialPeriodDays,
	metadata
}) {
	const stripe = getStripe();
	const params = {
		mode,
		customer: customerId,
		line_items: [{ price: priceId, quantity: 1 }],
		success_url: successUrl,
		cancel_url: cancelUrl,
		allow_promotion_codes: true
	};
	if (typeof trialPeriodDays === 'number') {
		params.subscription_data = { trial_period_days: trialPeriodDays };
	}
	if (metadata && typeof metadata === 'object') {
		params.metadata = metadata;
	}
	return await stripe.checkout.sessions.create(params);
}

export function verifyStripeSignature(rawBody, signature) {
	const stripe = getStripe();
	return stripe.webhooks.constructEvent(rawBody, signature, STRIPE_WEBHOOK_SECRET);
}

export async function handleStripeWebhook(event) {
	switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object;
            if (session?.metadata?.context === 'job_promotion') {
                return { action: 'apply_promotion', payload: session };
            }
            return { action: 'activate_subscription', payload: session };
        }
		case 'invoice.payment_failed':
			return { action: 'mark_past_due', payload: event.data.object };
		case 'customer.subscription.deleted':
			return { action: 'cancel_subscription', payload: event.data.object };
		case 'customer.subscription.updated':
			return { action: 'update_subscription', payload: event.data.object };
		default:
			return { action: 'noop', payload: event.data.object };
	}
}

export async function createCustomerPortalSession({ customerId, returnUrl }) {
	const stripe = getStripe();
	const session = await stripe.billingPortal.sessions.create({
		customer: customerId,
		return_url: returnUrl || process.env.APP_URL || 'http://localhost:3000'
	});
	return session;
}

export async function createRefund(paymentIntentId, amount) {
	const stripe = getStripe();
	return await stripe.refunds.create({ payment_intent: paymentIntentId, amount });
}

// Unified provider-agnostic API
export async function createUnifiedCheckout({ provider = 'stripe', user, planId, billingCycle = BILLING_CYCLES.MONTHLY, successUrl, cancelUrl, metadata = {}, mode = 'subscription' }) {
    if (provider === 'stripe') {
        if (!metadata.context) metadata.context = mode === 'subscription' ? 'subscription' : 'one_time';
        // Stripe uses priceId; assume mapping handled upstream and passed in metadata or via plan config
        const plan = subscriptionPlans[planId] || subscriptionPlans[PLAN_IDS.PRO];
        const priceId = plan?.priceIds?.[billingCycle];
        if (!priceId) throw new Error('Stripe price id not configured');
        // Customer creation handled at controller level to reuse customer across sessions
        return { provider: 'stripe', requiresRedirect: true, sessionFactory: async ({ customerId }) => {
            const session = await createSubscriptionCheckoutSession({ customerId, priceId, successUrl, cancelUrl, metadata });
            return { id: session.id, url: session.url };
        }};
    }
    if (provider === 'razorpay') {
        const plan = subscriptionPlans[planId] || subscriptionPlans[PLAN_IDS.PRO];
        const price = plan?.pricing?.[billingCycle];
        if (!price) throw new Error('Razorpay price not configured');
        const amountInPaise = price.amount * 1; // already in minor units if stored that way; adjust if needed
        const order = await createRazorpayOrder(amountInPaise, (price.currency || 'INR').toUpperCase(), undefined, { userId: user?.id || user?._id, planId, billingCycle, context: 'subscription' });
        return { provider: 'razorpay', requiresRedirect: false, order };
    }
    if (provider === 'paypal') {
        const plan = subscriptionPlans[planId] || subscriptionPlans[PLAN_IDS.PRO];
        const price = plan?.pricing?.[billingCycle];
        if (!price) throw new Error('PayPal price not configured');
        const amount = (price.amount / 100).toFixed(2);
        const order = await createPaypalOrder(amount, (price.currency || 'USD').toUpperCase(), successUrl, cancelUrl);
        return { provider: 'paypal', requiresRedirect: true, order };
    }
    throw new Error('Unsupported provider');
}

export function verifyRazorpayWebhook(rawBody, signature) {
    return verifyRazorpayWebhookSignature(rawBody, signature);
}

export async function handleRazorpayWebhook(event, payload) {
    // Razorpay does not sign like Stripe; event type may be in headers. We trust verifyRazorpayWebhook.
    // Basic mapping: payment.captured -> activate_subscription
    const type = event || payload?.event;
    switch (type) {
        case 'payment.captured':
        case 'order.paid':
            return { action: 'activate_subscription', payload };
        case 'payment.failed':
            return { action: 'mark_past_due', payload };
        default:
            return { action: 'noop', payload };
    }
}

export async function handlePaypalWebhook(eventBody) {
    // Assuming PayPal webhooks configured; minimal mapping
    const eventType = eventBody?.event_type;
    switch (eventType) {
        case 'CHECKOUT.ORDER.APPROVED':
        case 'PAYMENT.CAPTURE.COMPLETED':
            return { action: 'activate_subscription', payload: eventBody?.resource };
        case 'PAYMENT.CAPTURE.DENIED':
            return { action: 'mark_past_due', payload: eventBody?.resource };
        default:
            return { action: 'noop', payload: eventBody };
    }
}

export const paymentProviders = {
    stripe: {
        createCheckoutSession: createSubscriptionCheckoutSession,
        verifySignature: verifyStripeSignature,
        handleWebhook: handleStripeWebhook,
        createRefund
    }
};


