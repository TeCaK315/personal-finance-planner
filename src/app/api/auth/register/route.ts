import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword, generateToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validators';
import type { User, ApiResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password, name } = validation.data;

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const result = await usersCollection.insertOne({
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const user: User = {
      _id: result.insertedId.toString(),
      email,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const token = generateToken({ userId: user._id, email: user.email });

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