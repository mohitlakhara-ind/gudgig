import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Bid simple API route called');
    
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    // Extract gigId from the request (we'll need to pass this from frontend)
    const gigId = body.gigId || 'unknown_gig';
    const userId = body.userId || 'demo_user';
    
    // Create a simple bid object without using the service for now
    const newBid = {
      _id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      jobId: gigId,
      userId: userId,
      quotation: body.quotation,
      proposal: body.proposal,
      bidFeePaid: body.bidFeePaid || 0,
      paymentStatus: 'succeeded',
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    console.log('Created bid:', newBid);
    
    // Store in localStorage (client-side will handle this)
    // For now, just return the bid data
    
    return NextResponse.json({
      success: true,
      message: 'Bid submitted successfully (demo mode)',
      data: newBid
    });

  } catch (error) {
    console.error('Error in bid simple API:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
