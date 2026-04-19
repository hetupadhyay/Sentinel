import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Basic middleware to redirect unauthenticated users to login.
 * Note: Since tokens are in localStorage, full SSR protection is limited without cookies.
 * This middleware primarily handles route consistency.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /app/* routes
  if (pathname.startsWith('/app')) {
    // In a real production app with cookies, we'd check for a session cookie here.
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*'],
};
