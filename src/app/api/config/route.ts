import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real application, this would fetch from your database or environment variables
    const config = {
      platformName: 'Gudgig',
      platformDescription: 'Professional freelancer marketplace connecting talented freelancers with clients seeking quality work.',
      contactEmail: 'support@gudgig.com',
      contactPhone: '+1 (555) 123-4567',
      address: '123 Business Street, Suite 100, City, State 12345',
      socialLinks: {
        twitter: 'https://twitter.com/gudgig',
        linkedin: 'https://linkedin.com/company/gudgig',
        facebook: 'https://facebook.com/gudgig',
        instagram: 'https://instagram.com/gudgig',
      },
      features: {
        guestBrowsing: true,
        bidFees: true,
        messaging: true,
        notifications: true,
      },
    };

    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configuration' },
      { status: 500 }
    );
  }
}


