import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyPassword, generateToken } from '@/lib/auth';
import type { ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Missing email or password' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const userDoc = await usersCollection.findOne({ email });
    if (!userDoc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, userDoc.password);
    if (!isValid) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user: User = {
      _id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.name,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };

    const token = generateToken(user._id, user.email);

    const response = NextResponse.json<ApiResponse<{ user: User; token: string }>>(
      { success: true, data: { user, token } },
      { status: 200 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}