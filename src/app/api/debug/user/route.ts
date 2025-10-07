import { NextRequest, NextResponse } from 'next/server';
import { log } from '@/lib/logger';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '').replace(/\/?api$/, '');

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    log.debug('debug_user_request', { hasAuthHeader: !!authHeader, backendUrl: BACKEND_URL });
    
    if (!authHeader) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No authorization header',
          debug: {
            hasAuthHeader: false,
            backendUrl: BACKEND_URL
          }
        },
        { status: 401 }
      );
    }

    log.debug('debug_user_forward_backend_start');
    
    // Forward the request to the backend
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    log.debug('debug_user_backend_status', { status: response.status });
    
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        ...data,
        debug: {
          hasAuthHeader: true,
          backendUrl: BACKEND_URL,
          responseStatus: response.status
        }
      }, { status: response.status });
    }

    return NextResponse.json({
      ...data,
      debug: {
        hasAuthHeader: true,
        backendUrl: BACKEND_URL,
        responseStatus: response.status
      }
    });
  } catch (error: any) {
    log.error('debug_user_error', { error: error?.message || String(error) });
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error',
        error: error?.message,
        debug: {
          hasAuthHeader: !!request.headers.get('authorization'),
          backendUrl: BACKEND_URL,
          errorType: error?.constructor?.name
        }
      },
      { status: 500 }
    );
  }
}


