import express from 'express';
import { protect } from '../middleware/auth.js';
import Bid from '../models/Bid.js';
import Job from '../models/Job.js';

const router = express.Router();

// All routes require auth
router.use(protect);

// GET /api/user/gigs/applied - gigs the current user has applied for (via bids)
router.get('/applied', async (req, res) => {
  try {
    const userId = req.user._id;
    const bids = await Bid.find({ userId })
      .sort({ createdAt: -1 })
      .populate('jobId', 'title company category createdAt');
    const data = bids.map(b => ({
      _id: b._id,
      jobId: b.jobId && typeof b.jobId === 'object' ? b.jobId._id : b.jobId,
      quotation: b.quotation,
      proposal: b.proposal,
      bidFeePaid: b.bidFeePaid,
      paymentStatus: b.paymentStatus,
      createdAt: b.createdAt,
      job: b.jobId && typeof b.jobId === 'object' ? { _id: b.jobId._id, title: b.jobId.title, company: b.jobId.company, category: b.jobId.category, createdAt: b.jobId.createdAt } : null,
    }));
    res.status(200).json({ success: true, data });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Failed to load applied gigs' });
  }
});

export default router;




