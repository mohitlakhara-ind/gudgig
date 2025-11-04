import express from 'express';
import { body, query } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';

// Lazy import models to avoid circulars in some setups
const getBidModel = async () => (await import('../models/Bid.js')).default;
const getGigModel = async () => (await import('../models/Job.js')).default; // Job.js exports the Gig model

const router = express.Router();

// All admin bids routes require admin auth
router.use(protect, authorize('admin'));

// GET /api/admin/bids?page=&limit=&jobId=&userId=&status=&from=&to=
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('jobId').optional().isMongoId(), // backward compat
    query('gigId').optional().isMongoId(),
    query('userId').optional().isMongoId(),
    query('status').optional().isIn(['succeeded', 'failed', 'pending']),
    query('from').optional().isISO8601(),
    query('to').optional().isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const Bid = await getBidModel();
      const {
        page = 1,
        limit = 20,
        jobId,
        gigId,
        userId,
        status,
        from,
        to,
      } = req.query;

      const filter = {};
      // Support both gigId and legacy jobId parameter; Bid schema uses gigId
      if (gigId) filter.gigId = gigId;
      if (jobId && !gigId) filter.gigId = jobId;
      if (userId) filter.userId = userId;
      if (status) filter.paymentStatus = status;
      if (from || to) {
        filter.createdAt = {};
        if (from) filter.createdAt.$gte = new Date(from);
        if (to) filter.createdAt.$lte = new Date(to);
      }

      const pageNumber = Math.max(1, parseInt(page, 10) || 1);
      const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

      const [items, total] = await Promise.all([
        Bid.find(filter)
          .sort({ createdAt: -1 })
          .skip((pageNumber - 1) * pageSize)
          .limit(pageSize)
          .populate('userId', 'name email')
          .populate('gigId', 'title category'),
        Bid.countDocuments(filter),
      ]);

      const data = items.map((b) => ({
        _id: b._id,
        job: b.gigId && typeof b.gigId === 'object' ? { _id: b.gigId._id, title: b.gigId.title, category: b.gigId.category } : { _id: b.gigId },
        freelancer: b.userId && typeof b.userId === 'object' ? { _id: b.userId._id, name: b.userId.name, email: b.userId.email } : { _id: b.userId },
        quotation: b.quotation,
        proposal: b.proposal,
        bidFeePaid: b.bidFeePaid,
        paymentStatus: b.paymentStatus,
        createdAt: b.createdAt,
      }));

      return res.status(200).json({
        success: true,
        count: data.length,
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        data,
      });
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/admin/bids/:bidId/status { status: 'accepted' | 'rejected' }
router.patch(
  '/:bidId/status',
  [
    body('status').isIn(['accepted', 'rejected']).withMessage('Invalid status')
  ],
  async (req, res, next) => {
    try {
      const Bid = await getBidModel();
      const Job = await getGigModel();
      const { bidId } = req.params;
      const { status } = req.body;

      const bid = await Bid.findById(bidId);
      if (!bid) return res.status(404).json({ success: false, message: 'Bid not found' });

      // Update bid selection state
      bid.selectionStatus = status;
      bid.selectedAt = status === 'accepted' ? new Date() : bid.selectedAt;
      await bid.save();

      // Update job/gig selection snapshot if accepted
      if (status === 'accepted') {
        const job = await Job.findById(bid.gigId);
        if (job) {
          job.selectedFreelancerId = bid.userId;
          job.selection = {
            ...(job.selection || {}),
            status: 'selected',
            selectedBidId: bid._id,
            selectedAt: new Date()
          };
          await job.save();
        }
      }

      // Fire notifications (best-effort, non-blocking)
      (async () => {
        try {
          const notificationService = (await import('../services/notificationService.js')).default;
          const app = (await import('../server.js')).default;
          const io = app.get('io');
          if (status === 'accepted') {
            await notificationService.createNotification(
              bid.userId,
              'bid_accepted',
              '🎉 Bid Accepted',
              'Congratulations! Your bid has been accepted.',
              { bidId: bid._id, jobId: bid.gigId }
            );
            // Emit realtime socket event to the freelancer
            if (io) {
              io.to(`user:${String(bid.userId)}`).emit('notification:new', {
                id: String(bid._id),
                type: 'bid_accepted',
                title: '🎉 Bid Accepted',
                message: 'Congratulations! Your bid has been accepted.',
                data: { bidId: String(bid._id), jobId: String(bid.gigId) },
                createdAt: new Date().toISOString()
              });
            }
          } else if (status === 'rejected') {
            await notificationService.createNotification(
              bid.userId,
              'bid_rejected',
              'Bid Update',
              'Your bid was not selected this time.',
              { bidId: bid._id, jobId: bid.gigId }
            );
            if (io) {
              io.to(`user:${String(bid.userId)}`).emit('notification:new', {
                id: String(bid._id),
                type: 'bid_rejected',
                title: 'Bid Update',
                message: 'Your bid was not selected this time.',
                data: { bidId: String(bid._id), jobId: String(bid.gigId) },
                createdAt: new Date().toISOString()
              });
            }
          }
        } catch (e) {
          // ignore errors
        }
      })();

      return res.status(200).json({ success: true, data: { bidId: bid._id, status: bid.selectionStatus } });
    } catch (err) {
      next(err);
    }
  }
);

export default router;





