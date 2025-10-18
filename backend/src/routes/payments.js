import express from 'express';
import { protect } from '../middleware/auth.js';
import Bid from '../models/Bid.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Helper function to validate ObjectId
const isValidObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Get payments for the authenticated user (from bids)
router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, method, dateFrom, dateTo, limit = 50, page = 1 } = req.query;

    console.log('💰 Fetching payments for user:', userId);

    // Build query
    const query = { userId };
    
    // Filter by payment status
    if (status && status !== 'all') {
      query.paymentStatus = status;
    }

    // Filter by date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    // Get bids with populated job data
    const bids = await Bid.find(query)
      .populate({
        path: 'jobId',
        select: 'title category budget location createdAt',
        model: 'Job'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Transform bids to payment format
    const payments = bids.map(bid => ({
      _id: bid._id,
      amount: bid.bidFeePaid,
      currency: 'INR',
      status: bid.paymentStatus === 'succeeded' ? 'success' : 
              bid.paymentStatus === 'failed' ? 'failed' : 'pending',
      paymentId: `bid_${bid._id}`,
      orderId: `order_${bid._id}`,
      method: 'Online Payment',
      description: `Bid fee for "${bid.jobId?.title || 'Job'}"`,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
      bid: {
        _id: bid._id,
        job: {
          _id: bid.jobId?._id,
          title: bid.jobId?.title || 'Unknown Job'
        }
      }
    }));

    // Get total count
    const totalPayments = await Bid.countDocuments(query);

    console.log(`✅ Found ${payments.length} payments`);

    res.status(200).json({
      success: true,
      data: payments,
      count: payments.length,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalPayments,
        pages: Math.ceil(totalPayments / limitNum)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get payment statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user._id;

    console.log('📊 Fetching payment stats for user:', userId);

    // Get payment statistics from bids
    const [
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalAmount,
      successfulAmount,
      thisMonthPayments,
      thisMonthAmount
    ] = await Promise.all([
      Bid.countDocuments({ userId }),
      Bid.countDocuments({ userId, paymentStatus: 'succeeded' }),
      Bid.countDocuments({ userId, paymentStatus: 'failed' }),
      Bid.countDocuments({ userId, paymentStatus: 'pending' }),
      Bid.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: '$bidFeePaid' } } }
      ]),
      Bid.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), paymentStatus: 'succeeded' } },
        { $group: { _id: null, total: { $sum: '$bidFeePaid' } } }
      ]),
      Bid.countDocuments({ 
        userId, 
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } 
      }),
      Bid.aggregate([
        { 
          $match: { 
            userId: new mongoose.Types.ObjectId(userId),
            createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
          } 
        },
        { $group: { _id: null, total: { $sum: '$bidFeePaid' } } }
      ])
    ]);

    const stats = {
      totalPayments,
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalAmount: totalAmount[0]?.total || 0,
      successfulAmount: successfulAmount[0]?.total || 0,
      thisMonthPayments,
      thisMonthAmount: thisMonthAmount[0]?.total || 0,
      successRate: totalPayments > 0 ? Math.round((successfulPayments / totalPayments) * 100) : 0,
      averageAmount: totalPayments > 0 ? Math.round((totalAmount[0]?.total || 0) / totalPayments) : 0
    };

    console.log('✅ Payment stats calculated:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get a specific payment by ID
router.get('/:paymentId', async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentId } = req.params;

    if (!isValidObjectId(paymentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment ID format'
      });
    }

    const bid = await Bid.findOne({ _id: paymentId, userId })
      .populate({
        path: 'jobId',
        select: 'title category budget location createdAt',
        model: 'Job'
      });

    if (!bid) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Transform bid to payment format
    const payment = {
      _id: bid._id,
      amount: bid.bidFeePaid,
      currency: 'INR',
      status: bid.paymentStatus === 'succeeded' ? 'success' : 
              bid.paymentStatus === 'failed' ? 'failed' : 'pending',
      paymentId: `bid_${bid._id}`,
      orderId: `order_${bid._id}`,
      method: 'Online Payment',
      description: `Bid fee for "${bid.jobId?.title || 'Job'}"`,
      createdAt: bid.createdAt,
      updatedAt: bid.updatedAt,
      bid: {
        _id: bid._id,
        job: {
          _id: bid.jobId?._id,
          title: bid.jobId?.title || 'Unknown Job'
        }
      }
    };

    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('❌ Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
