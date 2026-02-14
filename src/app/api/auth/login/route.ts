import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyPassword, generateToken } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';
import type { User, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const userDoc = await usersCollection.findOne({ email });
    if (!userDoc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, userDoc.password);
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid email or password' },
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

    const token = generateToken({ userId: user._id, email: user.email });

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