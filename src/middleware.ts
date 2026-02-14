import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('accessToken')?.value || request.headers.get('authorization')?.replace('Bearer ', '');

  const protectedPaths = ['/dashboard', '/budgets', '/transactions', '/reports', '/recommendations', '/settings'];
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtectedPath) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/budgets/:path*',
    '/transactions/:path*',
    '/reports/:path*',
    '/recommendations/:path*',
    '/settings/:path*',
    '/api/budgets/:path*',
    '/api/transactions/:path*',
    '/api/categories/:path*',
    '/api/reports/:path*',
    '/api/ai/:path*',
    '/api/user/:path*',
  ],
};