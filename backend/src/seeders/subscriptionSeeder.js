import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';

dotenv.config();

async function seed() {
	await mongoose.connect(process.env.MONGO_URI);
	const users = await User.find().limit(3);
	if (users.length === 0) {
		console.log('No users found to seed subscriptions');
		process.exit(0);
	}

	const [u1, u2, u3] = users;
	await Subscription.deleteMany({ user: { $in: users.map(u => u._id) } });

	await Subscription.create([
		{ user: u1._id, plan: 'free', status: 'inactive' },
		{ user: u2._id, plan: 'pro', status: 'active', billingCycle: 'monthly', currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 30*24*60*60*1000) },
		{ user: u3._id, plan: 'enterprise', status: 'trialing', billingCycle: 'monthly', trialStart: new Date(), trialEnd: new Date(Date.now() + 14*24*60*60*1000) }
	]);

	console.log('Seeded subscriptions for 3 users');
	process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });


