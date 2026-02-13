import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import { RegisterRequest, ApiResponse, AuthResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Name, email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const now = new Date();

    const result = await usersCollection.insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: now,
      updatedAt: now
    });

    const user: User = {
      _id: result.insertedId.toString(),
      email: email.toLowerCase(),
      name,
      createdAt: now,
      updatedAt: now
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
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}