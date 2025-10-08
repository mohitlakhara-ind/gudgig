import { NextRequest, NextResponse } from 'next/server';

// Mock data for job alerts - in a real app, this would come from a database
const mockJobAlerts = [
  {
    _id: '1',
    name: 'Frontend Developer Jobs',
    keyword: 'React, TypeScript, Frontend',
    category: 'full-time',
    location: 'San Francisco, CA',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    lastTriggered: '2024-01-20T09:00:00Z',
    matchCount: 5
  },
  {
    _id: '2',
    name: 'Remote Python Jobs',
    keyword: 'Python, Django, FastAPI',
    category: 'remote',
    location: 'Remote',
    isActive: true,
    createdAt: '2024-01-10T14:30:00Z',
    lastTriggered: '2024-01-19T08:00:00Z',
    matchCount: 3
  },
  {
    _id: '3',
    name: 'DevOps Engineer Positions',
    keyword: 'AWS, Docker, Kubernetes',
    category: 'contract',
    location: 'New York, NY',
    isActive: false,
    createdAt: '2024-01-05T16:45:00Z',
    lastTriggered: null,
    matchCount: 1
  }
];

// GET /api/app-api/job-alerts - Get user's job alerts
export async function GET(request: NextRequest) {
  try {
    // In a real app, you would fetch from database filtered by userId
    // For now, return mock data
    return NextResponse.json({
      success: true,
      message: 'Job alerts retrieved successfully',
      data: {
        alerts: mockJobAlerts
      }
    });
  } catch (error) {
    console.error('Error fetching job alerts:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/app-api/job-alerts - Create a new job alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, category, location } = body;

    // Validate required fields
    if (!keyword) {
      return NextResponse.json(
        { success: false, message: 'Keyword is required' },
        { status: 400 }
      );
    }

    // Create new alert
    const newAlert = {
      _id: Date.now().toString(),
      name: `${keyword} Alert`,
      keyword,
      category: category || 'all',
      location: location || 'Any',
      isActive: true,
      createdAt: new Date().toISOString(),
      lastTriggered: null,
      matchCount: 0
    };

    // In a real app, you would save to database
    mockJobAlerts.push(newAlert);

    return NextResponse.json({
      success: true,
      message: 'Job alert created successfully',
      data: newAlert
    });
  } catch (error) {
    console.error('Error creating job alert:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


