// subscriptionCron.js
import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import { getPlanDefinition } from '../config/subscriptionPlans.js';
import NotificationService from '../services/notificationService.js';
import Job from '../models/Job.js';

let scheduled = null;

async function checkSubscriptions() {
  const now = new Date();
  try {
    // Activate grace periods for past_due
    const pastDue = await Subscription.find({ status: 'past_due' });
    for (const sub of pastDue) {
      const plan = getPlanDefinition(sub.plan);
      if (!sub.gracePeriodEnd && plan.graceDays > 0) {
        sub.gracePeriodEnd = new Date(now.getTime() + plan.graceDays * 24 * 60 * 60 * 1000);
        await sub.save();
      }
    }

    // Expire trialing
    const trialing = await Subscription.find({ status: 'trialing', trialEnd: { $lte: now } });
    for (const sub of trialing) {
      sub.status = 'inactive';
      await sub.save();
    }

    // Cancel expired (no currentPeriodEnd or passed)
    const expired = await Subscription.find({ currentPeriodEnd: { $lte: now }, autoRenew: false, status: { $in: ['active', 'past_due'] } });
    for (const sub of expired) {
      sub.status = 'canceled';
      await sub.save();
    }

    // Send renewal reminders 3 days before
    const threeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const renewals = await Subscription.find({ currentPeriodEnd: { $gte: now, $lte: threeDays }, status: 'active' });
    for (const sub of renewals) {
      try {
        await NotificationService.queueNotification(
          sub.user,
          'subscriptionRenewalReminder',
          { renewalDate: sub.currentPeriodEnd?.toLocaleDateString?.() || '' },
          ['email']
        );
      } catch {}
    }

    // Payment failure notifications for past_due without grace or beyond grace
    const failures = await Subscription.find({ status: 'past_due' });
    for (const sub of failures) {
      try {
        if (!sub.lastPaymentFailedNotifiedAt || (now - sub.lastPaymentFailedNotifiedAt) > 24 * 60 * 60 * 1000) {
          await NotificationService.queueNotification(
            sub.user,
            'subscriptionPaymentFailed',
            { reason: 'Payment failed or required action.' },
            ['email']
          );
          sub.lastPaymentFailedNotifiedAt = now;
          await sub.save();
        }
      } catch {}
    }

    // Promotion expiry handling for jobs
    const jobs = await Job.find({
      $or: [
        { 'promotion.featured': true },
        { 'promotion.urgent': true },
        { 'promotion.highlighted': true },
        { 'promotion.boosted': true }
      ]
    }).select('promotion');

    for (const job of jobs) {
      let changed = false;
      if (job.promotion?.featured && job.promotion.featuredUntil && job.promotion.featuredUntil <= now) {
        job.promotion.featured = false; changed = true;
      }
      if (job.promotion?.urgent && job.promotion.urgentUntil && job.promotion.urgentUntil <= now) {
        job.promotion.urgent = false; changed = true;
      }
      if (job.promotion?.highlighted && job.promotion.highlightedUntil && job.promotion.highlightedUntil <= now) {
        job.promotion.highlighted = false; changed = true;
      }
      if (job.promotion?.boosted && job.promotion.boostedUntil && job.promotion.boostedUntil <= now) {
        job.promotion.boosted = false; changed = true;
      }
      if (changed) await job.save();
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[SubscriptionCron] Error:', err);
  }
}

export function startSubscriptionCron() {
  if (scheduled) return scheduled;
  // Run every day at 02:15
  scheduled = cron.schedule('15 2 * * *', () => {
    checkSubscriptions();
  });
  scheduled.start();
  return scheduled;
}

export function stopSubscriptionCron() {
  if (scheduled) {
    scheduled.stop();
    scheduled = null;
  }
}
