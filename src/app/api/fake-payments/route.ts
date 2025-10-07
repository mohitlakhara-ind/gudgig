import { NextRequest, NextResponse } from 'next/server';
import { fakePaymentsService } from '@/services/fakePaymentsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const status = searchParams.get('status') || undefined;
    const method = searchParams.get('method') || undefined;
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;

    const filters = {
      status,
      method,
      dateFrom,
      dateTo,
      limit,
      page
    };

    const result = fakePaymentsService.getPayments(filters);

    return NextResponse.json({
      success: true,
      data: result.payments,
      meta: {
        total: result.total,
        page: result.page,
        pages: result.pages,
        limit: limit || 10
      }
    });

  } catch (error) {
    console.error('Error fetching fake payments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create new payment
    const newPayment = fakePaymentsService.createPayment(body);

    return NextResponse.json({
      success: true,
      data: newPayment,
      message: 'Payment created successfully'
    });

  } catch (error) {
    console.error('Error creating fake payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payment' },
      { status: 500 }
    );
  }
}


