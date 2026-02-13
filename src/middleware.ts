import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const protectedRoutes = [
  '/dashboard',
  '/transactions',
  '/budget',
  '/recommendations',
  '/api/transactions',
  '/api/budget',
  '/api/recommendations',
  '/api/analytics',
  '/api/auth/me',
];

const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const decoded = verifyToken(token);
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId);
      requestHeaders.set('x-user-email', decoded.email);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } catch (error) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  if (isAuthRoute && token) {
    try {
      verifyToken(token);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (error) {
      const response = NextResponse.next();
      response.cookies.delete('token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/transactions/:path*',
    '/budget/:path*',
    '/recommendations/:path*',
    '/api/transactions/:path*',
    '/api/budget/:path*',
    '/api/recommendations/:path*',
    '/api/analytics/:path*',
    '/api/auth/me',
    '/login',
    '/register',
  ],
};