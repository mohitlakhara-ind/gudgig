import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // TODO: Implement announcements API endpoint in backend
    // For now, return empty array as announcements feature is not yet implemented
    const announcements: any[] = [];

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}


