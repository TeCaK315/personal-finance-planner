import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { User } from '@/types';

if (!process.env.JWT_SECRET) {
  throw new Error('Please add JWT_SECRET to .env file');
}

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

interface TokenPayload {
  userId: string;
  email: string;
}

export function generateToken(userId: string, email: string): string {
  const payload: TokenPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function getUserFromToken(token: string): Promise<TokenPayload | null> {
  return verifyToken(token);
}