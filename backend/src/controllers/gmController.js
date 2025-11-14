import { validationResult } from 'express-validator';
import Gig from '../models/Gig.js';
import Bid from '../models/Bid.js';
import User from '../models/User.js';
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

    const { 
      title, 
      category, 
      description, 
      requirements, 
      maxBids,
      contactDetails 
    } = req.body;

    // Enforce category validation
    validateCategoryOrThrow(category);

    const gig = await Gig.create({
      title,
      category,
      description,
      requirements: Array.isArray(requirements) ? requirements : [],
      maxBids,
      createdBy: req.user._id
    });

    // Notify poster about job posted
    try {
      await notificationService.sendNotification(
        req.user._id,
        'jobPostedConfirmation',
        {
          jobTitle: gig.title,
          gigId: gig._id.toString(),
          postedDate: new Date().toISOString()
        },
        ['email', 'inApp']
      );
    } catch (notifyErr) {
      // Non-blocking
      console.warn('[notifications] job post notify failed:', notifyErr?.message || notifyErr);
    }

    return res.status(201).json({ success: true, data: gig });
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
    
    // Filter out hidden gigs for non-admin users
    if (!req.user || req.user.role !== 'admin') {
      filter.isHidden = { $ne: true };
    }

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

    const [jobs, total] = await Promise.all([
      Gig.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Gig.countDocuments(filter)
    ]);

    // Fetch bids count per job in one aggregation to avoid N+1
    const gigIds = jobs.map(j => j._id);
    const bidCountsAgg = await Bid.aggregate([
      { $match: { gigId: { $in: gigIds }, paymentStatus: 'succeeded' } },
      { $group: { _id: '$gigId', count: { $sum: 1 } } }
    ]);
    const gigIdToCount = new Map(bidCountsAgg.map(r => [String(r._id), r.count]));

    const data = jobs.map(j => {
      const fullDesc = String(j.description || '');
      const shortDesc = fullDesc.length > 160 ? `${fullDesc.slice(0, 160)}…` : fullDesc;
      return {
        _id: j._id,
        title: j.title,
        // Backward compatibility
        description: shortDesc,
        // New fields
        descriptionShort: shortDesc,
        descriptionFull: fullDesc,
        requirements: j.requirements,
        createdAt: j.createdAt,
        category: j.category,
        budget: j.budget,
        location: j.location,
        experienceLevel: j.experienceLevel,
        skills: j.skills,
        status: j.status,
        views: j.views,
        tags: j.tags,
        applicationsCount: j.applicationsCount,
        bidsCount: gigIdToCount.get(String(j._id)) || 0
      };
    });

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

    const { gigId, quotation, proposal, bidFeePaid, contactDetails } = req.body;
    const config = await getOrCreateConfig();

    // Validate bidAmountPaid equals active fee
    if (Number(bidFeePaid) !== Number(config.currentBidFee)) {
      return res.status(400).json({ success: false, message: `Bid amount must equal active fee ₹${config.currentBidFee}` });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }

    // Enforce bid limit before attempting payment
    try {
      if (gig.maxBids !== null && typeof gig.maxBids === 'number') {
        const currentSucceededCount = await Bid.countDocuments({ gigId: gig._id, paymentStatus: 'succeeded' });
        if (currentSucceededCount >= gig.maxBids) {
          return res.status(400).json({
            success: false,
            message: 'Bid limit reached for this gig'
          });
        }
      }
    } catch (countErr) {
      // If counting fails, do not accept the bid to be safe
      return res.status(503).json({ success: false, message: 'Temporarily unable to accept bids. Please try again later.' });
    }

    // Validate contact details are provided
    if (!contactDetails || !contactDetails.bidderContact) {
      return res.status(400).json({ 
        success: false, 
        message: 'Contact details are required for bidder' 
      });
    }

    // Validate required contact fields for bidder
    const { bidderContact } = contactDetails;
    if (!bidderContact.email || !bidderContact.phone || !bidderContact.name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bidder contact details (email, phone, name) are required' 
      });
    }

    // Get poster contact details from gig creator
    const gigCreator = await User.findById(gig.createdBy).select('name email phone');
    if (!gigCreator) {
      return res.status(400).json({ 
        success: false, 
        message: 'Gig creator not found' 
      });
    }

    // Format contact details for storage
    const formattedContactDetails = {
      bidderContact: {
        name: bidderContact.name,
        email: bidderContact.email.toLowerCase(),
        phone: bidderContact.phone,
        countryCode: bidderContact.countryCode || 'US',
        company: bidderContact.company || '',
        position: bidderContact.position || ''
      },
      posterContact: {
        name: gigCreator.name,
        email: gigCreator.email.toLowerCase(),
        phone: gigCreator.phone || '',
        countryCode: 'US', // Default for poster
        company: '',
        position: '',
        alternateContact: ''
      }
    };

    // Payment flow (mock)
    const intent = await createPaymentIntent({
      amountInPaise: Math.round(Number(bidFeePaid) * 100),
      currency: 'INR',
      metadata: { userId: req.user._id.toString(), gigId: gig._id.toString() }
    });

    const confirmation = await confirmPaymentIntent(intent.id);
    if (confirmation.status !== 'succeeded') {
      return res.status(402).json({ success: false, message: 'Payment failed. Bid not submitted.' });
    }

    // Store bid on success
    const bid = await Bid.create({
      gigId: gig._id,
      userId: req.user._id,
      quotation: quotation || '',
      proposal: proposal || '',
      bidFeePaid: Number(bidFeePaid),
      paymentStatus: 'succeeded',
      contactDetails: formattedContactDetails
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
            jobTitle: gig.title,
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
        if (gig.createdBy) {
          await notificationService.sendNotification(
            gig.createdBy,
            'jobApplicationReceived',
            {
              applicantName: req.user.name || 'Freelancer',
              jobTitle: gig.title,
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

    // Check if bid count >= maxBids and hide job if needed
    try {
      await checkAndHideIfLimitReached(gig._id);
    } catch (hideErr) {
      console.warn('[submitBid] Failed to check/hide job:', hideErr?.message || hideErr);
    }

    return res.status(201).json({ success: true, data: bid });
  } catch (err) {
    // Handle duplicate bid (unique gigId+userId)
    if (err && err.code === 11000) {
      return res.status(409).json({ success: false, message: 'You have already placed a bid on this gig.' });
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
    const gigId = req.params.gigId || req.params.jobId || req.params.id;
    const gig = await Gig.findById(gigId);
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });

    const bids = await Bid.find({ gigId }).populate('userId', 'name email');
    const data = bids.map(b => ({
      freelancerId: b.userId?._id || b.userId,
      quotation: b.quotation,
      proposal: b.proposal,
      paidAmount: b.bidFeePaid,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
      contactDetails: b.contactDetails,
      freelancer: b.userId && typeof b.userId === 'object' ? { _id: b.userId._id, name: b.userId.name, email: b.userId.email } : undefined
    }));
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// Get contact details for a specific bid (authorized access only)
export const getBidContacts = async (req, res, next) => {
  try {
    const { gigId, bidId } = req.params;
    
    // Fetch the bid with populated job and user data
    const bid = await Bid.findById(bidId).populate('gigId', 'createdBy').populate('userId', 'name email');
    
    if (!bid) {
      return res.status(404).json({ success: false, message: 'Bid not found' });
    }
    
    // Validate that the bid belongs to the specified gigId
    if (bid.gigId._id.toString() !== gigId) {
      return res.status(404).json({ success: false, message: 'Bid does not belong to the specified job' });
    }
    
    // Authorization check: user must be either the bidder, the job creator, or admin
    const isBidder = bid.userId._id.toString() === req.user._id.toString();
    const isJobCreator = bid.gigId.createdBy.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isBidder && !isJobCreator && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. You can only view contact details for your own bids or jobs.' });
    }
    
    // Handle legacy bids with undefined contactDetails
    const contactDetails = bid.contactDetails || {
      bidderContact: { email: '', phone: '' },
      posterContact: { email: '', phone: '' }
    };
    
    return res.status(200).json({ 
      success: true, 
      data: contactDetails 
    });
  } catch (err) {
    next(err);
  }
};

// Public/Admin: Get bid count for a job (counts succeeded payments as valid bids)
export const getBidCountForJob = async (req, res, next) => {
  try {
    const gigId = req.params.gigId || req.params.jobId || req.params.id;
    const gig = await Gig.findById(gigId).select('_id');
    if (!gig) return res.status(404).json({ success: false, message: 'Gig not found' });
    const count = await Bid.countDocuments({ gigId, paymentStatus: 'succeeded' });
    return res.status(200).json({ success: true, data: { count } });
  } catch (err) {
    next(err);
  }
};

// Public: Get single job details
export const getJobById = async (req, res, next) => {
  try {
    const gigId = req.params.gigId || req.params.jobId || req.params.id;
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }
    
    // Return 404 for hidden gigs unless user is admin
    if (gig.isHidden && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Determine access to full details: admin or user with a succeeded bid for this gig
    let hasUnlockedAccess = false;
    try {
      if (req.user && req.user.role === 'admin') {
        hasUnlockedAccess = true;
      } else if (req.user) {
        const succeededBid = await Bid.findOne({ gigId: gig._id, userId: req.user._id, paymentStatus: 'succeeded' }).select('_id');
        hasUnlockedAccess = !!succeededBid;
      }
    } catch (_) {
      // Non-blocking: default to locked if any error
      hasUnlockedAccess = false;
    }

    // Shape response to hide sensitive details when locked
    const response = gig.toObject();
    const fullDesc = String(response.description || '');
    const shortDesc = fullDesc.length > 160 ? `${fullDesc.slice(0, 160)}…` : fullDesc;
    if (!hasUnlockedAccess) {
      // Provide short only when locked
      response.descriptionShort = shortDesc;
      response.descriptionHidden = true;
      // For backward compatibility, set description to short for locked state
      response.description = shortDesc;
      // Do not include explicit full field when locked
      delete response.descriptionFull;
    } else {
      response.descriptionHidden = false;
      response.descriptionFull = fullDesc;
      response.descriptionShort = shortDesc;
      // Keep description as full for backward compatibility
      response.description = fullDesc;
    }

    return res.status(200).json({ success: true, data: response });
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

    const { gigId } = req.params;
    const updates = {};
    const allowed = ['title', 'category', 'description', 'requirements', 'maxBids'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (updates.category) {
      validateCategoryOrThrow(updates.category);
    }

    const gig = await Gig.findByIdAndUpdate(gigId, updates, { new: true });
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }
    return res.status(200).json({ success: true, data: gig });
  } catch (err) {
    next(err);
  }
};

// Admin: Delete job
export const deleteJob = async (req, res, next) => {
  try {
    const { gigId } = req.params;
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }
    await Bid.deleteMany({ gigId: gig._id });
    await gig.deleteOne();
    return res.status(200).json({ success: true, message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
};

// Admin: Toggle job visibility (isHidden status)
export const toggleJobVisibility = async (req, res, next) => {
  try {
    const { gigId } = req.params;
    const { isHidden } = req.body;
    
    if (typeof isHidden !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isHidden must be a boolean value' });
    }
    
    const gig = await Gig.findByIdAndUpdate(
      gigId, 
      { isHidden }, 
      { new: true }
    );
    
    if (!gig) {
      return res.status(404).json({ success: false, message: 'Gig not found' });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: `Job ${isHidden ? 'hidden' : 'unhidden'} successfully`,
      data: { 
        gigId: gig._id, 
        title: gig.title, 
        isHidden: gig.isHidden 
      }
    });
  } catch (err) {
    next(err);
  }
};

// Freelancer: Get my bids
export const getMyBids = async (req, res, next) => {
  try {
    const bids = await Bid.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('gigId', 'title category createdAt');
    const data = bids.map(b => ({
      _id: b._id,
      gig: b.gigId && typeof b.gigId === 'object' ? { 
        _id: b.gigId._id, 
        title: b.gigId.title, 
        category: b.gigId.category, 
        createdAt: b.gigId.createdAt
      } : { _id: b.gigId },
      quotation: b.quotation,
      proposal: b.proposal,
      bidFeePaid: b.bidFeePaid,
      paymentStatus: b.paymentStatus,
      selectionStatus: b.selectionStatus,
      contactDetails: b.contactDetails, // Include contact details from bid
      createdAt: b.createdAt
    }));
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    next(err);
  }
};

// Get contact details for a gig (only after successful bid)
export const getGigContactDetails = async (req, res, next) => {
  try {
    const { gigId } = req.params;
    const userId = req.user._id;

    // Check if user has a successful bid for this gig
    const bid = await Bid.findOne({
      gigId,
      userId,
      paymentStatus: 'succeeded'
    });

    if (!bid) {
      return res.status(403).json({
        success: false,
        message: 'You must have a successful bid to view contact details'
      });
    }

    // Return contact details from the bid
    return res.status(200).json({
      success: true,
      data: bid.contactDetails
    });
  } catch (err) {
    next(err);
  }
};

// Admin: Dashboard statistics
export const getAdminStats = async (req, res, next) => {
  try {
    const [totalJobs, totalBids, revenueAgg, jobsByCategoryAgg, recentBids] = await Promise.all([
      Gig.countDocuments({}),
      Bid.countDocuments({}),
      Bid.aggregate([
        { $match: { paymentStatus: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$bidFeePaid' } } }
      ]),
      Gig.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Bid.find({}).sort({ createdAt: -1 }).limit(10).populate('userId', 'name email').populate('gigId', 'title category')
    ]);

    const revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;
    const jobsByCategory = jobsByCategoryAgg.map(r => ({ category: r._id, count: r.count }));
    const recent = recentBids.map(b => ({
      _id: b._id,
      job: b.gigId && typeof b.gigId === 'object' ? { _id: b.gigId._id, title: b.gigId.title, category: b.gigId.category } : { _id: b.gigId },
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

// Helper function to check and hide job if bid limit is reached
export const checkAndHideIfLimitReached = async (gigId) => {
  try {
    const gig = await Gig.findById(gigId).select('maxBids isHidden');
    if (!gig) {
      console.warn(`[checkAndHideIfLimitReached] Gig ${gigId} not found`);
      return { shouldHide: false, currentBidCount: 0, maxBids: null };
    }

    // If maxBids is null (unlimited) or gig is already hidden, no action needed
    if (gig.maxBids === null || gig.isHidden) {
      return { shouldHide: false, currentBidCount: 0, maxBids: gig.maxBids };
    }

    // Count succeeded bids for this gig
    const currentBidCount = await Bid.countDocuments({ gigId, paymentStatus: 'succeeded' });

    // If bid count >= maxBids, hide the gig (only if not already hidden)
    if (currentBidCount >= gig.maxBids) {
      const updateResult = await Gig.updateOne(
        { _id: gigId, isHidden: false },
        { isHidden: true }
      );
      if (updateResult.modifiedCount > 0) {
        console.log(`[checkAndHideIfLimitReached] Gig ${gigId} hidden due to bid limit reached (${currentBidCount}/${gig.maxBids})`);
      }
      return { shouldHide: true, currentBidCount, maxBids: gig.maxBids };
    }

    return { shouldHide: false, currentBidCount, maxBids: gig.maxBids };
  } catch (err) {
    console.error(`[checkAndHideIfLimitReached] Error for gig ${gigId}:`, err?.message || err);
    return { shouldHide: false, currentBidCount: 0, maxBids: null };
  }
};

