import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real application, this would fetch from your database
    // For now, we'll return mock data that could be coming from your backend
    const stats = {
      activeGigs: 127,
      totalFreelancers: 1250,
      successRate: 98,
      totalRevenue: 125000,
      totalBids: 3420,
      pendingBids: 156,
      acceptedBids: 2890,
      rejectedBids: 374,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}


