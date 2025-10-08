import Razorpay from 'razorpay';
import crypto from 'crypto';

// Razorpay configuration
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret',
});

export interface PaymentRequest {
  amount: number; // Amount in paise (₹1 = 100 paise)
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method?: string;
  description?: string;
  vpa?: string;
  email?: string;
  contact?: string;
  notes?: Record<string, string>;
  fee?: number;
  tax?: number;
  error_code?: string;
  error_description?: string;
  created_at: number;
}

export interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

// Create a Razorpay order
export async function createRazorpayOrder(data: CreateOrderRequest): Promise<CreateOrderResponse> {
  try {
    // Check if Razorpay credentials are properly configured
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('Razorpay credentials not configured, using demo mode');
      // Return a mock order for demo purposes
      return {
        id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        entity: 'order',
        amount: data.amount,
        amount_paid: 0,
        amount_due: data.amount,
        currency: data.currency,
        receipt: data.receipt,
        status: 'created',
        attempts: 0,
        notes: data.notes || {},
        created_at: Math.floor(Date.now() / 1000),
      };
    }

    const order = await razorpay.orders.create({
      amount: data.amount,
      currency: data.currency,
      receipt: data.receipt,
      notes: data.notes || {},
    });

    return order as CreateOrderResponse;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}

// Verify payment signature
export function verifyPaymentSignature(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || '';
  
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === razorpay_signature;
}

// Get payment details
export async function getPaymentDetails(paymentId: string): Promise<PaymentResponse> {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment as PaymentResponse;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
}

// Refund payment
export async function refundPayment(
  paymentId: string,
  amount?: number,
  notes?: Record<string, string>
): Promise<unknown> {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount,
      notes: notes || {},
    });
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund');
  }
}

// Get all payments
export async function getAllPayments(options?: {
  from?: number; // unix timestamp (seconds)
  to?: number;   // unix timestamp (seconds)
  count?: number;
  skip?: number;
}): Promise<{ items: PaymentResponse[]; count: number }> {
  try {
    const payments = await razorpay.payments.all(options);
    return payments as { items: PaymentResponse[]; count: number };
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw new Error('Failed to fetch payments');
  }
}

export default razorpay;


