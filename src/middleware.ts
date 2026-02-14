import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const publicPaths = ['/', '/login', '/register'];
const authPaths = ['/login', '/register'];

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'fallback-secret-key-for-development';
  return new TextEncoder().encode(secret);
}

async function verifyAuth(token: string): Promise<boolean> {
  try {
    const verified = await jwtVerify(token, getSecretKey());
    const payload = verified.payload as any;
    
    if (!payload.expiresAt) return false;
    
    const expiresAt = new Date(payload.expiresAt);
    if (expiresAt < new Date()) return false;
    
    return true;
  } catch (error) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const sessionToken = request.cookies.get('session')?.value;
  const isAuthenticated = sessionToken ? await verifyAuth(sessionToken) : false;

  const isPublicPath = publicPaths.includes(pathname);
  const isAuthPath = authPaths.includes(pathname);

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isPublicPath && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};