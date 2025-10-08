import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock data - in a real app, this would come from a database
// This should be the same data structure as in the main route
let mockJobAlerts = [
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

// DELETE /api/app-api/job-alerts/[alertId] - Delete a job alert
export async function DELETE(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { alertId } = params;

    if (!alertId) {
      return NextResponse.json(
        { success: false, message: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Find the alert
    const alertIndex = mockJobAlerts.findIndex(alert => alert._id === alertId);
    
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Job alert not found' },
        { status: 404 }
      );
    }

    // Remove the alert
    mockJobAlerts.splice(alertIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Job alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job alert:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/app-api/job-alerts/[alertId] - Update a job alert
export async function PUT(
  request: NextRequest,
  { params }: { params: { alertId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { alertId } = params;
    const body = await request.json();

    if (!alertId) {
      return NextResponse.json(
        { success: false, message: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Find the alert
    const alertIndex = mockJobAlerts.findIndex(alert => alert._id === alertId);
    
    if (alertIndex === -1) {
      return NextResponse.json(
        { success: false, message: 'Job alert not found' },
        { status: 404 }
      );
    }

    // Update the alert
    mockJobAlerts[alertIndex] = {
      ...mockJobAlerts[alertIndex],
      ...body,
      _id: alertId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Job alert updated successfully',
      data: mockJobAlerts[alertIndex]
    });
  } catch (error) {
    console.error('Error updating job alert:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}


