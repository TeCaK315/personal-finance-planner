import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { getDb } from './mongodb';
import { ObjectId } from 'mongodb';
import { SessionUser } from '@/types';
import { cookies } from 'next/headers';

const SESSION_SECRET = process.env.SESSION_SECRET || 'your-secret-key-change-in-production';
const SECRET_KEY = new TextEncoder().encode(SESSION_SECRET);

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createSession(userId: string, email: string, name: string): Promise<string> {
  const db = await getDb();
  
  const sessionId = new ObjectId().toString();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.collection('sessions').insertOne({
    _id: new ObjectId(),
    userId: new ObjectId(userId),
    sessionId,
    expiresAt,
    createdAt: new Date(),
  });

  const token = await new SignJWT({ 
    sessionId, 
    userId, 
    email, 
    name 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(SECRET_KEY);

  const cookieStore = cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return sessionId;
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, SECRET_KEY);
    const payload = verified.payload as any;

    const db = await getDb();
    const session = await db.collection('sessions').findOne({
      sessionId: payload.sessionId,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
      return null;
    }

    return {
      id: payload.userId,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('session')?.value;

    if (token) {
      const verified = await jwtVerify(token, SECRET_KEY);
      const payload = verified.payload as any;

      const db = await getDb();
      await db.collection('sessions').deleteOne({
        sessionId: payload.sessionId,
      });
    }

    cookieStore.delete('session');
  } catch (error) {
    const cookieStore = cookies();
    cookieStore.delete('session');
  }
}