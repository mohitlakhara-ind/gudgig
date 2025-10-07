import { NextRequest, NextResponse } from 'next/server';
import { fakePaymentsService } from '@/services/fakePaymentsService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { gigId, gigTitle, amount, currency = 'INR', description } = body;

    // Validate required fields
    if (!gigId || !gigTitle || !amount) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: gigId, gigTitle, amount' },
        { status: 400 }
      );
    }

    // Create fake payment for gig
    const paymentData = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      status: 'success' as const,
      paymentId: `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      method: 'card' as const,
      description: description || `Gig payment for: ${gigTitle}`,
      bid: {
        _id: `bid_${Date.now()}`,
        job: {
          _id: gigId,
          title: gigTitle
        }
      },
      metadata: {
        gateway: 'Fake Gateway',
        transactionFee: Math.round(amount * 0.03 * 100), // 3% fee
        netAmount: Math.round(amount * 0.97 * 100), // 97% after fee
        reference: `TXN${Date.now()}`
      }
    };

    const newPayment = fakePaymentsService.createPayment(paymentData);

    return NextResponse.json({
      success: true,
      data: {
        paymentId: newPayment.paymentId,
        orderId: newPayment.orderId,
        amount: newPayment.amount,
        currency: newPayment.currency,
        status: newPayment.status,
        gigId,
        gigTitle,
        createdAt: newPayment.createdAt
      },
      message: 'Gig payment processed successfully'
    });

  } catch (error) {
    console.error('Error processing fake gig payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process gig payment' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gigId = searchParams.get('gigId');

    if (!gigId) {
      return NextResponse.json(
        { success: false, message: 'Gig ID is required' },
        { status: 400 }
      );
    }

    // Get payments for specific gig
    const allPayments = fakePaymentsService.getPayments();
    const gigPayments = allPayments.payments.filter(payment => 
      payment.bid?.job?._id === gigId
    );

    return NextResponse.json({
      success: true,
      data: gigPayments,
      meta: {
        total: gigPayments.length,
        gigId
      }
    });

  } catch (error) {
    console.error('Error fetching gig payments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch gig payments' },
      { status: 500 }
    );
  }
}
