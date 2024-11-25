import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { createMiddleware } from '@/lib/i18n-middleware';

const i18nMiddleware = createMiddleware({
  locales: ['en', 'hi', 'fr', 'es', 'ar'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export async function middleware(request: NextRequest) {
  // Add security headers
  const response = NextResponse.next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.razorpay.com https://maps.googleapis.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.razorpay.com https://maps.googleapis.com; frame-src https://checkout.razorpay.com;"
  );
  response.headers.set(
    'Permissions-Policy',
    'camera=self, microphone=self, geolocation=self'
  );

  // Handle i18n
  const i18nResponse = await i18nMiddleware(request);
  if (i18nResponse) return i18nResponse;

  // Check auth for protected routes
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                    request.nextUrl.pathname.startsWith('/signup');
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/verify') || 
                          request.nextUrl.pathname.startsWith('/profile') ||
                          request.nextUrl.pathname.startsWith('/settings') ||
                          request.nextUrl.pathname.startsWith('/admin');
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  // If trying to access protected route without auth, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access admin routes without admin role
  if (isAdminRoute && (!token || !['ADMIN', 'OWNER'].includes(token.role as string))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access auth pages while logged in, redirect to home
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};