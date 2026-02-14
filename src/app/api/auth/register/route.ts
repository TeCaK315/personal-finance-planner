import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { hashPassword, createSession } from '@/lib/auth';
import { validateUser } from '@/lib/validators';
import type { ApiResponse, User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    const validation = validateUser({ email, password, name });
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error } as ApiResponse<never>,
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'User with this email already exists' } as ApiResponse<never>,
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    const sessionToken = await createSession({
      userId: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
    });

    const user: User = {
      _id: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: { user, sessionToken },
      } as ApiResponse<{ user: User; sessionToken: string }>,
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' } as ApiResponse<never>,
      { status: 500 }
    );
  }
}