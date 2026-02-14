import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import { generateToken } from '@/lib/jwt';
import { registerSchema } from '@/lib/validators';
import type { User, ApiResponse, AuthTokens } from '@/types';

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
    const usersCollection = db.collection<User>('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const newUser: Omit<User, '_id'> = {
      email,
      name,
      passwordHash,
      createdAt: new Date(),
      updatedAt: new Date(),
      preferences: {
        currency: 'USD',
        language: 'en',
        notifications: true,
      },
    };

    const result = await usersCollection.insertOne(newUser as User);
    const userId = result.insertedId.toString();

    const { accessToken, refreshToken, expiresIn } = generateToken(userId, email);

    const userResponse = {
      _id: userId,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
      preferences: newUser.preferences,
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
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}