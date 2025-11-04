import express from 'express';
import crypto from 'crypto';
import User from '../models/User.js';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import { createOrder, verifySignature, getRazorpayClient } from '../services/paymentService.js';

const router = express.Router();

// POST /api/payment/order
// Public: creates a Razorpay order for a gig purchase
router.post('/order', async (req, res) => {
  try {
    const { amount, gigId, description, tempUserId, currency = 'INR', email, contact, name } = req.body || {};

    if (!amount || !gigId) {
      return res.status(400).json({ success: false, message: 'amount and gigId are required' });
    }

    if (process.env.ENABLE_RAZORPAY !== 'true') {
      return res.status(400).json({ success: false, message: 'Razorpay is not enabled' });
    }

    const notes = {
      gigId: String(gigId),
      tempUserId: tempUserId || crypto.randomUUID(),
      purpose: 'gig_purchase',
      email: email || '',
      contact: contact || '',
      name: name || '',
    };

    // Build a Razorpay-compliant receipt (<= 40 chars)
    const shortId = crypto.createHash('sha1').update(String(gigId)).digest('hex').slice(0, 8);
    const receipt = `gig_${shortId}_${Date.now()}`;
    const amountInPaise = Number(amount);

    let order;
    try {
      order = await createOrder(amountInPaise, currency, receipt, notes);
    } catch (e) {
      const msg = e?.error?.description || e?.message || 'Failed to create order';
      const code = e?.statusCode === 400 ? 400 : 500;
      console.error('[payment] create order failed', e);
      return res.status(code).json({ success: false, message: msg });
    }

    return res.status(200).json({
      success: true,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const msg = error?.error?.description || error?.message || 'Failed to create order';
    const code = error?.statusCode === 400 ? 400 : 500;
    console.error('[payment] create order failed', error);
    return res.status(code).json({ success: false, message: msg });
  }
});

// POST /api/payment/verify
// Public: verifies payment signature, fetches payer details, auto-logs-in or creates user
router.post('/verify', async (req, res) => {
  try {
    const { payment_id: paymentId, order_id: orderId, signature } = req.body || {};

    if (!paymentId || !orderId || !signature) {
      return res.status(400).json({ success: false, message: 'payment_id, order_id and signature are required' });
    }

    if (process.env.ENABLE_RAZORPAY !== 'true') {
      return res.status(400).json({ success: false, message: 'Razorpay is not enabled' });
    }

    const isValid = verifySignature({ orderId, paymentId, signature });
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    const client = getRazorpayClient();
    if (!client) {
      return res.status(400).json({ success: false, message: 'Razorpay client not configured' });
    }

    // Fetch payment and order from Razorpay to validate
    let payment, order;
    try {
      [payment, order] = await Promise.all([
        client.payments.fetch(paymentId),
        client.orders.fetch(orderId).catch(() => null)
      ]);
    } catch (e) {
      const msg = e?.error?.description || e?.message || 'Failed to fetch payment details';
      console.error('[payment] verify fetch failed', e);
      return res.status(400).json({ success: false, message: msg });
    }

    // Validate payment belongs to the provided order
    if (payment?.order_id !== orderId) {
      return res.status(400).json({ success: false, message: 'Payment does not belong to the provided order' });
    }

    // Ensure successful or authorized payment
    const okStatuses = ['captured', 'authorized'];
    if (!okStatuses.includes(String(payment?.status))) {
      return res.status(400).json({ success: false, message: `Payment not completed (status: ${payment?.status || 'unknown'})` });
    }

    // Optional: amount cross-check if order available
    if (order && typeof order.amount === 'number' && typeof payment.amount === 'number') {
      if (Number(order.amount) !== Number(payment.amount)) {
        return res.status(400).json({ success: false, message: 'Amount mismatch between order and payment' });
      }
    }

    const payerEmail = payment?.email || payment?.notes?.email || '';
    const payerContact = payment?.contact || payment?.notes?.contact || '';
    const payerName = payment?.notes?.name || '';

    if (!payerEmail) {
      return res.status(400).json({ success: false, message: 'Email is required. Please provide your email in the Razorpay payment form.' });
    }

    if (!payerContact) {
      return res.status(400).json({ success: false, message: 'Phone number is required. Please provide your phone number in the Razorpay payment form.' });
    }

    // Find or create user by email primarily; if no email, fallback to phone
    const identifier = payerEmail ? { email: payerEmail.toLowerCase() } : { phone: payerContact };
    let user = await User.findOne(identifier);

    if (!user) {
      // Create with random strong password; mark verified flags
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const nameFromEmail = payerEmail ? payerEmail.split('@')[0] : `user_${payerContact}`;
      user = await User.create({
        name: payerName || nameFromEmail,
        email: payerEmail || `${nameFromEmail}@autogen.local`,
        password: randomPassword,
        phone: payerContact || '',
        role: 'freelancer',
        isEmailVerified: !!payerEmail,
        verifiedByPayment: true,
      });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = user.getSignedJwtToken();
    const refreshToken = user.getRefreshToken();
    await user.save({ validateBeforeSave: false });

    // Auto-create succeeded bid for this gig to unlock access
    try {
      const gigId = (order?.notes?.gigId || payment?.notes?.gigId || '').toString();
      if (gigId) {
        const existingSucceeded = await Bid.findOne({ gigId, userId: user._id, paymentStatus: 'succeeded' }).select('_id');
        if (!existingSucceeded) {
          // Build poster contact from gig creator if available
          let posterContact = { name: '', email: '', phone: '', countryCode: 'US', company: '', position: '', alternateContact: '' };
          try {
            const gig = await Gig.findById(gigId).populate('createdBy', 'name email phone');
            if (gig && gig.createdBy) {
              posterContact = {
                name: gig.createdBy.name || '',
                email: (gig.createdBy.email || '').toLowerCase(),
                phone: gig.createdBy.phone || '',
                countryCode: 'US',
                company: '',
                position: '',
                alternateContact: ''
              };
            }
          } catch {}

          const bidderContact = {
            name: payerName || (user.name || ''),
            email: (payerEmail || user.email || '').toLowerCase(),
            phone: payerContact || user.phone || '',
            countryCode: 'US',
            company: '',
            position: ''
          };

          await Bid.create({
            gigId,
            userId: user._id,
            quotation: 0,
            proposal: 'Guest access unlock',
            bidFeePaid: Math.round(Number(payment?.amount || 0) / 100),
            paymentStatus: 'succeeded',
            contactDetails: { bidderContact, posterContact }
          });
        }
      }
    } catch (e) {
      console.warn('[payment] verify: bid create skipped', e?.message || e);
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and user authenticated',
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        verifiedByPayment: user.verifiedByPayment,
      },
      meta: {
        orderNotes: order?.notes || {},
      }
    });
  } catch (error) {
    const msg = error?.error?.description || error?.message || 'Payment verification failed';
    const code = error?.statusCode === 400 ? 400 : 500;
    console.error('[payment] verify failed', error);
    return res.status(code).json({ success: false, message: msg });
  }
});

export default router;


