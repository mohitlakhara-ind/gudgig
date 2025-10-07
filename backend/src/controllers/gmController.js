import { validationResult } from 'express-validator';
import Job from '../models/Job.js';
import Bid from '../models/Bid.js';
import AdminSettings from '../models/AdminSettings.js';
import { createPaymentIntent, confirmPaymentIntent } from '../services/gmPaymentService.js';
import notificationService from '../services/notificationService.js';

// Helpers
const GM_CATEGORIES = [
  'website development',
  'graphic design',
  'content writing',
  'social media management',
  'SEO',
  'app development',
  'game development'
];

function validateCategoryOrThrow(category) {
  if (!GM_CATEGORIES.includes(String(category).trim())) {
    const err = new Error('Category must be one of the Gigs Mint categories');
    err.statusCode = 400;
    throw err;
  }
}
async function getOrCreateConfig() {
  let config = await AdminSettings.findOne({ key: 'gm-config' });
  if (!config) {
    config = await AdminSettings.create({ key: 'gm-config', bidFeeOptions: [1, 5, 10, 20], currentBidFee: 1 });
  }
  return config;
}

// 1) Admin: Post job
export const adminCreateJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { title, category, description, requirements } = req.body;

    // Enforce category validation
    validateCategoryOrThrow(category);

    const job = await Job.create({
      title,
      category,
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      createdBy: req.user._id
    });

    // Notify poster about job posted
    try {
      await notificationService.sendNotification(
        req.user._id,
        'jobPostedConfirmation',
        {
          jobTitle: job.title,
          jobId: job._id.toString(),
          postedDate: new Date().toISOString()
        },
        ['email', 'inApp']
      );
    } catch (notifyErr) {
      // Non-blocking
      console.warn('[notifications] job post notify failed:', notifyErr?.message || notifyErr);
    }

    return res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// 2) User: List jobs with optional category filter
export const listJobs = async (req, res, next) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Job.countDocuments(filter)
    ]);

    // Fetch bids count per job in one aggregation to avoid N+1
    const jobIds = jobs.map(j => j._id);
    const bidCountsAgg = await Bid.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ]);
    const jobIdToCount = new Map(bidCountsAgg.map(r => [String(r._id), r.count]));

    const data = jobs.map(j => ({
      _id: j._id,
      title: j.title,
      description: j.description,
      requirements: j.requirements,
      createdAt: j.createdAt,
      category: j.category,
      bidsCount: jobIdToCount.get(String(j._id)) || 0
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      data
    });
  } catch (err) {
    next(err);
  }
};

// 3 + 4) Submit bid with payment enforcement
export const submitBid = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { jobId, quotation, proposal, bidFeePaid } = req.body;
    const config = await getOrCreateConfig();

    // Validate bidAmountPaid equals active fee
    if (Number(bidFeePaid) !== Number(config.currentBidFee)) {
      return res.status(400).json({ success: false, message: `Bid amount must equal active fee ₹${config.currentBidFee}` });
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    // Payment flow (mock)
    const intent = await createPaymentIntent({
      amountInPaise: Math.round(Number(bidFeePaid) * 100),
      currency: 'INR',
      metadata: { userId: req.user._id.toString(), jobId: job._id.toString() }
    });

    const confirmation = await confirmPaymentIntent(intent.id);
    if (confirmation.status !== 'succeeded') {
      return res.status(402).json({ success: false, message: 'Payment failed. Bid not submitted.' });
    }

    // Store bid on success
    const bid = await Bid.create({
      jobId: job._id,
      userId: req.user._id,
      quotation: quotation || '',
      proposal: proposal || '',
      bidFeePaid: Number(bidFeePaid),
      paymentStatus: 'succeeded'
    });

    // Fire notifications (non-blocking)
    (async () => {
      try {
        const totalUserBids = await Bid.countDocuments({ userId: req.user._id });
        const isMilestone = [1, 5, 10, 20, 50, 100].includes(totalUserBids);
        // Notify bidder confirmation
        await notificationService.sendNotification(
          req.user._id,
          'jobApplicationReceived',
          {
            applicantName: req.user.name || 'You',
            jobTitle: job.title,
            companyName: 'MicroJobs',
            applicationId: bid._id.toString()
          },
          ['email', 'inApp']
        );
        if (isMilestone) {
          await notificationService.createNotification(
            req.user._id,
            'milestone',
            'Milestone achieved 🎉',
            `You have submitted ${totalUserBids} bids. Keep going!`,
            { milestone: totalUserBids }
          );
        }

        // Notify employer about new bid (if creator exists)
        if (job.createdBy) {
          await notificationService.sendNotification(
            job.createdBy,
            'jobApplicationReceived',
            {
              applicantName: req.user.name || 'Freelancer',
              jobTitle: job.title,
              companyName: 'MicroJobs',
              applicationId: bid._id.toString()
            },
            ['inApp']
          );
        }
      } catch (notifyErr) {
        console.warn('[notifications] bid submit notify failed:', notifyErr?.message || notifyErr);
      }
    })();

    return res.status(201).json({ success: true, data: bid });
  } catch (err) {
    // Handle duplicate bid (unique jobId+userId)
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already placed a bid on this job.' });
    }
    next(err);
  }
};

