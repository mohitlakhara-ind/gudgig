import { validationResult } from 'express-validator';
import Job from '../models/Job.js';
import Bid from '../models/Bid.js';
import AdminSettings from '../models/AdminSettings.js';
import { createPaymentIntent, confirmPaymentIntent } from '../services/gmPaymentService.js';

// Helpers
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

    const job = await Job.create({
      title,
      category,
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      createdBy: req.user._id
    });

    return res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// 2) User: List jobs with enhanced filters
export const listJobs = async (req, res, next) => {
  try {
    const {
      category,
      location,
      search,
      minBudget,
      maxBudget,
      skills,
      experienceLevel,
      jobType,
      remote,
      sortBy = 'recent',
      page = 1,
      limit = 12
    } = req.query;

    const filter = { status: 'active' };
    if (category && category !== 'all') filter.category = category;
    if (location) filter.location = new RegExp(location, 'i');
    if (experienceLevel && experienceLevel !== 'all') filter.experienceLevel = experienceLevel;
    if (jobType && jobType !== 'all') filter.jobType = jobType;
    if (remote !== undefined) filter.remote = remote === 'true';

    // Budget filter
    if (minBudget || maxBudget) {
      filter.$or = [];
      if (minBudget && maxBudget) {
        filter.$or.push({
          budget: { $gte: parseInt(minBudget), $lte: parseInt(maxBudget) }
        });
      } else if (minBudget) {
        filter.$or.push({ budget: { $gte: parseInt(minBudget) } });
      } else if (maxBudget) {
        filter.$or.push({ budget: { $lte: parseInt(maxBudget) } });
      }
    }

    // Skills filter
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      filter.requirements = { $in: skillsArray };
    }

    // Search query
    if (search) {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { title: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { requirements: { $in: [new RegExp(search, 'i')] } }
      );
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    switch (sortBy) {
      case 'budget-high':
        sortOptions = { budget: -1 };
        break;
      case 'budget-low':
        sortOptions = { budget: 1 };
        break;
      case 'bids':
        sortOptions = { bidsCount: -1 };
        break;
      case 'views':
        sortOptions = { viewsCount: -1 };
        break;
      case 'recent':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const jobs = await Job.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

    const total = await Job.countDocuments(filter);

    const data = jobs.map(j => ({
      _id: j._id,
      title: j.title,
      description: j.description,
      descriptionShort: j.description?.substring(0, 150) + (j.description?.length > 150 ? '...' : ''),
      requirements: j.requirements,
      budget: j.budget,
      category: j.category,
      location: j.location,
      experienceLevel: j.experienceLevel,
      jobType: j.jobType,
      remote: j.remote,
      createdAt: j.createdAt,
      bidsCount: j.bidsCount || 0,
      viewsCount: j.viewsCount || 0,
      status: j.status,
      createdBy: j.createdBy
    }));

    return res.status(200).json({
      success: true,
      count: data.length,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      data
    });
  } catch (err) {
    next(err);
  }
};

// 2b) User/Admin: Get job detail
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
      createdAt: b.createdAt
    }));
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// User: get own bids
export const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: bids.length, data: bids });
  } catch (err) {
    next(err);
  }
};

// Admin: update job
export const updateJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const updates = {};
    const allowed = ['title', 'category', 'description', 'requirements'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    const job = await Job.findByIdAndUpdate(jobId, updates, { new: true, runValidators: true });
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    return res.status(200).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// Admin: delete job
export const deleteJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findByIdAndDelete(jobId);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    return res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};


