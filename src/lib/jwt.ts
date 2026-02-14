import jwt from 'jsonwebtoken';
import { JWTPayload, AuthTokens } from '@/types';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export async function generateToken(userId: string, email: string): Promise<AuthTokens> {
  const accessToken = jwt.sign(
    { userId, email } as JWTPayload,
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { userId, email } as JWTPayload,
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN }
  );

  const db = await getDb();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await db.collection('refresh_tokens').insertOne({
    userId: new ObjectId(userId),
    token: refreshToken,
    expiresAt,
    createdAt: new Date(),
  });

  const expiresIn = 15 * 60;

  return {
    accessToken,
    refreshToken,
    expiresIn,
  };
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function refreshToken(refreshTokenString: string): Promise<{ accessToken: string; expiresIn: number } | null> {
  try {
    const decoded = jwt.verify(refreshTokenString, JWT_REFRESH_SECRET) as JWTPayload;

    const db = await getDb();
    const tokenDoc = await db.collection('refresh_tokens').findOne({
      token: refreshTokenString,
      userId: new ObjectId(decoded.userId),
    });

    if (!tokenDoc) {
      return null;
    }

    if (new Date() > tokenDoc.expiresAt) {
      await db.collection('refresh_tokens').deleteOne({ _id: tokenDoc._id });
      return null;
    }

    const accessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email } as JWTPayload,
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    const expiresIn = 15 * 60;

    return { accessToken, expiresIn };
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}