// 4) Admin: set/list bid fees
export const setBidFees = async (req, res, next) => {
  try {
    const { fees, active } = req.body;
    if (!Array.isArray(fees) || fees.some(f => typeof f !== 'number' || f <= 0)) {
      return res.status(400).json({ success: false, message: 'Fees must be a positive number array' });
    }
    if (active !== undefined && !fees.includes(active)) {
      return res.status(400).json({ success: false, message: 'Active fee must be one of the provided fees' });
    }

    const config = await getOrCreateConfig();
    config.bidFeeOptions = fees;
    if (active !== undefined) config.currentBidFee = active;
    await config.save();
    return res.status(200).json({ success: true, data: { bidFeeOptions: config.bidFeeOptions, currentBidFee: config.currentBidFee } });
  } catch (err) {
    next(err);
  }
};

export const getBidFees = async (req, res, next) => {
  try {
    const config = await getOrCreateConfig();
    return res.status(200).json({ success: true, data: { bidFeeOptions: config.bidFeeOptions, currentBidFee: config.currentBidFee } });
  } catch (err) {
    next(err);
  }
};

// 5) Admin dashboard: all bids per project
export const getBidsForJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    const bids = await Bid.find({ jobId }).populate('userId', 'name email');
    const data = bids.map(b => ({
      freelancerId: b.userId?._id || b.userId,
      quotation: b.quotation,
      proposal: b.proposal,
      paidAmount: b.bidFeePaid,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
      freelancer: b.userId && typeof b.userId === 'object' ? { _id: b.userId._id, name: b.userId.name, email: b.userId.email } : undefined
    }));
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// Public: Get single job details
export const getJobById = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// Admin: Update job
export const updateJob = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: 'Validation errors', errors: errors.array() });
    }

    const { jobId } = req.params;
    const updates = {};
    const allowed = ['title', 'category', 'description', 'requirements'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.category) {
      validateCategoryOrThrow(updates.category);
    }

    const job = await Job.findByIdAndUpdate(jobId, updates, { new: true });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete job
export const deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    await Bid.deleteMany({ jobId: job._id });
    await job.deleteOne();
    return res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};

// Freelancer: Get my bids
export const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('jobId', 'title category createdAt');
    const data = bids.map(b => ({
      _id: b._id,
      job: b.jobId && typeof b.jobId === 'object' ? { _id: b.jobId._id, title: b.jobId.title, category: b.jobId.category, createdAt: b.jobId.createdAt } : { _id: b.jobId },
      quotation: b.quotation,
      proposal: b.proposal,
      bidFeePaid: b.bidFeePaid,
      paymentStatus: b.paymentStatus,
      selectionStatus: b.selectionStatus,
      createdAt: b.createdAt
    }));
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// Admin: Dashboard statistics
export const getAdminStats = async (req, res, next) => {
  try {
    const [totalJobs, totalBids, revenueAgg, jobsByCategoryAgg, recentBids] = await Promise.all([
      Job.countDocuments({}),
      Bid.countDocuments({}),
      Bid.aggregate([
        { $match: { paymentStatus: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$bidFeePaid' } } }
      ]),
      Job.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Bid.find({}).sort({ createdAt: -1 }).limit(10).populate('userId', 'name email').populate('jobId', 'title category')
    ]);

    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
    const jobsByCategory = jobsByCategoryAgg.map(r => ({ category: r._id, count: r.count }));
    const recent = recentBids.map(b => ({
      _id: b._id,
      job: b.jobId && typeof b.jobId === 'object' ? { _id: b.jobId._id, title: b.jobId.title, category: b.jobId.category } : { _id: b.jobId },
      freelancer: b.userId && typeof b.userId === 'object' ? { _id: b.userId._id, name: b.userId.name, email: b.userId.email } : { _id: b.userId },
      bidFeePaid: b.bidFeePaid,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalJobs,
        totalBids,
        totalRevenue: revenue,
        jobsByCategory,
        recentBids: recent
      }
    });
  } catch (err) {
    next(err);
  }
};

