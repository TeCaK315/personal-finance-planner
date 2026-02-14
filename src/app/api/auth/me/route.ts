import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import type { User, ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(request);
    if (!session) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    const userDoc = await usersCollection.findOne({ _id: new ObjectId(session.userId) });
    if (!userDoc) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const user: User = {
      _id: userDoc._id.toString(),
      email: userDoc.email,
      name: userDoc.name,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };

    return NextResponse.json<ApiResponse<User>>(
      { success: true, data: user },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}