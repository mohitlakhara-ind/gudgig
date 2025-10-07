import { NextResponse } from 'next/server';
import { fakePaymentsService } from '@/services/fakePaymentsService';

export async function GET() {
  try {
    const stats = fakePaymentsService.getPaymentStats();

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching payment stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment statistics' },
      { status: 500 }
    );
  }
}


