// Centralized subscription plan definitions used across the application
// Billing cycles: monthly, quarterly, yearly

export const BILLING_CYCLES = {
	MONTHLY: 'monthly',
	QUARTERLY: 'quarterly',
	YEARLY: 'yearly'
};

export const PLAN_IDS = {
	FREE: 'free',
	PRO: 'pro',
	ENTERPRISE: 'enterprise'
};

export const subscriptionPlans = {
	[PLAN_IDS.FREE]: {
		name: 'Free',
		description: 'Basic access with limited job views and applications',
		features: {
			jobViewsPerDay: 5,
			applicationsPerDay: 1,
			fullJobDescription: false,
			premiumFilters: false,
			prioritySupport: false
		},
		pricing: {
			[BILLING_CYCLES.MONTHLY]: { amount: 0, currency: 'usd' },
			[BILLING_CYCLES.QUARTERLY]: { amount: 0, currency: 'usd' },
			[BILLING_CYCLES.YEARLY]: { amount: 0, currency: 'usd' }
		},
		priceIds: {
			[BILLING_CYCLES.MONTHLY]: null,
			[BILLING_CYCLES.QUARTERLY]: null,
			[BILLING_CYCLES.YEARLY]: null
		},
		trialDays: 0,
		graceDays: 0
	},
	[PLAN_IDS.PRO]: {
		name: 'Pro',
		description: 'Unlock full job details with higher daily limits',
		features: {
			jobViewsPerDay: 50,
			applicationsPerDay: 10,
			fullJobDescription: true,
			premiumFilters: true,
			prioritySupport: false
		},
		pricing: {
			[BILLING_CYCLES.MONTHLY]: { amount: 1999, currency: 'usd' }, // $19.99
			[BILLING_CYCLES.QUARTERLY]: { amount: 5499, currency: 'usd' }, // $54.99
			[BILLING_CYCLES.YEARLY]: { amount: 19999, currency: 'usd' } // $199.99
		},
		priceIds: {
			[BILLING_CYCLES.MONTHLY]: process.env.STRIPE_PRICE_PRO_MONTHLY || null,
			[BILLING_CYCLES.QUARTERLY]: process.env.STRIPE_PRICE_PRO_QUARTERLY || null,
			[BILLING_CYCLES.YEARLY]: process.env.STRIPE_PRICE_PRO_YEARLY || null
		},
		trialDays: 7,
		graceDays: 7
	},
	[PLAN_IDS.ENTERPRISE]: {
		name: 'Enterprise',
		description: 'Unlimited access with premium support and features',
		features: {
			jobViewsPerDay: null, // null means unlimited
			applicationsPerDay: null,
			fullJobDescription: true,
			premiumFilters: true,
			prioritySupport: true
		},
		pricing: {
			[BILLING_CYCLES.MONTHLY]: { amount: 7999, currency: 'usd' }, // $79.99
			[BILLING_CYCLES.QUARTERLY]: { amount: 21999, currency: 'usd' }, // $219.99
			[BILLING_CYCLES.YEARLY]: { amount: 79999, currency: 'usd' } // $799.99
		},
		priceIds: {
			[BILLING_CYCLES.MONTHLY]: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || null,
			[BILLING_CYCLES.QUARTERLY]: process.env.STRIPE_PRICE_ENTERPRISE_QUARTERLY || null,
			[BILLING_CYCLES.YEARLY]: process.env.STRIPE_PRICE_ENTERPRISE_YEARLY || null
		},
		trialDays: 14,
		graceDays: 14
	}
};

export function getPlanDefinition(planId) {
	return subscriptionPlans[planId] || subscriptionPlans[PLAN_IDS.FREE];
}

export function getFeatureLimit(planId, featureKey) {
	const plan = getPlanDefinition(planId);
	return plan.features[featureKey];
}

export function isUnlimited(planId, featureKey) {
	const value = getFeatureLimit(planId, featureKey);
	return value === null || value === undefined;
}

export function getStripePriceId(planId, billingCycle) {
	const plan = getPlanDefinition(planId);
	return plan?.priceIds?.[billingCycle] || null;
}


