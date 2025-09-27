import Subscription from '../models/Subscription.js';
import { getPlanDefinition, getFeatureLimit, PLAN_IDS, getStripePriceId, BILLING_CYCLES } from '../config/subscriptionPlans.js';
import { createSubscriptionCheckoutSession, verifyStripeSignature, handleStripeWebhook, getStripe, createUnifiedCheckout, createCustomerPortalSession, verifyRazorpayWebhook, handleRazorpayWebhook, handlePaypalWebhook } from '../services/paymentService.js';

export const getMySubscription = async (req, res, next) => {
	try {
		const sub = await Subscription.findOne({ user: req.user.id });
		res.status(200).json({ success: true, data: sub });
	} catch (err) {
		next(err);
	}
};

export const upsertSubscription = async (req, res, next) => {
	try {
		const { plan, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, stripeCustomerId, stripeSubscriptionId, billingCycle } = req.body;
		const sub = await Subscription.findOneAndUpdate(
			{ user: req.user.id },
			{ plan, status, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, stripeCustomerId, stripeSubscriptionId, billingCycle },
			{ new: true, upsert: true }
		);
		res.status(200).json({ success: true, data: sub });
	} catch (err) {
		next(err);
	}
};

export const createCheckout = async (req, res, next) => {
	try {
        const { provider = 'stripe', planId = PLAN_IDS.PRO, billingCycle = BILLING_CYCLES.MONTHLY, successUrl, cancelUrl, mode = 'subscription', metadata } = req.body;

        // Ensure subscription record exists for user
        let subscription = await Subscription.findOne({ user: req.user.id });
        if (!subscription) {
            subscription = await Subscription.create({ user: req.user.id, plan: PLAN_IDS.FREE, status: 'inactive' });
        }

        if (provider === 'stripe') {
            if (!subscription.stripeCustomerId) {
                const stripe = getStripe();
                const customer = await stripe.customers.create({
                    email: req.user?.email,
                    name: req.user?.name,
                    metadata: { userId: String(req.user?.id || req.user?._id) }
                });
                subscription.stripeCustomerId = customer.id;
                await subscription.save();
            }
            const unified = await createUnifiedCheckout({ provider, user: req.user, planId, billingCycle, successUrl, cancelUrl, metadata, mode });
            const session = await unified.sessionFactory({ customerId: subscription.stripeCustomerId });
            return res.status(200).json({ success: true, data: { provider: 'stripe', ...session } });
        }

        if (provider === 'razorpay') {
            const result = await createUnifiedCheckout({ provider, user: req.user, planId, billingCycle, successUrl, cancelUrl, metadata, mode });
            return res.status(200).json({ success: true, data: { provider: 'razorpay', order: result.order } });
        }

        if (provider === 'paypal') {
            const result = await createUnifiedCheckout({ provider, user: req.user, planId, billingCycle, successUrl, cancelUrl, metadata, mode });
            return res.status(200).json({ success: true, data: { provider: 'paypal', order: result.order } });
        }

        return res.status(400).json({ success: false, message: 'Unsupported provider' });
	} catch (err) {
		next(err);
	}
};

export const stripeWebhook = async (req, res, next) => {
	try {
		const signature = req.headers['stripe-signature'];
		const rawBody = req.rawBody || req.bodyRaw || req.bodyString || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
		const event = verifyStripeSignature(rawBody, signature);
		const action = await handleStripeWebhook(event);
		await applySubscriptionAction(action);
		res.status(200).json({ received: true });
	} catch (err) {
		next(err);
	}
};

export const razorpayWebhook = async (req, res, next) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const rawBody = req.rawBody || req.bodyRaw || req.bodyString || (typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
        const verified = verifyRazorpayWebhook(rawBody, signature);
        if (!verified) return res.status(400).json({ success: false, message: 'Invalid signature' });
        const action = await handleRazorpayWebhook(req.headers['x-razorpay-event'], req.body);
        await applySubscriptionAction(action);
        res.status(200).json({ received: true });
    } catch (err) {
        next(err);
    }
};

export const paypalWebhook = async (req, res, next) => {
    try {
        const action = await handlePaypalWebhook(req.body);
        await applySubscriptionAction(action);
        res.status(200).json({ received: true });
    } catch (err) {
        next(err);
    }
};

