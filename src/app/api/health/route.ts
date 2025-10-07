import { NextResponse } from 'next/server';
import { log } from '@/lib/logger';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api').replace(/\/$/, '').replace(/\/?api$/, '');

export async function GET() {
  try {
    log.info('health_check_start', { backendUrl: BACKEND_URL });
    
    const response = await fetch(`${BACKEND_URL}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    log.debug('health_check_backend_status', { status: response.status });
    
    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        success: true,
        message: 'Backend is healthy',
        backend: data,
        frontend: {
          timestamp: new Date().toISOString(),
          environment: process.env.NODE_ENV,
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Backend is not responding properly',
        status: response.status,
        backendUrl: BACKEND_URL
      }, { status: 503 });
    }
  } catch (error: any) {
    log.error('health_check_error', { error: error?.message || String(error) });
    return NextResponse.json({
      success: false,
      message: 'Backend connection failed',
      error: error?.message,
      backendUrl: BACKEND_URL
    }, { status: 503 });
  }
}
