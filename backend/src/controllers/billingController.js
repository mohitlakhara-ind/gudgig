import Stripe from 'stripe';
import Subscription from '../models/Subscription.js';
import { isRazorpayEnabled, createOrder as createRazorpayOrder, verifySignature as verifyRazorpaySignature } from '../services/payments/razorpay.js';
import { isPaypalEnabled, createOrder as createPaypalOrder, captureOrder as capturePaypalOrder } from '../services/payments/paypal.js';
import { BILLING_CYCLES, getPlanDefinition, getStripePriceId } from '../config/subscriptionPlans.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2023-10-16' });

// Backward-compat price map retained for safety; new logic prefers price IDs from plan config
const PRICE_MAP = {
  free: null,
  pro: process.env.STRIPE_PRICE_PRO,
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE,
};

export const createCheckoutSession = async (req, res, next) => {
  try {
    const { plan = 'pro', billingCycle = BILLING_CYCLES.MONTHLY, returnUrl, allowTrial = true } = req.body;

    // Resolve price by plan + billing cycle using central config, fall back to legacy env price if needed
    let priceId = getStripePriceId(plan, billingCycle) || PRICE_MAP[plan];
    if (!priceId) {
      return res.status(400).json({ success: false, message: 'Invalid plan or missing price for billing cycle' });
    }

    // Validate billing cycle
    const validCycles = Object.values(BILLING_CYCLES);
    if (!validCycles.includes(billingCycle)) {
      return res.status(400).json({ success: false, message: 'Invalid billing cycle' });
    }

    const planDef = getPlanDefinition(plan);

    // Ensure customer exists
    let subscription = await Subscription.findOne({ user: req.user.id });

    let customerId = subscription?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: { userId: req.user.id },
        email: req.user.email,
        name: req.user.name,
      });
      customerId = customer.id;
    }

    const subscriptionData = {
      metadata: { userId: req.user.id, plan, billingCycle },
    };

    // Configure trial period if allowed and defined in plan
    if (allowTrial && planDef.trialDays && planDef.trialDays > 0) {
      subscriptionData.trial_period_days = planDef.trialDays;
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: returnUrl || `${process.env.CLIENT_URL}/checkout/success`,
      cancel_url: `${process.env.CLIENT_URL}/subscription?status=cancelled`,
      subscription_data: subscriptionData,
      metadata: { userId: req.user.id, plan, billingCycle },
    });

    // Upsert subscription with customer id
    await Subscription.findOneAndUpdate(
      { user: req.user.id },
      { user: req.user.id, stripeCustomerId: customerId, plan, billingCycle },
      { upsert: true, new: true }
    );

    return res.status(200).json({ success: true, data: { url: session.url } });
  } catch (err) {
    next(err);
  }
};

// Razorpay: create order
export const razorpayCreateOrder = async (req, res, next) => {
  try {
    if (!isRazorpayEnabled()) return res.status(400).json({ success: false, message: 'Razorpay disabled' });
    const { amount, currency = 'INR', receipt, notes } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'Amount required' });
    const order = await createRazorpayOrder(Math.round(Number(amount) * 100), currency, receipt, { ...notes, userId: req.user.id });
    return res.json({ success: true, data: { order } });
  } catch (err) { next(err); }
};

// Razorpay: verify payment
export const razorpayVerifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!verifyRazorpaySignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, signature: razorpay_signature })) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }
    // TODO: lookup order notes for userId/plan details and activate subscription
    await Subscription.findOneAndUpdate({ user: req.user.id }, { status: 'active' }, { upsert: true });
    return res.json({ success: true });
  } catch (err) { next(err); }
};

// PayPal: create order
export const paypalCreateOrder = async (req, res, next) => {
  try {
    if (!isPaypalEnabled()) return res.status(400).json({ success: false, message: 'PayPal disabled' });
    const { amount, currency = 'USD' } = req.body;
    if (!amount) return res.status(400).json({ success: false, message: 'Amount required' });
    const returnUrl = `${process.env.CLIENT_URL}/checkout/success`;
    const cancelUrl = `${process.env.CLIENT_URL}/subscription?status=cancelled`;
    const order = await createPaypalOrder(amount, currency, returnUrl, cancelUrl);
    return res.json({ success: true, data: { order } });
  } catch (err) { next(err); }
};

// PayPal: capture order
export const paypalCaptureOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ success: false, message: 'orderId is required' });
    const capture = await capturePaypalOrder(orderId);
    await Subscription.findOneAndUpdate({ user: req.user.id }, { status: 'active' }, { upsert: true });
    return res.json({ success: true, data: { capture } });
  } catch (err) { next(err); }
};

export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = Stripe.webhooks.constructEvent(
      req.rawBody || req.body, // ensure raw body middleware for this route
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const plan = session.metadata?.plan;
        const billingCycle = session.metadata?.billingCycle || BILLING_CYCLES.MONTHLY;
        if (userId) {
          await Subscription.findOneAndUpdate(
            { user: userId },
            {
              status: 'active',
              stripeSubscriptionId: session.subscription,
              currentPeriodStart: new Date(),
              billingCycle,
              plan: plan || 'pro'
            },
            { new: true }
          );
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
        const customer = await stripe.customers.retrieve(invoice.customer);
        let last4 = null;
        try {
          if (invoice.payment_intent) {
            const pi = await stripe.paymentIntents.retrieve(invoice.payment_intent, { expand: ['payment_method'] });
            // @ts-ignore optional chaining for runtime
            last4 = pi?.payment_method?.card?.last4 || null;
          }
        } catch (e) {
          // Fallback to customer default payment method if available
          // @ts-ignore optional chaining for runtime
          last4 = (customer.invoice_settings?.default_payment_method && customer.invoice_settings.default_payment_method.card?.last4) || null;
        }
        const userId = subscription.metadata?.userId;
        const billingCycle = subscription.metadata?.billingCycle || BILLING_CYCLES.MONTHLY;
        if (userId) {
          await Subscription.findOneAndUpdate(
            { user: userId },
            {
              status: 'active',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              paymentMethodLast4: last4,
              billingCycle,
              $push: { invoices: { invoiceId: invoice.id, amount: invoice.amount_paid / 100, currency: invoice.currency, status: invoice.status } },
            }
          );
        }
        break;
      }
      case 'customer.subscription.trial_will_end': {
        // Optionally notify user
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const userId = sub.metadata?.userId;
        if (userId) {
          await Subscription.findOneAndUpdate(
            { user: userId },
            { status: 'canceled' }
          );
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error('Stripe webhook handling error:', err);
    return res.status(500).send('Webhook handler failed');
  }

  res.json({ received: true });
};


