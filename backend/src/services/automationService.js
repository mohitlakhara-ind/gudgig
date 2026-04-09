// automationService.js
import User from '../models/User.js';
import Bid from '../models/Bid.js';
import Notification from '../models/Notification.js';
import notificationService from './notificationService.js';
import Gig from '../models/Gig.js';


const DAYS = 24 * 60 * 60 * 1000;

class AutomationService {
  async runDaily() {
    await Promise.all([
      this.nudgeIncompleteProfiles(),
      this.nudgeNoRecentBids(),
      this.celebrateMilestones(),
    ]);
  }

  async nudgeIncompleteProfiles() {
    const users = await User.find({}).select('name notificationPreferences profileProgress updatedAt');
    const results = [];
    for (const u of users) {
      const progress = (u.profileProgress && typeof u.profileProgress === 'number') ? u.profileProgress : 0;
      if (progress < 60) {
        const recentlyNotified = await Notification.findOne({ user: u._id, type: 'profile_nudge', createdAt: { $gte: new Date(Date.now() - 7 * DAYS) } });
        if (recentlyNotified) continue;
        await notificationService.createNotification(
          u._id,
          'profile_nudge',
          'Complete your profile',
          `Your profile is ${progress}% complete. Add more details to get better matches!`,
          { progress }
        );
        results.push(u._id);
      }
    }
    return results.length;
  }

  async nudgeNoRecentBids() {
    const since = new Date(Date.now() - 14 * DAYS);
    const activeUsers = await User.find({ role: 'freelancer' }).select('_id name');
    let count = 0;
    for (const u of activeUsers) {
      const recentBid = await Bid.findOne({ userId: u._id, createdAt: { $gte: since } }).select('_id');
      if (!recentBid) {
        const dup = await Notification.findOne({ user: u._id, type: 'bid_nudge', createdAt: { $gte: new Date(Date.now() - 7 * DAYS) } });
        if (dup) continue;
        await notificationService.createNotification(
          u._id,
          'bid_nudge',
          'Find new gigs today',
          'You have not applied to any gigs recently. Explore new listings and apply to increase your chances.',
          { windowDays: 14 }
        );
        count++;
      }
    }
    return count;
  }

  async celebrateMilestones() {
    const users = await User.find({ role: 'freelancer' }).select('_id name stats');
    let count = 0;
    for (const u of users) {
      const totalBids = await Bid.countDocuments({ userId: u._id });
      const milestones = [1, 5, 10, 20, 50, 100];
      const hit = milestones.find(m => totalBids === m);
      if (hit) {
        const dup = await Notification.findOne({ user: u._id, type: 'milestone', 'data.milestone': hit }).select('_id');
        if (dup) continue;
        await notificationService.createNotification(
          u._id,
          'milestone',
          'Milestone achieved 🎉',
          `You have submitted ${hit} bids. Keep going!`,
          { milestone: hit }
        );
        count++;
      }
    }
    return count;
  }

  // Notify freelancers who match category/skills or have saved searches
  async onNewGigPosted(gig) {
    try {
      // Find paid freelancers who have opted in for job alerts in this category
      const candidates = await User.find({ role: 'freelancer', verifiedByPayment: true, 'preferences.jobAlerts': { $in: [gig.category] } }).select('_id notificationPreferences');

      const notificationPayload = {
        jobTitle: gig.title,
        gigId: gig._id.toString(),
        category: gig.category,
        postedDate: gig.createdAt ? gig.createdAt.toISOString() : new Date().toISOString()
      };

      for (const c of candidates) {
        try {
          await notificationService.queueNotification(
            c._id,
            'newGigPosted',
            notificationPayload,
            ['inApp', 'email']
          );
        } catch (e) {
          console.warn('[automation] failed to queue newGigPosted for', c._id, e?.message || e);
        }
      }
      return candidates.length;
    } catch (err) {
      console.error('[automation] onNewGigPosted error', err?.message || err);
      return 0;
    }
  }

  // Notify poster and buyer when a gig is unlocked (guest purchase or bid created)
  async onGigUnlocked(gigId, buyerId) {
    try {
      const gig = await Gig.findById(gigId).select('title createdBy');
      if (!gig) return 0;

      // Notify buyer (confirmation)
      try {
        await notificationService.queueNotification(
          buyerId,
          'gigUnlocked',
          { gigId: gig._id.toString(), jobTitle: gig.title },
          ['email', 'inApp']
        );
      } catch (e) { console.warn('[automation] queue buyer gigUnlocked failed', e?.message || e); }

      // Notify gig creator that their contact was unlocked
      try {
        await notificationService.queueNotification(
          gig.createdBy,
          'contactUnlocked',
          { gigId: gig._id.toString(), jobTitle: gig.title, buyerId: String(buyerId) },
          ['inApp', 'email']
        );
      } catch (e) { console.warn('[automation] queue creator contactUnlocked failed', e?.message || e); }

      return 1;
    } catch (err) {
      console.error('[automation] onGigUnlocked error', err?.message || err);
      return 0;
    }
  }

  async onGigUpdated(gig) {
    try {
      // Notify followers/savers of this gig about the update
      const savers = await User.find({ 'savedGigs': gig._id }).select('_id');
      for (const s of savers) {
        try {
          await notificationService.queueNotification(s._id, 'gigUpdated', { gigId: gig._id.toString(), jobTitle: gig.title }, ['inApp']);
        } catch (e) {}
      }
      return savers.length;
    } catch (err) {
      console.error('[automation] onGigUpdated error', err?.message || err);
      return 0;
    }
  }

  async onGigVisibilityChanged(gig, hidden) {
    try {
      // Notify creator that their gig was hidden/unhidden
      await notificationService.queueNotification(gig.createdBy, hidden ? 'gigHidden' : 'gigUnhidden', { gigId: gig._id.toString(), jobTitle: gig.title }, ['inApp', 'email']);
      return 1;
    } catch (err) {
      console.error('[automation] onGigVisibilityChanged error', err?.message || err);
      return 0;
    }
  }
}

export default new AutomationService();
