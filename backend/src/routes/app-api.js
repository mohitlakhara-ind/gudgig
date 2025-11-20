import express from 'express';
import { protect } from '../middleware/auth.js';
import { getFreelancerStats } from '../controllers/freelancerProfileController.js';
import Bid from '../models/Bid.js';
import Job from '../models/Job.js';
import FreelancerProfile from '../models/FreelancerProfile.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Stats endpoints
router.get('/stats/freelancer', getFreelancerStats);

// Jobseeker stats endpoint - returns basic stats from freelancer stats
router.get('/stats/jobseeker', async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Applications stats from bids
    const [totalApplications, applicationsThisMonth, successfulPayments, pendingPayments, recentApplications] = await Promise.all([
      Bid.countDocuments({ userId }),
      Bid.countDocuments({ userId, createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
      Bid.countDocuments({ userId, paymentStatus: 'succeeded' }),
      Bid.countDocuments({ userId, paymentStatus: 'pending' }),
      Bid.find({ userId }).sort({ createdAt: -1 }).limit(5).select('jobId createdAt')
    ]);
    const recentJobIds = recentApplications.map(b => b.jobId);
    const recentJobs = recentJobIds.length > 0 ? await Job.find({ _id: { $in: recentJobIds } }).select('title company category') : [];
    const recentJobMap = new Map(recentJobs.map(j => [String(j._id), j]));
    
    // Get basic stats that jobseekers need
    // For now, we'll return basic stats that make sense for job seekers
    // These could be enhanced later with actual job application data
    
    // Calculate profile completeness
    const profile = await FreelancerProfile.findOne({ userId });
    let profileCompleteness = 30; // Base for having an account
    
    if (profile) {
      if (profile.title) profileCompleteness += 10;
      if (profile.bio) profileCompleteness += 10;
      if (profile.skills?.length > 0) profileCompleteness += 15;
      if (profile.portfolio?.length > 0) profileCompleteness += 15;
      if (profile.experience?.length > 0) profileCompleteness += 10;
      if (profile.hourlyRate) profileCompleteness += 10;
    }
    
    const jobseekerStats = {
      applications: totalApplications,
      applicationsThisMonth,
      paidApplications: successfulPayments,
      pendingPayments,
      interviews: 0,   // Placeholder: separate interviews system not implemented
      offers: 0,       // Placeholder: offers/hires would come from orders/contracts
      profileCompleteness: Math.min(profileCompleteness, 100),
      recentApplications: recentApplications.map(b => ({
        jobId: b.jobId,
        createdAt: b.createdAt,
        job: recentJobMap.get(String(b.jobId)) || null
      }))
    };
    
    res.status(200).json({
      success: true,
      data: jobseekerStats
    });
  } catch (error) {
    console.error('Error fetching jobseeker stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching jobseeker stats'
    });
  }
});

// Employer stats endpoint (placeholder for now)
router.get('/stats/employer', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      activeJobs: 0,
      totalApplications: 0,
      interviewsScheduled: 0,
      hiresThisMonth: 0,
      viewsThisMonth: 0,
      responseRate: 0
    }
  });
});

// My gigs stats (applications via bids)
router.get('/stats/my-gigs', async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalBids, succeededBids, pendingBidsCount, failedBids, recentBids, spendAgg, pendingAgg, bidsThisMonth, spendThisMonthAgg, averageFeeAgg, byStatusAgg] = await Promise.all([
      Bid.countDocuments({ userId }),
      Bid.countDocuments({ userId, paymentStatus: 'succeeded' }),
      Bid.countDocuments({ userId, paymentStatus: 'pending' }),
      Bid.countDocuments({ userId, paymentStatus: 'failed' }),
      Bid.find({ userId }).sort({ createdAt: -1 }).limit(5).select('jobId createdAt'),
      Bid.aggregate([
        { $match: { userId, paymentStatus: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$bidFeePaid' } } }
      ]),
      Bid.aggregate([
        { $match: { userId, paymentStatus: 'pending' } },
        { $group: { _id: null, total: { $sum: '$bidFeePaid' } } }
      ]),
      Bid.countDocuments({ userId, createdAt: { $gte: monthStart } }),
      Bid.aggregate([
        { $match: { userId, createdAt: { $gte: monthStart }, paymentStatus: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$bidFeePaid' } } }
      ]),
      Bid.aggregate([
        { $match: { userId } },
        { $group: { _id: null, avg: { $avg: '$bidFeePaid' } } }
      ]),
      Bid.aggregate([
        { $match: { userId } },
        { $group: { _id: '$paymentStatus', count: { $sum: 1 }, amount: { $sum: '$bidFeePaid' } } }
      ])
    ]);
    const wonBids = succeededBids; // Treat succeeded payments as accepted submissions
    const jobIds = recentBids.map(b => b.jobId);
    const jobs = jobIds.length > 0 ? await Job.find({ _id: { $in: jobIds } }).select('title company category') : [];
    const jobMap = new Map(jobs.map(j => [String(j._id), j]));
    const distribution = byStatusAgg.reduce((acc, r) => {
      acc[r._id || 'unknown'] = { count: r.count || 0, amount: r.amount || 0 };
      return acc;
    }, {});
    res.status(200).json({
      success: true,
      data: {
        totalBids,
        wonBids,
        pendingBids: pendingBidsCount,
        failedBids,
        totalSpent: (spendAgg && spendAgg[0]?.total) || 0,
        pendingSpend: (pendingAgg && pendingAgg[0]?.total) || 0,
        bidsThisMonth,
        spentThisMonth: (spendThisMonthAgg && spendThisMonthAgg[0]?.total) || 0,
        averageBidFee: Math.round(((averageFeeAgg && averageFeeAgg[0]?.avg) || 0) * 100) / 100,
        distribution,
        recent: recentBids.map(b => ({ jobId: b.jobId, job: jobMap.get(String(b.jobId)) || null, createdAt: b.createdAt }))
      }
    });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load my gigs stats' });
  }
});

// Payments derived from bid fees (user's spend history)
router.get('/payments', async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, limit = 50, from, to } = req.query;
    const query = { userId };
    if (status) query.paymentStatus = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const docs = await Bid.find(query)
      .sort({ createdAt: -1 })
      .limit(Math.min(200, Number(limit) || 50))
      .populate({
        path: 'gigId',
        select: 'title category createdAt budget',
        model: 'Gig'
      });
    const payments = docs.map(b => {
      const gig = b.gigId && typeof b.gigId === 'object'
        ? { _id: b.gigId._id, title: b.gigId.title }
        : b.gigId
          ? { _id: b.gigId, title: 'Gig' }
          : { _id: null, title: 'Gig' };

      return {
        _id: String(b._id),
        amount: Number(b.bidFeePaid) || 0,
        currency: 'INR',
        status: b.paymentStatus === 'succeeded' ? 'success' : b.paymentStatus,
        paymentId: `bid_${b._id}`,
        orderId: `gig_${gig._id || b._id}`,
        method: 'bid_fee',
        description: `Bid fee for ${gig.title || 'Gig'}`,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
        bid: {
          _id: b._id,
          job: gig,
          gig
        }
      };
    });
    // Stats
    const totalSpent = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
    const successfulPayments = payments.filter(p => p.status === 'success').length;
    const failedPayments = payments.filter(p => p.status === 'failed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    res.status(200).json({ success: true, data: payments, stats: { totalSpent, totalPayments: payments.length, successfulPayments, failedPayments, pendingPayments } });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load payments' });
  }
});

// Additional app-api endpoints can be added here
// These endpoints are meant for internal app functionality
// that doesn't fit neatly into other resource-based routes

export default router;
