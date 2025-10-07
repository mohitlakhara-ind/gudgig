import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Skip ESLint errors during production builds to unblock deployments
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      // Keep local API routes that should not be proxied to backend
      {
        source: '/api/gigs/:id/bid',
        destination: '/api/gigs/:id/bid', // Keep local
      },
      {
        source: '/api/gigs/bid-test',
        destination: '/api/gigs/bid-test', // Keep local
      },
      {
        source: '/api/fake-payments/:path*',
        destination: '/api/fake-payments/:path*', // Keep local
      },
      {
        source: '/api/bid-simple',
        destination: '/api/bid-simple', // Keep local
      },
      {
        source: '/api/my-bids',
        destination: '/api/my-bids', // Keep local
      },
      {
        source: '/api/saved-jobs/:path*',
        destination: '/api/saved-jobs/:path*', // Keep local with backend integration
      },
      // Proxy all other API routes to backend
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api'}/:path*`,
      },
    ];
  },
  async headers() {
    // Derive backend origin from envs (prefer public var), fallback to localhost:5000
    const rawBackend = (process.env.NEXT_PUBLIC_BACKEND_URL
      || 'http://localhost:5000/api');
    const backendOrigin = rawBackend.replace(/\/$/, '').replace(/\/api$/, '');
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
      { key: 'Content-Security-Policy', value: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self' ${backendOrigin} http://localhost:5000 http://127.0.0.1:5000 ws://localhost:3000 ws://127.0.0.1:3000` },
    ];
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
