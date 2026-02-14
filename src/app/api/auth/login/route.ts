import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { verifyPassword, createSession } from '@/lib/auth';
import type { LoginRequest, ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const userDoc = await usersCollection.findOne({ email: email.toLowerCase() });
    
    if (!userDoc) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, userDoc.password);
    
    if (!isPasswordValid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 });
    }

    const user: User = {
      _id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.name,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt
    };

    const sessionId = await createSession({
      id: user._id,
      email: user.email,
      name: user.name
    });

    const response = NextResponse.json<ApiResponse>({
      success: true,
      data: { user, sessionId }
    });

    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      error: 'Internal server error during login'
    }, { status: 500 });
  }
}