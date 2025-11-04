import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Razorpay if enabled
let razorpay = null;
const initializeRazorpay = async () => {
  if (process.env.ENABLE_RAZORPAY === 'true' && process.env.RAZORPAY_KEY_ID) {
    try {
      const Razorpay = (await import('razorpay')).default;
      razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });
      console.log('Razorpay initialized successfully');
    } catch (error) {
      console.warn('Razorpay not available:', error.message);
    }
  }
};

// Initialize Razorpay asynchronously
initializeRazorpay();

/**
 * Create escrow payment intent
 * Holds funds until order completion
 */
export const createEscrowPayment = async ({
  amount,
  currency = 'USD',
  orderId,
  buyerId,
  sellerId,
  description,
  paymentMethod = 'stripe'
}) => {
  try {
    switch (paymentMethod) {
      case 'stripe':
        return await createStripeEscrowPayment({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          orderId,
          buyerId,
          sellerId,
          description
        });
        
      case 'razorpay':
        if (!razorpay) {
          throw new Error('Razorpay not configured');
        }
        return await createRazorpayEscrowPayment({
          amount: Math.round(amount * 100), // Convert to paise
          currency,
          orderId,
          buyerId,
          sellerId,
          description
        });
        
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('Error creating escrow payment:', error);
    throw error;
  }
};

/**
 * Create Stripe escrow payment
 */
const createStripeEscrowPayment = async ({
  amount,
  currency,
  orderId,
  buyerId,
  sellerId,
  description
}) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount,
    currency,
    capture_method: 'manual', // Hold funds until manual capture
    metadata: {
      type: 'escrow',
      orderId,
      buyerId,
      sellerId
    },
    description,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
};

/**
 * Create Razorpay escrow payment
 */
const createRazorpayEscrowPayment = async ({
  amount,
  currency,
  orderId,
  buyerId,
  sellerId,
  description
}) => {
  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt: `order_${orderId}`,
    notes: {
      type: 'escrow',
      orderId,
      buyerId,
      sellerId,
      description
    }
  });

  return {
    id: order.id,
    client_secret: order.id, // Razorpay uses order ID
    amount: order.amount,
    currency: order.currency
  };
};

/**
 * Confirm payment intent
 */
