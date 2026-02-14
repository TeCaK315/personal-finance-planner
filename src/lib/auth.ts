import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { SessionData } from '@/types';

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000;
const COOKIE_NAME = 'session';

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET is not configured');
  }
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(sessionData: Omit<SessionData, 'expiresAt'>): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  const token = await new SignJWT({
    userId: sessionData.userId,
    email: sessionData.email,
    name: sessionData.name,
    expiresAt: expiresAt.toISOString()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/'
  });

  return token;
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const verified = await jwtVerify(token, getSecretKey());
    const payload = verified.payload as any;

    const expiresAt = new Date(payload.expiresAt);
    if (expiresAt < new Date()) {
      await destroySession();
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      expiresAt
    };
  } catch (error) {
    await destroySession();
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function requireAuth(): Promise<SessionData> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}