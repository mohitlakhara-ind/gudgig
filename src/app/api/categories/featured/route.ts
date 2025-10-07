import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In a real application, this would fetch from your database
    const featuredCategories = [
      { name: 'Web Development', count: 45, icon: '💻' },
      { name: 'Graphic Design', count: 32, icon: '🎨' },
      { name: 'Content Writing', count: 28, icon: '✍️' },
      { name: 'Digital Marketing', count: 24, icon: '📈' },
      { name: 'Mobile Development', count: 19, icon: '📱' },
      { name: 'Data Entry', count: 15, icon: '📊' },
      { name: 'Video Editing', count: 12, icon: '🎬' },
      { name: 'Photography', count: 10, icon: '📸' },
    ];

    return NextResponse.json(featuredCategories);
  } catch (error) {
    console.error('Error fetching featured categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured categories' },
      { status: 500 }
    );
  }
}


