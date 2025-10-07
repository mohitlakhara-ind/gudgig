import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real application, this would fetch from your database or environment variables
    const config = {
      platformName: 'Gigs Mint',
      platformDescription: 'Professional freelancer marketplace connecting talented freelancers with clients seeking quality work.',
      contactEmail: 'support@gigsmint.com',
      contactPhone: '+1 (555) 123-4567',
      address: '123 Business Street, Suite 100, City, State 12345',
      socialLinks: {
        twitter: 'https://twitter.com/gigsmint',
        linkedin: 'https://linkedin.com/company/gigsmint',
        facebook: 'https://facebook.com/gigsmint',
        instagram: 'https://instagram.com/gigsmint',
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


