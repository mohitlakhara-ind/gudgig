import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Implement testimonials API endpoint in backend
    // For now, return empty array as testimonials feature is not yet implemented
    const testimonials: any[] = [];

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch testimonials' },
      { status: 500 }
    );
  }
}


