/**
 * Backend URL utility functions
 * Provides consistent URL handling across the application
 */

/**
 * Get the backend base URL with proper fallbacks and normalization
 * @param includeApi - Whether to include '/api' in the URL (default: true)
 * @returns Normalized backend URL
 */
export function getBackendUrl(includeApi: boolean = true): string {
  const backendOrigin = (process.env.NEXT_PUBLIC_BACKEND_URL || '').trim();
  const apiPathFromEnv = (process.env.NEXT_PUBLIC_API_URL || '').trim();

  // Helper to join URL parts with a single slash boundary
  const joinUrl = (base: string, path: string): string => {
    if (!path) return base;
    const left = base.replace(/\/$/, '');
    const right = path.replace(/^\//, '');
    return `${left}/${right}`;
  };

  if (!backendOrigin) {
    // Development fallback
    const fallbackOrigin = 'http://localhost:5000';
    console.warn('NEXT_PUBLIC_BACKEND_URL not set, using fallback:', fallbackOrigin);
    const defaultApiPath = apiPathFromEnv || '/api';
    return includeApi ? joinUrl(fallbackOrigin, defaultApiPath) : fallbackOrigin;
  }

  // Normalize origin (remove trailing slashes and optional /api suffix if present)
  let normalizedOrigin = backendOrigin.replace(/\/+$/, '').replace(/\/api$/, '');

  if (!includeApi) return normalizedOrigin;

  // If NEXT_PUBLIC_API_URL provided, prefer it; else default to '/api'
  const apiPath = apiPathFromEnv || '/api';
  return joinUrl(normalizedOrigin, apiPath);
}

/**
 * Get the backend WebSocket URL
 * @returns WebSocket URL for Socket.io connections
 */
export function getBackendWsUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_WS_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  
  if (!envUrl) {
    // Development fallback
    const fallback = 'http://localhost:5000';
    console.warn('NEXT_PUBLIC_BACKEND_URL not set, using fallback for WebSocket:', fallback);
    return fallback;
  }
  
  // Normalize the URL for WebSocket
  let normalizedUrl = envUrl.trim();
  
  // Remove trailing slashes
  normalizedUrl = normalizedUrl.replace(/\/+$/, '');
  
  // Remove /api suffix if present (WebSocket doesn't need it)
  normalizedUrl = normalizedUrl.replace(/\/api$/, '');
  
  return normalizedUrl;
}

/**
 * Validate that the backend URL is properly configured
 * @returns true if valid, false otherwise
 */
export function validateBackendUrl(): boolean {
  const url = process.env.NEXT_PUBLIC_BACKEND_URL;
  
  if (!url) {
    console.error('NEXT_PUBLIC_BACKEND_URL environment variable is not set');
    return false;
  }
  
  try {
    new URL(url);
    return true;
  } catch {
    console.error('NEXT_PUBLIC_BACKEND_URL is not a valid URL:', url);
    return false;
  }
}

/**
 * Get backend URL for specific endpoint
 * @param endpoint - The endpoint path (e.g., '/auth/login')
 * @param includeApi - Whether to include '/api' in the base URL (default: true)
 * @returns Full URL for the endpoint
 */
export function getBackendEndpointUrl(endpoint: string, includeApi: boolean = true): string {
  const baseUrl = getBackendUrl(includeApi);
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
}


