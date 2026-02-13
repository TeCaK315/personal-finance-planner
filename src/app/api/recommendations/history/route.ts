import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';
import { getUserFromToken } from '@/lib/auth';
import type { ApiResponse, AIRecommendation } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');

    const db = await getDb();
    const recommendationsCollection = db.collection('recommendations');

    const filter: Record<string, unknown> = { userId: user._id };
    if (category) filter.category = category;

    const docs = await recommendationsCollection
      .find(filter)
      .sort({ generatedAt: -1 })
      .limit(limit)
      .toArray();

    const recommendations: AIRecommendation[] = docs.map((doc) => ({
      _id: doc._id.toString(),
      userId: doc.userId,
      title: doc.title,
      description: doc.description,
      category: doc.category,
      priority: doc.priority,
      actionItems: doc.actionItems,
      impact: doc.impact,
      generatedAt: doc.generatedAt,
      isRead: doc.isRead,
    }));

    return NextResponse.json<ApiResponse<AIRecommendation[]>>(
      { success: true, data: recommendations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get recommendations history error:', error);
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}