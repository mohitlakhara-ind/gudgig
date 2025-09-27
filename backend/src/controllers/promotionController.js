import { createSubscriptionCheckoutSession } from '../services/paymentService.js';
import Subscription from '../models/Subscription.js';
import Job from '../models/Job.js';

export const createPromotionCheckout = async (req, res, next) => {
	try {
		const { jobId, tier, durationDays = 7 } = req.body;
		if (!jobId || !tier) return res.status(400).json({ success: false, message: 'jobId and tier are required' });

		const job = await Job.findById(jobId);
		if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
		if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Not authorized to promote this job' });
		}

		// Map tiers to Stripe prices (placeholder IDs)
		const priceMap = {
			feature: process.env.STRIPE_PRICE_FEATURE || 'price_feature',
			urgent: process.env.STRIPE_PRICE_URGENT || 'price_urgent',
			highlight: process.env.STRIPE_PRICE_HIGHLIGHT || 'price_highlight',
			boost: process.env.STRIPE_PRICE_BOOST || 'price_boost'
		};
		const priceId = priceMap[tier];
		if (!priceId) return res.status(400).json({ success: false, message: 'Invalid promotion tier' });

		// Use same Stripe customer source as subscriptions
		const sub = await Subscription.findOne({ user: req.user.id });
		const customerId = sub?.stripeCustomerId || null;
		if (!customerId) return res.status(400).json({ success: false, message: 'Stripe customer not configured' });

		const session = await createSubscriptionCheckoutSession({
			customerId,
			priceId,
			successUrl: `${process.env.APP_URL || 'http://localhost:3000'}/employer/jobs`,
			cancelUrl: `${process.env.APP_URL || 'http://localhost:3000'}/employer/jobs`,
			mode: 'payment',
			metadata: {
				context: 'job_promotion',
				jobId: String(job._id),
				tier,
				durationDays: String(durationDays)
			}
		});

		return res.status(200).json({ success: true, data: { id: session.id, url: session.url } });
	} catch (err) {
		next(err);
	}
};

export const applyPromotion = async (req, res, next) => {
	try {
		const { jobId, tier, durationDays = 7 } = req.body;
		if (!jobId || !tier) return res.status(400).json({ success: false, message: 'jobId and tier are required' });

		const job = await Job.findById(jobId);
		if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
		if (job.employer.toString() !== req.user.id && req.user.role !== 'admin') {
			return res.status(403).json({ success: false, message: 'Not authorized to modify this job' });
		}

		const now = new Date();
		const until = new Date(now.getTime() + Number(durationDays) * 24 * 60 * 60 * 1000);

		switch (tier) {
			case 'feature':
				job.promotion.featured = true;
				job.promotion.featuredUntil = until;
				break;
			case 'urgent':
				job.promotion.urgent = true;
				job.promotion.urgentUntil = until;
				break;
			case 'highlight':
				job.promotion.highlighted = true;
				job.promotion.highlightedUntil = until;
				break;
			case 'boost':
				job.promotion.boosted = true;
				job.promotion.boostedUntil = until;
				break;
			default:
				return res.status(400).json({ success: false, message: 'Invalid promotion tier' });
		}

		await job.save();
		return res.status(200).json({ success: true, message: 'Promotion applied', data: job.promotion });
	} catch (err) {
		next(err);
	}
};

export const getPromotionAnalytics = async (req, res, next) => {
    try {
        const { jobId } = req.query;
        const match = jobId ? { _id: jobId } : (req.user.role === 'admin' ? {} : { employer: req.user._id });
        const jobs = await Job.find(match).select('title promotion views applications createdAt');
        const data = jobs.map(j => ({
            jobId: j._id,
            title: j.title,
            promotion: j.promotion,
            views: j.views || 0,
            applications: j.applications || 0,
            createdAt: j.createdAt
        }));
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
};