export const confirmPaymentIntent = async (paymentIntentId, paymentMethod = 'stripe') => {
  try {
    switch (paymentMethod) {
      case 'stripe':
        return await stripe.paymentIntents.retrieve(paymentIntentId);
        
      case 'razorpay':
        // For Razorpay, confirmation happens on client side
        // This would typically verify the payment signature
        return { status: 'succeeded' };
        
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Release escrow funds to seller
 */
export const releaseEscrowFunds = async (paymentIntentId, amount, paymentMethod = 'stripe') => {
  try {
    switch (paymentMethod) {
      case 'stripe':
        // Capture the held payment
        const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId, {
          amount_to_capture: amount
        });
        
        // Create transfer to seller (if using Stripe Connect)
        // This would require seller to have connected Stripe account
        if (process.env.STRIPE_CONNECT_ENABLED === 'true') {
          const sellerId = paymentIntent.metadata.sellerId;
          const platformFee = Math.round(amount * 0.1); // 10% platform fee
          const sellerAmount = amount - platformFee;
          
          await stripe.transfers.create({
            amount: sellerAmount,
            currency: paymentIntent.currency,
            destination: sellerId, // Seller's Stripe account ID
            transfer_group: paymentIntent.id,
          });
        }
        
        return paymentIntent;
        
      case 'razorpay':
        // Razorpay route would handle fund release
        // Implementation depends on Razorpay's escrow features
        return { status: 'released' };
        
		default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('Error releasing escrow funds:', error);
    throw error;
  }
};

/**
 * Refund escrow payment
 */
export const refundEscrowPayment = async (paymentIntentId, amount, reason, paymentMethod = 'stripe') => {
  try {
    switch (paymentMethod) {
      case 'stripe':
        const refund = await stripe.refunds.create({
          payment_intent: paymentIntentId,
          amount,
          reason: 'requested_by_customer',
          metadata: {
            refund_reason: reason
          }
        });
        return refund;
        
      case 'razorpay':
        // Razorpay refund implementation
        const refundData = await razorpay.payments.refund(paymentIntentId, {
          amount,
          notes: {
            reason
          }
        });
        return refundData;
        
		default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw error;
  }
};

/**
 * Get payment details
 */
export const getPaymentDetails = async (paymentIntentId, paymentMethod = 'stripe') => {
  try {
    switch (paymentMethod) {
      case 'stripe':
        return await stripe.paymentIntents.retrieve(paymentIntentId);
        
      case 'razorpay':
        return await razorpay.orders.fetch(paymentIntentId);
        
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('Error getting payment details:', error);
    throw error;
  }
};

/**
 * Handle webhook events for payment updates
 */
export const handlePaymentWebhook = async (event, paymentMethod = 'stripe') => {
  try {
    switch (paymentMethod) {
      case 'stripe':
        return await handleStripeWebhook(event);
        
      case 'razorpay':
        return await handleRazorpayWebhook(event);
        
      default:
        throw new Error(`Unsupported payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('Error handling payment webhook:', error);
    throw error;
  }
};

/**
 * Handle Stripe webhook events
 */
const handleStripeWebhook = async (event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      // Payment was successful
      const paymentIntent = event.data.object;
      if (paymentIntent.metadata.type === 'escrow') {
        // Update order status
        const orderId = paymentIntent.metadata.orderId;
        // This would trigger order status update
        return { orderId, status: 'payment_confirmed' };
      }
      break;
      
    case 'payment_intent.payment_failed':
      // Payment failed
      const failedPayment = event.data.object;
      if (failedPayment.metadata.type === 'escrow') {
        const orderId = failedPayment.metadata.orderId;
        return { orderId, status: 'payment_failed' };
      }
      break;
      
    default:
      console.log(`Unhandled Stripe event type: ${event.type}`);
  }
  
  return null;
};

/**
 * Handle Razorpay webhook events
 */
const handleRazorpayWebhook = async (event) => {
  switch (event.event) {
        case 'payment.captured':
      const payment = event.payload.payment.entity;
      if (payment.notes.type === 'escrow') {
        const orderId = payment.notes.orderId;
        return { orderId, status: 'payment_confirmed' };
      }
      break;
      
        case 'payment.failed':
      const failedPayment = event.payload.payment.entity;
      if (failedPayment.notes.type === 'escrow') {
        const orderId = failedPayment.notes.orderId;
        return { orderId, status: 'payment_failed' };
      }
      break;
      
        default:
      console.log(`Unhandled Razorpay event type: ${event.event}`);
  }
  
  return null;
};

/**
 * Calculate platform fees
 */
export const calculatePlatformFee = (amount, feePercentage = 10) => {
  const fee = Math.round(amount * (feePercentage / 100));
  const sellerAmount = amount - fee;
  
  return {
    totalAmount: amount,
    platformFee: fee,
    sellerAmount,
    feePercentage
  };
};

/**
 * Create payout to seller (for platforms with instant payouts)
 */
export const createSellerPayout = async (sellerId, amount, currency = 'USD', paymentMethod = 'stripe') => {
  try {
    switch (paymentMethod) {
      case 'stripe':
        // This requires Stripe Connect
        if (process.env.STRIPE_CONNECT_ENABLED !== 'true') {
          throw new Error('Stripe Connect not enabled');
        }
        
        const payout = await stripe.transfers.create({
          amount: Math.round(amount * 100),
          currency: currency.toLowerCase(),
          destination: sellerId, // Seller's connected Stripe account
        });
        
        return payout;
        
      default:
        throw new Error(`Payout not supported for payment method: ${paymentMethod}`);
    }
  } catch (error) {
    console.error('Error creating seller payout:', error);
    throw error;
  }
};

// Legacy functions for backward compatibility
export const createPaymentIntent = createEscrowPayment;

// Razorpay compatibility helpers expected by routes
export const getRazorpayClient = () => {
  return razorpay;
};

export const createOrder = async (amount, currency = 'INR', receipt = '', notes = {}) => {
  if (!razorpay) {
    throw new Error('Razorpay not configured');
  }

  const order = await razorpay.orders.create({
    amount,
    currency,
    receipt,
    notes,
  });

  return order;
};

export const verifySignature = ({ orderId, paymentId, signature }) => {
  if (!process.env.RAZORPAY_KEY_SECRET) return false;
  const hmac = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return hmac === signature;
};