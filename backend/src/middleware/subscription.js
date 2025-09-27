import Subscription from '../models/Subscription.js';
import { getPlanDefinition, getFeatureLimit, isUnlimited } from '../config/subscriptionPlans.js';

async function loadUserSubscription(userId) {
	if (!userId) return null;
	return await Subscription.findOne({ user: userId });
}

export async function requireActiveSubscription(req, res, next) {
	try {
		const userId = req.user?.id || req.user?._id;
		const subscription = await loadUserSubscription(userId);
		if (!subscription || !subscription.isActive()) {
			return res.status(402).json({
				error: 'subscription_required',
				message: 'An active subscription is required to access this resource.',
				recommendation: 'upgrade',
				plan: subscription?.plan || 'free'
			});
		}
		req.subscription = subscription;
		next();
	} catch (error) {
		next(error);
	}
}

export async function attachSubscription(req, _res, next) {
	try {
		const userId = req.user?.id || req.user?._id;
		req.subscription = await loadUserSubscription(userId);
		next();
	} catch (error) {
		next(error);
	}
}

export function checkJobViewAccess() {
	return async function jobViewGate(req, res, next) {
		try {
			const subscription = req.subscription || (req.user ? await loadUserSubscription(req.user.id || req.user._id) : null);
			const planId = subscription?.plan || 'free';
			const plan = getPlanDefinition(planId);
			const limit = getFeatureLimit(planId, 'jobViewsPerDay');
			const todayCount = subscription?.getDailyUsage('jobViews') || 0;
			const hasFullAccess = plan.features.fullJobDescription === true && subscription?.isActive();

			// Set remaining headers
			const remaining = isUnlimited(planId, 'jobViewsPerDay') ? -1 : Math.max(0, (limit || 0) - todayCount);
			res.setHeader('X-Remaining-Job-Views', String(remaining));
			if (!isUnlimited(planId, 'jobViewsPerDay') && todayCount >= limit) {
				return res.status(429).json({
					error: 'job_view_limit_reached',
					message: 'Daily job view limit reached for your plan.',
					remaining: 0,
					plan: planId,
					upgradeSuggested: true
				});
			}

			req.subscription = subscription;
			req.subscriptionPlan = plan;
			req.subscriptionHasFullJobAccess = !!hasFullAccess;
			next();
		} catch (error) {
			next(error);
		}
	};
}

export function checkApplicationAccess() {
	return async function applicationGate(req, res, next) {
		try {
			const subscription = req.subscription || (req.user ? await loadUserSubscription(req.user.id || req.user._id) : null);
			const planId = subscription?.plan || 'free';
			const limit = getFeatureLimit(planId, 'applicationsPerDay');
			const todayCount = subscription?.getDailyUsage('applications') || 0;
			const allowed = isUnlimited(planId, 'applicationsPerDay') || (subscription?.isActive() && todayCount < limit);

			// Set remaining headers
			const remaining = isUnlimited(planId, 'applicationsPerDay') ? -1 : Math.max(0, (limit || 0) - todayCount);
			res.setHeader('X-Remaining-Applications', String(remaining));
			if (!allowed) {
				return res.status(429).json({
					error: 'application_limit_reached',
					message: 'Daily application limit reached for your plan.',
					remaining,
					plan: planId,
					recommendation: 'upgrade'
				});
			}

			req.subscription = subscription;
			next();
		} catch (error) {
			next(error);
		}
	};
}

export async function trackJobViewUsage(req, res, next) {
    try {
        // Increment only after response is sent and only for successful responses
        res.on('finish', async () => {
            try {
                if (res.statusCode >= 200 && res.statusCode < 300 && req.subscription) {
                    req.subscription.incrementDailyUsage('jobViews');
                    await req.subscription.save();
                    const planId = req.subscription.plan || 'free';
                    const limit = getFeatureLimit(planId, 'jobViewsPerDay');
                    const todayCount = req.subscription.getDailyUsage('jobViews') || 0;
                    const remaining = isUnlimited(planId, 'jobViewsPerDay') ? -1 : Math.max(0, (limit || 0) - todayCount);
                    res.setHeader('X-Remaining-Job-Views', String(remaining));
                }
            } catch (_err) {}
        });
        next();
    } catch (error) {
        next(error);
    }
}

export async function trackApplicationUsage(req, res, next) {
    try {
        // Backward-compatible: track on success only
        res.on('finish', async () => {
            try {
                if (res.statusCode >= 200 && res.statusCode < 300 && req.subscription) {
                    req.subscription.incrementDailyUsage('applications');
                    await req.subscription.save();
                    const planId = req.subscription.plan || 'free';
                    const limit = getFeatureLimit(planId, 'applicationsPerDay');
                    const todayCount = req.subscription.getDailyUsage('applications') || 0;
                    const remaining = isUnlimited(planId, 'applicationsPerDay') ? -1 : Math.max(0, (limit || 0) - todayCount);
                    res.setHeader('X-Remaining-Applications', String(remaining));
                }
            } catch (_err) {}
        });
        next();
    } catch (error) {
        next(error);
    }
}

// Alias with explicit success semantics for clarity in routes
export const trackApplicationUsageSuccess = trackApplicationUsage;


