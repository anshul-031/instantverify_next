import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { rateLimit } from './lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export default withAuth(
  async function middleware(req) {
    // Rate limiting
    try {
      await limiter.check(req, 100); // 100 requests per minute
    } catch {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    // Add security headers
    const response = NextResponse.next();
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    );
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.razorpay.com;"
    );
    response.headers.set(
      'Permissions-Policy',
      'camera=self, microphone=(), geolocation=()'
    );

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/verify/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/report/:path*',
    '/api/verify/:path*',
    '/api/profile/:path*',
    '/api/settings/:path*',
    '/api/report/:path*',
  ],
};