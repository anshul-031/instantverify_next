import { NextRequest, NextResponse } from 'next/server';

interface MiddlewareConfig {
  locales: string[];
  defaultLocale: string;
  localePrefix?: 'as-needed' | 'always' | 'never';
}

export function createMiddleware(config: MiddlewareConfig) {
  return async function middleware(request: NextRequest) {
    const { locales, defaultLocale, localePrefix = 'as-needed' } = config;
    const pathname = request.nextUrl.pathname;

    // Check if the pathname starts with a locale
    const pathnameHasLocale = locales.some(
      locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    // Get locale from cookie, header, or default
    let locale = request.cookies.get('NEXT_LOCALE')?.value ||
      request.headers.get('Accept-Language')?.split(',')[0].split('-')[0] ||
      defaultLocale;

    // Ensure the locale is supported
    if (!locales.includes(locale)) {
      locale = defaultLocale;
    }

    // Handle locale prefix strategy
    if (localePrefix === 'never') {
      return NextResponse.next();
    }

    if (localePrefix === 'always' && !pathnameHasLocale) {
      // Redirect to add locale prefix
      return NextResponse.redirect(
        new URL(`/${locale}${pathname}`, request.url)
      );
    }

    if (localePrefix === 'as-needed') {
      // Only add locale prefix if it differs from default
      if (locale !== defaultLocale && !pathnameHasLocale) {
        return NextResponse.redirect(
          new URL(`/${locale}${pathname}`, request.url)
        );
      }
    }

    return NextResponse.next();
  };
}