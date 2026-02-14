import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { verifyToken } from '@/lib/jwt';
import type { User, ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(payload.userId) });

    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userResponse = {
      _id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferences: user.preferences,
    } as Omit<User, 'passwordHash'>;

    return NextResponse.json<ApiResponse<Omit<User, 'passwordHash'>>>(
      {
        success: true,
        data: userResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, preferences } = body;

    const db = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (name) updateData.name = name;
    if (preferences) updateData.preferences = preferences;

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(payload.userId) },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const userResponse = {
      _id: result._id.toString(),
      email: result.email,
      name: result.name,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      preferences: result.preferences,
    } as Omit<User, 'passwordHash'>;

    return NextResponse.json<ApiResponse<Omit<User, 'passwordHash'>>>(
      {
        success: true,
        data: userResponse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}