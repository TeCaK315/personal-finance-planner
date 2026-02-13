import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import type { ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const now = new Date();

    const result = await usersCollection.insertOne({
      email,
      name,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    const user: User = {
      _id: result.insertedId.toString(),
      email,
      name,
      createdAt: now,
      updatedAt: now,
    };

    const token = generateToken(user._id, user.email);

    const response = NextResponse.json<ApiResponse<{ user: User; token: string }>>(
      { success: true, data: { user, token } },
      { status: 201 }
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
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}