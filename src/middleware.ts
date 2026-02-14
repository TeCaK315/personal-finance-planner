import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

const protectedRoutes = [
  '/dashboard',
  '/budgets',
  '/transactions',
  '/recommendations',
  '/analytics',
  '/api/budgets',
  '/api/transactions',
  '/api/categories',
  '/api/recommendations',
  '/api/analytics',
  '/api/alerts',
  '/api/auth/me',
  '/api/auth/logout',
];

const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth-token')?.value;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute) {
    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    const payload = verifyToken(token);
    if (!payload) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth-token');
      return response;
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId);
    requestHeaders.set('x-user-email', payload.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  if (isAuthRoute && token) {
    const payload = verifyToken(token);
    if (payload) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/budgets/:path*',
    '/transactions/:path*',
    '/recommendations/:path*',
    '/analytics/:path*',
    '/api/budgets/:path*',
    '/api/transactions/:path*',
    '/api/categories/:path*',
    '/api/recommendations/:path*',
    '/api/analytics/:path*',
    '/api/alerts/:path*',
    '/api/auth/me',
    '/api/auth/logout',
    '/login',
    '/register',
  ],
};