async function applySubscriptionAction(action) {
	if (!action || !action.action) return;
	switch (action.action) {
        case 'apply_promotion': {
            const session = action.payload;
            const jobId = session?.metadata?.jobId;
            const tier = session?.metadata?.tier;
            const durationDays = Number(session?.metadata?.durationDays || 7);
            if (!jobId || !tier) return;
            const Job = (await import('../models/Job.js')).default;
            const job = await Job.findById(jobId);
            if (!job) return;
            const now = new Date();
            const additional = durationDays * 24 * 60 * 60 * 1000;
            const extend = (currentUntil) => {
                const base = currentUntil && currentUntil > now ? currentUntil : now;
                return new Date(base.getTime() + additional);
            };
            switch (tier) {
                case 'feature':
                    job.promotion.featured = true;
                    job.promotion.featuredUntil = extend(job.promotion.featuredUntil);
                    break;
                case 'urgent':
                    job.promotion.urgent = true;
                    job.promotion.urgentUntil = extend(job.promotion.urgentUntil);
                    break;
                case 'highlight':
                    job.promotion.highlighted = true;
                    job.promotion.highlightedUntil = extend(job.promotion.highlightedUntil);
                    break;
                case 'boost':
                    job.promotion.boosted = true;
                    job.promotion.boostedUntil = extend(job.promotion.boostedUntil);
                    break;
                default:
                    return;
            }
            await job.save();
            break;
        }
		case 'activate_subscription': {
			const session = action.payload;
			if (!session?.customer) return;
			const sub = await Subscription.findOne({ stripeCustomerId: session.customer });
			if (!sub) return;
			sub.status = 'active';
			sub.currentPeriodStart = new Date();
			// currentPeriodEnd is set by subsequent invoice webhook typically; leave as is if unknown
			sub.history.push({ event: 'activated_from_checkout', metadata: { sessionId: session.id } });
			await sub.save();
			break;
		}
		case 'mark_past_due': {
			const invoice = action.payload;
			if (!invoice?.customer) return;
			const sub = await Subscription.findOne({ stripeCustomerId: invoice.customer });
			if (!sub) return;
			sub.status = 'past_due';
			sub.history.push({ event: 'payment_failed', metadata: { invoiceId: invoice.id } });
			await sub.save();
			break;
		}
		case 'cancel_subscription': {
			const stripeSub = action.payload;
			const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
			if (!sub) return;
			sub.status = 'canceled';
			sub.cancelAtPeriodEnd = false;
			sub.currentPeriodEnd = new Date();
			sub.history.push({ event: 'canceled' });
			await sub.save();
			break;
		}
		case 'update_subscription': {
			const stripeSub = action.payload;
			const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
			if (!sub) return;
			// Basic status sync; additional fields can be mapped here
			sub.status = stripeSub.status === 'active' ? 'active' : (stripeSub.status === 'trialing' ? 'trialing' : sub.status);
			await sub.save();
			break;
		}
		default:
			break;
	}
}

export const cancelAtPeriodEnd = async (req, res, next) => {
	try {
		const sub = await Subscription.findOne({ user: req.user.id });
		if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
		sub.cancelAtPeriodEnd = true;
		sub.history.push({ event: 'cancel_at_period_end' });
		await sub.save();
		res.status(200).json({ success: true, data: sub });
	} catch (err) {
		next(err);
	}
};

export const resumeAutoRenew = async (req, res, next) => {
	try {
		const sub = await Subscription.findOne({ user: req.user.id });
		if (!sub) return res.status(404).json({ success: false, message: 'Subscription not found' });
		sub.cancelAtPeriodEnd = false;
		sub.history.push({ event: 'resume_auto_renew' });
		await sub.save();
		res.status(200).json({ success: true, data: sub });
	} catch (err) {
		next(err);
	}
};

export const getUsage = async (req, res, next) => {
	try {
		const sub = await Subscription.findOne({ user: req.user.id });
		if (!sub) return res.status(200).json({ success: true, data: { usage: {}, limits: {}, plan: PLAN_IDS.FREE } });
		const plan = getPlanDefinition(sub.plan);
		const limits = {
			jobViewsPerDay: getFeatureLimit(sub.plan, 'jobViewsPerDay'),
			applicationsPerDay: getFeatureLimit(sub.plan, 'applicationsPerDay')
		};
		const usage = {
			jobViewsToday: sub.getDailyUsage('jobViews'),
			applicationsToday: sub.getDailyUsage('applications')
		};
		res.status(200).json({ success: true, data: { plan: sub.plan, status: sub.status, limits, usage } });
	} catch (err) {
		next(err);
	}
};

export const portal = async (req, res, next) => {
    try {
        const sub = await Subscription.findOne({ user: req.user.id });
        const customerId = sub?.stripeCustomerId || req.body.stripeCustomerId;
        if (!customerId) return res.status(400).json({ success: false, message: 'Stripe customer not found' });
        const session = await createCustomerPortalSession({ customerId, returnUrl: req.body.returnUrl });
        res.status(200).json({ success: true, data: { url: session.url } });
    } catch (err) {
        next(err);
    }
};


