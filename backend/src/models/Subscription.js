import mongoose from 'mongoose';
import { PLAN_IDS } from '../config/subscriptionPlans.js';

const subscriptionSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
	plan: { type: String, enum: Object.values(PLAN_IDS), default: PLAN_IDS.FREE },
	status: { type: String, enum: ['inactive', 'trialing', 'active', 'past_due', 'canceled'], default: 'inactive' },
	billingCycle: { type: String, enum: ['monthly', 'quarterly', 'yearly'], default: 'monthly' },
	currentPeriodStart: { type: Date, default: null },
	currentPeriodEnd: { type: Date, default: null },
	trialStart: { type: Date, default: null },
	trialEnd: { type: Date, default: null },
	gracePeriodEnd: { type: Date, default: null },
	cancelAtPeriodEnd: { type: Boolean, default: false },
	autoRenew: { type: Boolean, default: true },

	provider: { type: String, enum: ['stripe', 'razorpay', 'paypal', null], default: 'stripe' },
	stripeCustomerId: { type: String, default: null },
	stripeSubscriptionId: { type: String, default: null },
	paymentMethodLast4: { type: String, default: null },
	paymentMethodBrand: { type: String, default: null },

	usage: {
		jobViews: {
			total: { type: Number, default: 0 },
			daily: [{ date: { type: String }, count: { type: Number, default: 0 } }]
		},
		applications: {
			total: { type: Number, default: 0 },
			daily: [{ date: { type: String }, count: { type: Number, default: 0 } }]
		}
	},

	history: [{
		event: { type: String }, // created, upgraded, downgraded, renewed, canceled, payment_failed
		fromPlan: { type: String },
		toPlan: { type: String },
		metadata: { type: Object },
		at: { type: Date, default: Date.now }
	}],

	invoices: [{
		invoiceId: String,
		amount: Number,
		currency: { type: String, default: 'usd' },
		status: String,
		createdAt: { type: Date, default: Date.now }
	}]
}, {
	timestamps: true
});

subscriptionSchema.methods.isActive = function nowIsActive(referenceDate = new Date()) {
	if (this.status === 'active') return true;
	if (this.status === 'trialing' && this.trialEnd && this.trialEnd > referenceDate) return true;
	if (this.status === 'past_due' && this.gracePeriodEnd && this.gracePeriodEnd > referenceDate) return true;
	return false;
};

subscriptionSchema.methods.incrementDailyUsage = function incrementDailyUsage(featureKey, referenceDate = new Date()) {
	const dayKey = referenceDate.toISOString().slice(0, 10);
	const featureUsage = this.usage[featureKey];
	if (!featureUsage) return;
	featureUsage.total += 1;
	let dailyRecord = featureUsage.daily.find(r => r.date === dayKey);
	if (!dailyRecord) {
		dailyRecord = { date: dayKey, count: 0 };
		featureUsage.daily.push(dailyRecord);
	}
	dailyRecord.count += 1;
};

subscriptionSchema.methods.getDailyUsage = function getDailyUsage(featureKey, referenceDate = new Date()) {
	const dayKey = referenceDate.toISOString().slice(0, 10);
	const featureUsage = this.usage[featureKey];
	if (!featureUsage) return 0;
	const dailyRecord = featureUsage.daily.find(r => r.date === dayKey);
	return dailyRecord ? dailyRecord.count : 0;
};

export default mongoose.model('Subscription', subscriptionSchema);


