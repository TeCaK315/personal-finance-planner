import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { hashPassword, createSession } from '@/lib/auth';
import { validateUser } from '@/lib/validators';
import type { RegisterRequest, ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    
    const validation = validateUser(body);
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: validation.error || 'Invalid input data'
      }, { status: 400 });
    }

    const { email, password, name } = body;

    const db = await getDb();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'User with this email already exists'
      }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await usersCollection.insertOne(newUser);

    const user: User = {
      _id: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt
    };

    const sessionId = await createSession({
      id: user._id,
      email: user.email,
      name: user.name
    });

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: { user, sessionId }
    }, { status: 201 });

    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during registration'
    }, { status: 500 });
  }
}