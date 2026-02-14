import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { generateToken } from '@/lib/jwt';
import { loginSchema } from '@/lib/validators';
import type { User, ApiResponse, AuthTokens } from '@/types';

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
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ email });
    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userId = user._id.toString();
    const { accessToken, refreshToken, expiresIn } = generateToken(userId, user.email);

    const userResponse = {
      _id: userId,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: user.preferences,
    } as Omit<User, 'passwordHash'>;

    const tokens: AuthTokens = {
      accessToken,
      refreshToken,
      expiresIn,
    };

    return NextResponse.json<ApiResponse<{ user: Omit<User, 'passwordHash'>; tokens: AuthTokens }>>(
      {
        success: true,
        data: {
          user: userResponse,
          tokens,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}