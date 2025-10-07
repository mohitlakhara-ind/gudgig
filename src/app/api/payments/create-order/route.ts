import { NextRequest, NextResponse } from 'next/server';
import { createRazorpayOrder } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, currency, receipt, notes } = body;

    if (!amount || !currency || !receipt) {
      return NextResponse.json(
        { error: 'Missing required fields: amount, currency, receipt' },
        { status: 400 }
      );
    }

    // Validate amount (minimum ₹1)
    if (amount < 100) {
      return NextResponse.json(
        { error: 'Minimum amount is ₹1 (100 paise)' },
        { status: 400 }
      );
    }

    const orderData = await createRazorpayOrder({
      amount,
      currency,
      receipt,
      notes
    });

    return NextResponse.json(orderData);

  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}


