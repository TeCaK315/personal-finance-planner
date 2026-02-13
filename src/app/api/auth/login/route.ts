import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyPassword, generateToken } from '@/lib/auth';
import { LoginRequest, ApiResponse, AuthResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const userDoc = await usersCollection.findOne({ email: email.toLowerCase() });
    if (!userDoc) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await verifyPassword(password, userDoc.password);
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user: User = {
      _id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.name,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt
    };

    const token = generateToken({
      userId: user._id,
      email: user.email
    });

    const response: AuthResponse = {
      user,
      token
    };

    return NextResponse.json<ApiResponse<AuthResponse>>(
      { success: true, data: response },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}