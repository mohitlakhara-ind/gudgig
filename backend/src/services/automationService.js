// automationService.js
import User from '../models/User.js';
import Bid from '../models/Bid.js';
import Notification from '../models/Notification.js';
import notificationService from './notificationService.js';

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
}

export default new AutomationService();
