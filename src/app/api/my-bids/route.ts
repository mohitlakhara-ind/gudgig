import { NextRequest, NextResponse } from 'next/server';
import { bidService } from '@/services/bidService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo_user';
    
    console.log('Getting bids for user:', userId);
    
    // Get bids for the user
    const userBids = bidService.getBidsByUser(userId);
    
    // Get bid statistics
    const stats = bidService.getBidStats();
    
    console.log('Found bids:', userBids.length);
    
    return NextResponse.json({
      success: true,
      data: userBids,
      count: userBids.length,
      stats: {
        totalBids: stats.totalBids,
        pendingBids: stats.pendingBids,
        acceptedBids: stats.acceptedBids,
        rejectedBids: stats.rejectedBids,
        totalRevenue: stats.totalRevenue
      }
    });

  } catch (error) {
    console.error('Error fetching user bids:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch bids' },
      { status: 500 }
    );
  }
}
